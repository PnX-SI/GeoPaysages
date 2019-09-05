from flask import Flask, render_template, redirect, Blueprint, jsonify, url_for, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import models
import utils
import random
from models import (db)
from config import DATA_IMAGES_PATH, IGN_KEY
import json
from datetime import datetime
from flask_babel import format_datetime, gettext, ngettext

main = Blueprint('main', __name__, template_folder='tpl')

db = SQLAlchemy()

dicotheme_schema = models.DicoThemeSchema(many=True)
dicostheme_schema = models.DicoSthemeSchema(many=True)
photo_schema = models.TPhotoSchema(many=True)
site_schema = models.TSiteSchema(many=True)
themes_sthemes_schema = models.CorSthemeThemeSchema(many=True)
villes_schema = models.VilleSchema(many=True)
communes_schema = models.CommunesSchema(many=True)



@main.route('/')
def home():
    """ sql = text("SELECT value FROM geopaysages.conf WHERE key = 'home_blocks'")
    rows = db.engine.execute(sql).fetchall()
    id_photos = json.loads(rows[0]['value'])
    get_photos = models.TPhoto.query.filter(
        models.TPhoto.id_photo.in_(id_photos))
    dump_pĥotos = photo_schema.dump(get_photos).data

    site_ids = [photo.get('t_site') for photo in dump_pĥotos]
    get_sites = models.TSite.query.filter(models.TSite.id_site.in_(site_ids))
    dump_sites = site_schema.dump(get_sites).data """

    sql = text("SELECT * FROM geopaysages.t_site where publish_site=true ORDER BY RANDOM() LIMIT 6")
    sites_proxy = db.engine.execute(sql).fetchall()
    sites = [dict(row.items()) for row in sites_proxy]
    diff_nb = 6 - len(sites)
    for x in range(0, diff_nb):
        sites.append(sites[x])

    photo_ids = []
    sites_without_photo = []
    code_communes = []
    for site in sites:
        photo_id = site.get('main_photo')
        if photo_id:
            photo_ids.append(site.get('main_photo'))
        else:
            sites_without_photo.append(str(site.get('id_site')))
        code_communes.append(site.get('code_city_site'))

    query_photos = models.TPhoto.query.filter(
        models.TPhoto.id_photo.in_(photo_ids)
    )
    dump_photos = photo_schema.dump(query_photos).data

    if len(sites_without_photo):
        sql_missing_photos_str = "select distinct on (id_site) * from geopaysages.t_photo where id_site IN (" + ",".join(sites_without_photo) + ") order by id_site, filter_date desc"
        sql_missing_photos = text(sql_missing_photos_str)
        missing_photos_result = db.engine.execute(sql_missing_photos).fetchall()
        missing_photos = [dict(row) for row in missing_photos_result]
        for missing_photo in missing_photos:
            missing_photo['t_site'] = missing_photo.get('id_site')
            dump_photos.append(missing_photo)

    query_commune = models.Communes.query.filter(
        models.Communes.code_commune.in_(code_communes)
    )
    dump_communes = communes_schema.dump(query_commune).data

    for site in sites:
        id_site = site.get('id_site')
        photo = next(photo for photo in dump_photos if (photo.get('t_site') == id_site))
        site['photo'] = utils.getMedium(photo).get('output_url')
        site['commune'] = next(commune for commune in dump_communes if (commune.get('code_commune') == site.get('code_city_site')))


    """ def get_photo_block(id_photo):
        try:
            photo = next(photo for photo in dump_pĥotos if photo.get(
                'id_photo') == id_photo)
            photo['url'] = url_for(
                'static', filename=DATA_IMAGES_PATH + photo.get('path_file_photo'))
            site = next(site for site in dump_sites if site.get(
                'id_site') == photo.get('t_site'))
            return {
                'photo': photo,
                'site': site
            }
        except Exception as exception:
            pass

    blocks = [
        get_photo_block(id_photo)
        for id_photo in id_photos
    ] """

    all_sites=site_schema.dump(models.TSite.query.filter_by(publish_site = True)).data
    
    return render_template('home.html', blocks=sites, sites=all_sites)

@main.route('/gallery')
def gallery():
    get_sites = models.TSite.query.filter_by(publish_site = True).order_by('name_site')
    dump_sites = site_schema.dump(get_sites).data
    
    #TODO get photos and cities by join on sites query
    photo_ids = []
    sites_without_photo = []
    ville_codes = []
    for site in dump_sites:
        photo_id = site.get('main_photo')
        if photo_id:
            photo_ids.append(site.get('main_photo'))
        else:
            sites_without_photo.append(str(site.get('id_site')))
        ville_codes.append(site.get('code_city_site'))

    query_photos = models.TPhoto.query.filter(
        models.TPhoto.id_photo.in_(photo_ids)
    )
    dump_photos = photo_schema.dump(query_photos).data

    if len(sites_without_photo):
        sql_missing_photos_str = "select distinct on (id_site) * from geopaysages.t_photo where id_site IN (" + ",".join(sites_without_photo) + ") order by id_site, filter_date desc"
        sql_missing_photos = text(sql_missing_photos_str)
        missing_photos_result = db.engine.execute(sql_missing_photos).fetchall()
        missing_photos = [dict(row) for row in missing_photos_result]
        for missing_photo in missing_photos:
            missing_photo['t_site'] = missing_photo.get('id_site')
            dump_photos.append(missing_photo)

    query_villes = models.Communes.query.filter(
        models.Communes.code_commune.in_(ville_codes)
    )
    dump_villes = communes_schema.dump(query_villes).data

    for site in dump_sites:
        id_site = site.get('id_site')
        photo = next(photo for photo in dump_photos if (photo.get('t_site') == id_site))
        site['photo'] = utils.getThumbnail(photo).get('output_url')
        site['ville'] = next(ville for ville in dump_villes if (ville.get('code_commune') == site.get('code_city_site')))
    
    return render_template('gallery.html', sites=dump_sites)

