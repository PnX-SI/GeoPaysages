from flask import Flask, render_template, redirect, Blueprint, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import models
import utils
import random
from models import (db)
from config import DATA_IMAGES_PATH
import json

main = Blueprint('main', __name__, template_folder='tpl')

db = SQLAlchemy()

dicotheme_schema = models.DicoThemeSchema(many=True)
dicostheme_schema = models.DicoSthemeSchema(many=True)
photo_schema = models.TPhotoSchema(many=True)
site_schema = models.TSiteSchema(many=True)
themes_sthemes_schema = models.CorSthemeThemeSchema(many=True)



@main.route('/')
def home():
    sql = text("SELECT value FROM geopaysages.conf WHERE key = 'home_blocks'")
    rows = db.engine.execute(sql).fetchall()
    id_photos = json.loads(rows[0]['value'])
    get_photos = models.TPhoto.query.filter(
        models.TPhoto.id_photo.in_(id_photos))
    dump_pĥotos = photo_schema.dump(get_photos).data

    site_ids = [photo.get('t_site') for photo in dump_pĥotos]
    get_sites = models.TSite.query.filter(models.TSite.id_site.in_(site_ids))
    dump_sites = site_schema.dump(get_sites).data

    def get_photo_block(id_photo):
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
    ]

    return render_template('home.html', blocks=blocks)


@main.route('/galery')
def galery():
    return render_template('galery.html')


@main.route('/comparateur/<int:id_site>')
def comparateur(id_site):
    get_site_by_id = models.TSite.query.filter_by(id_site=id_site)
    site = site_schema.dump(get_site_by_id).data[0]
    get_photos_by_site = models.TPhoto.query.filter_by(id_site=id_site)
    photos = photo_schema.dump(get_photos_by_site).data

    def getPhoto(photo):
        return {
            'sm': url_for('static', filename=DATA_IMAGES_PATH + utils.getThumbnail(photo).get('output_name')),
            'md': url_for('static', filename=DATA_IMAGES_PATH + utils.getMedium(photo).get('output_name')),
            'lg': url_for('static', filename=DATA_IMAGES_PATH + utils.getLarge(photo).get('output_name')),
            'date': photo.get('date_photo')
        }

    photos = [getPhoto(photo) for photo in photos]

    return render_template('comparateur.html', titre="Bienvenue !", site=site, photos=photos)


@main.route('/map')
def map():

    sites = site_schema.dump(models.TSite.query.all()).data
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

        site['link'] = url_for(
            'main.comparateur', id_site=site.get('id_site'), _external=True)
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
        'label': 'Thème',
        'items': set()
    }, {
        'name': 'subthemes',
        'label': 'Sous-thème',
        'items': set()
    }, {
        'name': 'township',
        'label': 'Commune',
        'items': set()
    }, {
        'name': 'years',
        'label': 'Année',
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
        'label': item['name_stheme']
    } for item in subthemes]

    filter_township = [
        filter for filter in filters if filter.get('name') == 'township'][0]
    str_map_in = ["'" + township +
                  "'" for township in filter_township.get('items')]
    sql_map_str = "SELECT ville_code_commune AS id, ville_nom_reel AS label FROM geopaysages.villes_france WHERE ville_code_commune IN (" + ",".join(
        str_map_in) + ")"
    sql_map = text(sql_map_str)
    townships_result = db.engine.execute(sql_map).fetchall()
    townships = [dict(row) for row in townships_result]
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
        else:
            filter['items'] = [getItem(filter.get('name'), item_id)
                               for item_id in filter.get('items')]
        filter['items'] = sorted(filter['items'], key=lambda k: k['label'])

    return render_template('map.html', filters=filters, sites=sites)
