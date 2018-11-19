# coding: utf-8
from flask import Flask, render_template, redirect, Blueprint,jsonify, url_for
import models
import random
from models import (db)
from config import DATA_IMAGES_PATH
from PIL import Image, ImageFont, ImageDraw, ImageOps
import os

dicotheme_schema = models.DicoThemeSchema(many=True)
photo_schema = models.TPhotoSchema(many=True)
site_schema = models.TSiteSchema(many=True)
licencePhotoSchema= models.LicencePhotoSchema(many=True)
main = Blueprint('main', __name__, template_folder='tpl')

def getImage(photo, prefixe, callback):
    base_path = './static/' + DATA_IMAGES_PATH
    input_name = photo.get('path_file_photo')
    input_path = base_path + input_name
    if prefixe:
        output_name = prefixe + '_' + input_name
    else :
        output_name = input_name
    output_path = base_path + output_name
    image = Image.open(input_path)
    output_exists = os.path.exists(output_path),

    img = {
        'input_exists': os.path.exists(input_path),
        'output_name': output_name,
        'output_path': output_path,
        'image': image
    }

    if not(callback is None) and not(output_exists):
        try:
            callback(img)
        except Exception as exception:
            print('getImage Invalid image')
            print(exception)

    return img

def getThumbnail(photo):
    h = 100
    def callback(img):
        #initW, initH = image.size
        #ratio = h / initH
        #image.resize((int(initW*ratio), h))
        image = img.get('image')
        image = ImageOps.fit(image, (h, h), Image.ANTIALIAS)
        image.save(img.get('output_path'))

    return getImage(photo, 'thumbnail', callback)

def getMedium(photo):
    def callback(img):
        image = img.get('image')
        image.thumbnail((800, 800))
        image.save(img.get('output_path'))
        addWatherMark(img, photo)

    return getImage(photo, 'medium', callback)

def getLarge(photo):
    def callback(img):
        addWatherMark(img, photo)
    return getImage(photo, 'large', callback)

def addWatherMark(img, photo):
    copyright_text = photo.get('dico_licence_photo').get('description_licence_photo')
    font = ImageFont.truetype("./static/fonts/openSans.ttf",14)
    if img.get('input_exists'):
        try:
            image = img.get('image')
            draw = ImageDraw.Draw(image)
            width, height = image.size
            draw.text((10, height-24),copyright_text,font=font,fill=(255,255,255,255))
            image.save(img.get('output_path'))
        except Exception:
            print('addWatherMark Invalid image')
    return img

@main.route('/')
def home():
    return render_template('home.html')
    #return redirect("/comparateur", code=302)

@main.route('/galery')
def galery():
    return render_template('galery_back.html')
    #return redirect("/comparateur", code=302)

@main.route('/sites_admin')
def sites_admin():
    return render_template('sites_admin.html')


@main.route('/add_photos')
def add_photos():
    return render_template('add_photos.html')

@main.route('/home_backoff')
def home_back():
    return render_template('home_backoff.html')

@main.route('/comparateur/<int:id_site>')
def comparateur(id_site):
    get_site_by_id = models.TSite.query.filter_by(id_site = id_site)
    site=site_schema.dump(get_site_by_id).data[0]
    get_photos_by_site = models.TPhoto.query.filter_by(id_site = id_site)
    photos = photo_schema.dump(get_photos_by_site).data
    def getPhoto(photo):
        return {
            'sm': url_for('static', filename=DATA_IMAGES_PATH + getThumbnail(photo).get('output_name')),
            'md': url_for('static', filename=DATA_IMAGES_PATH + getMedium(photo).get('output_name')),
            'lg': url_for('static', filename=DATA_IMAGES_PATH + getLarge(photo).get('output_name')),
            'date': photo.get('date_photo')
        }


    result = {
        'name': site.get('name_site'),
        'description': site.get('desc_site'),
        'testimonial': site.get('testim_site'),
        'geom': '',
        'photos': [getPhoto(photo) for photo in photos]
    }
    return render_template('comparateur.html', titre="Bienvenue !", site=result)

@main.route('/map')
def map():
    
    sites=[{
        "title": 'Marseille Vieux-Port',
        'township': 2,
        "latlon": [43.2908575, 5.3630115],
        "themes": [1],
        "subthemes": [1, 2],
        'url': url_for('main.comparateur', id_site=1, _external=True),
        'photos': [{
            'year': 2000,
            'url': '/static/images/100.png'
        }, {
            'year': 2001,
            'url': '/static/images/100.png'
        }]
    }, {
        "title": "Arles Centre",
        'township': 1,
        "latlon": [43.5444826, 4.5108427],
        "themes": [2],
        "subthemes": [3],
        'url': url_for('main.comparateur', id_site=1, _external=True),
        'photos': [{
            'year': 2001,
            'url': '/static/images/100-0f0.png'
        }, {
            'year': 2002,
            'url': '/static/images/100-0f0.png'
        }]
    }, {
        'title': "Camargue",
        'township': 1,
        'latlon': [43.6788978, 4.6047767],
        "themes": [1],
        "subthemes": [3],
        'url': url_for('main.comparateur', id_site=1, _external=True),
        'photos': [{
            'year': 2002,
            'url': '/static/images/100-00f.png'
        }, {
            'year': 2003,
            'url': '/static/images/100-00f.png'
        }]
    }]

    filters = [{
        'name': 'themes',
        'label': 'Thème',
        'items': set()
    },{
        'name': 'subthemes',
        'label': 'Sous-thème',
        'items': set()
    },{
        'name': 'township',
        'label': 'Commune',
        'items': set()
    },{
        'name': 'years',
        'label': 'Année',
        'items': set()
    }]

    for site in sites:
        #Compute the prop years
        site['years'] = set()
        for photo in site.get('photos'):
            site['years'].add(photo.get('year'))
        site['years'] = list(site['years'])

        for filter in filters:
            val = site.get(filter.get('name'))
            try:
                filter.get('items').update(val)
            except:
                filter.get('items').add(val)

    dbs = {
        'themes':[{
            'id': 1,
            'label': 'Theme 1'
        }, {
            'id': 2,
            'label': 'Theme 2'
        }],
        'subthemes':[{
            'id': 1,
            'themes': [1],
            'label': 'Subtheme 1'
        }, {
            'id': 2,
            'themes': [1],
            'label': 'Subtheme 2'
        }, {
            'id': 3,
            'themes': [1, 2],
            'label': 'Subtheme 3'
        }],
        'township':[{
            'id': 1,
            'label': 'Arles'
        }, {
            'id': 2,
            'label': 'Marseille'
        }]
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
            filter['items'] = [getItem(filter.get('name'), item_id) for item_id in filter.get('items')]
        filter['items'] = sorted(filter['items'], key=lambda k: k['label'])

    return render_template('map.html', filters=filters, sites=sites)