@main.route('/comparator/<int:id_site>')
def comparator(id_site):
    get_site_by_id = models.TSite.query.filter_by(id_site = id_site, publish_site = True)
    site=site_schema.dump(get_site_by_id).data
    if len(site) == 0:
        return abort(404)

    site = site[0]
    get_photos_by_site = models.TPhoto.query.filter_by(id_site = id_site, display_gal_photo=True).order_by('filter_date')
    photos = photo_schema.dump(get_photos_by_site).data
    get_villes = models.Communes.query.filter_by(code_commune = site.get('code_city_site'))
    
    site['ville'] = communes_schema.dump(get_villes).data[0]

    def getPhoto(photo):
        date_diplay = {}
        date_approx = photo.get('date_photo')
        filter_date = photo.get('filter_date')
        if date_approx:
            date_diplay = {
                'md': date_approx,
                'sm': date_approx
            }
        else:
            date_obj = datetime.strptime(filter_date, '%Y-%m-%d')
            date_diplay = {
                'md': format_datetime(date_obj, 'yyyy (dd MMMM)'),
                'sm': date_obj.strftime('%Y')
            }
        captions = []
        licence_photo = photo.get('dico_licence_photo')
        if licence_photo:
            captions.append(licence_photo.get('description_licence_photo'))
        """ author = photo.get('t_role')
        if author:
            captions.append('%s %s'  % (
                photo.get('t_role').get('prenom_role'),
                photo.get('t_role').get('nom_role')
            )) """
        caption = ' | '.join(captions)
        
        dl_caption = "%s | %s | réf. : %s | %s" % (
            site.get('name_site'),
            site.get('ville').get('nom_commune'),
            site.get('ref_site'),
            date_diplay.get('md')
        )

        if caption:
            dl_caption = '%s | %s' % (dl_caption, caption)

        return {
            'id': photo.get('id_photo'),
            'sm': utils.getThumbnail(photo).get('output_url'),
            'md': utils.getMedium(photo).get('output_url'),
            'lg': utils.getLarge(photo, caption).get('output_url'),
            'dl': utils.getDownload(photo, dl_caption).get('output_url'),
            'date': photo.get('filter_date'),
            'date_diplay': date_diplay
        }

    photos = [getPhoto(photo) for photo in photos]
    
    return render_template('comparator.html', site=site, photos=photos)


@main.route('/map')
def map():

    sites=site_schema.dump(models.TSite.query.filter_by(publish_site = True).order_by('name_site')).data
    for site in sites:
        cor_sthemes_themes = site.get('cor_site_stheme_themes')
        cor_list = []
        themes_list = []
        subthemes_list = []
        for cor in cor_sthemes_themes:
            cor_list.append(cor.get('id_stheme_theme'))
        query = models.CorSthemeTheme.query.filter(
            models.CorSthemeTheme.id_stheme_theme.in_(cor_list))
        themes_sthemes = themes_sthemes_schema.dump(query).data

        for item in themes_sthemes:
            if item.get('dico_theme').get('id_theme') not in themes_list:
                themes_list.append(item.get('dico_theme').get('id_theme'))
            if item.get('dico_stheme').get('id_stheme') not in subthemes_list:
                subthemes_list.append(item.get('dico_stheme').get('id_stheme'))

        get_photos_by_site = models.TPhoto.query.filter_by(
            id_site=site.get('id_site'))
        photos = photo_schema.dump(get_photos_by_site).data

        site['link'] = url_for('main.comparator', id_site=site.get('id_site'), _external=True)
        site['latlon'] = site.get('geom')
        site['themes'] = themes_list
        site['subthemes'] = subthemes_list
        site['township'] = site.get('code_city_site')

        site['years'] = set()
        for photo in photos:
            year = str(photo.get('filter_date')).split('-')[0]
            site['years'].add(year)
            photo['year'] = year
            photo['url'] = url_for(
                'static', filename=DATA_IMAGES_PATH + utils.getThumbnail(photo).get('output_name'))
        site['years'] = list(site['years'])
        site['photos'] = photos

    subthemes = dicostheme_schema.dump(models.DicoStheme.query.all()).data
    for sub in subthemes:
        themes_of_subthemes = []
        for item in sub.get('cor_stheme_themes'):
            themes_of_subthemes.append(item.get('id_theme'))
        sub['themes'] = themes_of_subthemes

    filters = [{
        'name': 'themes',
        'label': gettext(u'map.filter.themes'),
        'items': set()
    }, {
        'name': 'subthemes',
        'label': gettext(u'map.filter.subthemes'),
        'items': set()
    }, {
        'name': 'township',
        'label': gettext(u'map.filter.township'),
        'items': set()
    }, {
        'name': 'years',
        'label': gettext(u'map.filter.years'),
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

    themes = dicotheme_schema.dump(models.DicoTheme.query.all()).data
    themes = [{
        'id': item['id_theme'],
        'label': item['name_theme']
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

    return render_template('map.html', filters=filters, sites=sites, ign_Key=IGN_KEY)


@main.route('/sample')
def sample():
    return render_template('sample.html')