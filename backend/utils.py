from flask import url_for
from config import DATA_IMAGES_PATH, DEFAULT_SORT_SITES
from PIL import Image, ImageFont, ImageDraw, ImageOps, ImageFile
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import json
from flask_babel import get_locale, gettext
import random
import string
import models

db = SQLAlchemy()
ImageFile.LOAD_TRUNCATED_IMAGES = True

dicotheme_schema = models.DicoThemeSchema(many=True)
dicostheme_schema = models.DicoSthemeSchema(many=True)
photo_schema = models.TPhotoSchema(many=True)
observatory_schema = models.ObservatorySchema(many=True)
site_schema = models.TSiteSchema(many=True)
themes_sthemes_schema = models.CorSthemeThemeSchema(many=True)

def getRandStr(nb):
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for i in range(nb))

def getImage(photo, prefixe, callback):
    #here = os.path.dirname(__file__)
    #newPath = './static/' + DATA_IMAGES_PATH
    #base_path = os.path.join(here,newPath)

    base_path = './static/' + DATA_IMAGES_PATH
    input_name = photo.get('path_file_photo')
    input_path = base_path + input_name
    if prefixe:
        output_name = prefixe + '_' + input_name
    else:
        output_name = input_name
    output_path = base_path + output_name
    try:
        image = Image.open(input_path)
    except Exception as exception:
        return {
            'input_exists': False,
            'output_name': '',
            'output_path': '',
            'output_url': url_for('static', filename=DATA_IMAGES_PATH + output_name),
            'image': None
        }
    output_exists = os.path.exists(output_path)

    img = {
        'input_exists': os.path.exists(input_path),
        'output_name': output_name,
        'output_path': output_path,
        'output_url': url_for('static', filename=DATA_IMAGES_PATH + output_name),
        'image': image
    }
    if not(callback is None) and not(output_exists):
        try:
            callback(img)
        except Exception as exception:
            print('getImage Invalid image')
            print(exception)

    return img


def getThumbnail(photo, h = 150):
    def callback(img):
        #initW, initH = image.size
        #ratio = h / initH
        #image.resize((int(initW*ratio), h))
        image = img.get('image')
        image = ImageOps.fit(image, (h, h), Image.ANTIALIAS)
        image.save(img.get('output_path'))
    return getImage(photo, 'thumbnail' + str(h), callback)


def getMedium(photo):
    def callback(img):
        image = img.get('image')
        image.thumbnail((800, 800))
        image.save(img.get('output_path'))
    return getImage(photo, 'medium', callback)


def getLarge(photo, caption):
    h = 1200
    def callback(img):
        image = img.get('image')
        initW, initH = image.size
        ratio = h / initH
        image = image.resize((int(initW*ratio), h), Image.ANTIALIAS)
        image.save(img.get('output_path'))
        addCaption(img, image, caption)
    return getImage(photo, 'large', callback)

def getDownload(photo, caption):
    def callback(img):
        addCaption(img, img.get('image'), caption)
    return getImage(photo, 'download', callback)


def addCaption(img, img_src, text):
    if (not text):
        return
    font = ImageFont.truetype("./static/fonts/openSans.ttf", 16)
    if img.get('input_exists'):
        try:
            width, height = img_src.size
            img_dest = Image.new('RGB', (width, height + 36))
            img_dest.paste(img_src, (0, 0))
            draw = ImageDraw.Draw(img_dest)
            draw.text((10, height + 5), text, font=font, fill=(255, 255, 255, 255))
            img_dest.save(img.get('output_path'))
        except Exception:
            print('addCaption Invalid image')


def getDbConf():
    sql = text("SELECT key, value FROM geopaysages.conf")
    result = db.engine.execute(sql).fetchall()
    rows = [dict(row) for row in result]
    conf = {}
    for row in rows:
        try:
            conf[row.get('key')] = json.loads(row.get('value'))
        except Exception as exception:
            conf[row.get('key')] = row.get('value')
    
    return conf


def isDbPagePublished(name):
    dbconf = getDbConf()

    return dbconf.get('page_' + name + '_published_' + get_locale().__str__(), dbconf.get('page_' + name + '_published')) is True

def isMultiObservatories():
    # Pourrait passer par un count sql
    sql = text("SELECT id FROM geopaysages.t_observatory where is_published is true")
    result = db.engine.execute(sql).fetchall()
    rows = [dict(row) for row in result]
    if len(rows) > 1 :
        return True
    return False

def getDbPage(name):
    dbconf = getDbConf()

    locale = get_locale()
    title_locale = dbconf.get('page_' + name + '_title_' + locale.__str__())
    content_locale = dbconf.get('page_' + name + '_content_' + locale.__str__())

    return {
        'title': title_locale if title_locale else dbconf.get('page_' + name + '_title', ''),
        'content': content_locale if content_locale else dbconf.get('page_' + name + '_content', '')
    }

def getFiltersData():
    sites=site_schema.dump(models.TSite.query.join(models.Observatory).filter(models.TSite.publish_site == True, models.Observatory.is_published == True).order_by(DEFAULT_SORT_SITES))
    for site in sites:
        cor_sthemes_themes = site.get('cor_site_stheme_themes')
        cor_list = []
        themes_list = []
        subthemes_list = []
        for cor in cor_sthemes_themes:
            cor_list.append(cor.get('id_stheme_theme'))
        query = models.CorSthemeTheme.query.filter(
            models.CorSthemeTheme.id_stheme_theme.in_(cor_list))
        themes_sthemes = themes_sthemes_schema.dump(query)

        for item in themes_sthemes:
            if item.get('dico_theme').get('id_theme') not in themes_list:
                themes_list.append(item.get('dico_theme').get('id_theme'))
            if item.get('dico_stheme').get('id_stheme') not in subthemes_list:
                subthemes_list.append(item.get('dico_stheme').get('id_stheme'))

        get_photos_by_site = models.TPhoto.query.filter_by(
            id_site=site.get('id_site'))
        photos = photo_schema.dump(get_photos_by_site)

        site['link'] = url_for('main.site', id_site=site.get('id_site'), _external=True)
        site['latlon'] = site.get('geom')
        site['themes'] = themes_list
        site['subthemes'] = subthemes_list
        site['township'] = site.get('code_city_site')

        site['years'] = set()
        for photo in photos:
            year = str(photo.get('filter_date')).split('-')[0]
            site['years'].add(year)
            photo['year'] = year
        site['years'] = list(site['years'])
        site['photos'] = photos

    subthemes = dicostheme_schema.dump(models.DicoStheme.query.all())
    for sub in subthemes:
        themes_of_subthemes = []
        for item in sub.get('cor_stheme_themes'):
            themes_of_subthemes.append(item.get('id_theme'))
        sub['themes'] = themes_of_subthemes

    filters = [{
        'name': 'themes',
        'label': gettext(u'sites.filter.themes'),
        'items': set()
    }, {
        'name': 'subthemes',
        'label': gettext(u'sites.filter.subthemes'),
        'items': set()
    }, {
        'name': 'township',
        'hideNoMatched': True,
        'label': gettext(u'sites.filter.township'),
        'items': set()
    }, {
        'name': 'years',
        'hideNoMatched': True,
        'label': gettext(u'sites.filter.years'),
        'items': set()
    }]

    for site in sites:
        # Compute the prop years
        site['years'] = set()
        for photo in site.get('photos'):
            site['years'].add(photo.get('year'))
        site['years'] = list(site['years'])

        for filter in filters:
            val = site.get(filter.get('name'))
            if isinstance(val, (list, set)):
                filter.get('items').update(val)
            else:
                filter.get('items').add(val)

    themes = dicotheme_schema.dump(models.DicoTheme.query.all())
    themes = [{
        'id': item['id_theme'],
        'label': item['name_theme'],
        'icon': item['icon'],
    } for item in themes]

    subthemes = [{
        'id': item['id_stheme'],
        'label': item['name_stheme'],
        'themes': item['themes']
    } for item in subthemes]

    filter_township = [
        filter for filter in filters if filter.get('name') == 'township'][0]
    str_map_in = ["'" + township +
                  "'" for township in filter_township.get('items')]
    sql_map_str = "SELECT code_commune AS id, nom_commune AS label FROM geopaysages.communes WHERE code_commune IN (" + ",".join(
        str_map_in) + ")"
    sql_map = text(sql_map_str)
    townships_result = db.engine.execute(sql_map).fetchall()
    townships = [dict(row) for row in townships_result]

    for site in sites:
        site['ville'] = next(township for township in townships if township.get('id') == site.get('township'))
    
    dbs = {
        'themes': themes,
        'subthemes': subthemes,
        'township': townships
    }
    
    photo_ids = []
    sites_without_photo = []
    for site in sites:
        photo_id = site.get('main_photo')
        if photo_id:
            photo_ids.append(site.get('main_photo'))
        else:
            sites_without_photo.append(str(site.get('id_site')))

    query_photos = models.TPhoto.query.filter(
        models.TPhoto.id_photo.in_(photo_ids)
    )
    dump_photos = photo_schema.dump(query_photos)

    if len(sites_without_photo):
        sql_missing_photos_str = "select distinct on (id_site) * from geopaysages.t_photo where id_site IN (" + ",".join(sites_without_photo) + ") order by id_site, filter_date desc"
        sql_missing_photos = text(sql_missing_photos_str)
        missing_photos_result = db.engine.execute(sql_missing_photos).fetchall()
        missing_photos = [dict(row) for row in missing_photos_result]
        for missing_photo in missing_photos:
            missing_photo['t_site'] = missing_photo.get('id_site')
            dump_photos.append(missing_photo)

    for site in sites:
        id_site = site.get('id_site')
        try:
            photo = next(photo for photo in dump_photos if (photo.get('t_site') == id_site))
            site['photo'] = photo.get('path_file_photo') #getThumbnail(photo).get('output_url')
        except StopIteration:
            pass

    def getItem(name, id):
        return next(item for item in dbs.get(name) if item.get('id') == id)

    for filter in filters:
        if (filter.get('name') == 'years'):
            filter['items'] = [{
                'label': str(year),
                'id': year
            } for year in filter.get('items')]
            filter['items'] = sorted(filter['items'], key=lambda k: k['label'], reverse=True)
        else:
            filter['items'] = [getItem(filter.get('name'), item_id)
                               for item_id in filter.get('items')]
            filter['items'] = sorted(filter['items'], key=lambda k: k['label'])

    observatories = []
    for site in sites:
        try:
            next((item for item in observatories if item["id"] == site['id_observatory']))
        except StopIteration:
            observatory_row = models.Observatory.query.filter_by(id = site['id_observatory'])
            observatory=observatory_schema.dump(observatory_row)
            observatory=observatory[0]
            observatories.append({
                'id': site['id_observatory'],
                'label': site['observatory']['title'],
                'data': {
                    'geom': observatory['geom'],
                    'color': observatory['color'],
                    'logo': observatory['logo'] #url_for('static', filename=DATA_IMAGES_PATH + observatory['logo'])
                }
            })

    if len(observatories) > 1:
        filters.insert(0, {
            'name': 'id_observatory',
            'label': gettext(u'sites.filter.obervatories'),
            'items': observatories
        })

    return {
        'filters': filters,
        'sites': sites,
        'observatories': observatories
    }