# coding: utf-8
from flask import Flask, render_template, redirect, Blueprint
import models
import random
from models import (db)
from config import DATA_IMAGES_PATH
from PIL import Image, ImageFont, ImageDraw
import os

dicotheme_schema = models.DicoThemeSchema(many=True)
main = Blueprint('main', __name__, template_folder='tpl')

def getThumbnail(imageUrl):
    base_img_url = DATA_IMAGES_PATH
    imageThumbnailUrl = base_img_url+'thumbnail_'+imageUrl
    imageUrl = base_img_url+imageUrl
    if not (os.path.exists(imageThumbnailUrl)):
        try:
            image = Image.open(imageUrl)
            image.thumbnail((200, 200))
            image.save(imageThumbnailUrl)
        except Exception:
            print('getThumbnail Invalid image')

def addWatherMark(imageUrl):
    font = ImageFont.truetype("./static/fonts/openSans.ttf",14)
    base_img_url = DATA_IMAGES_PATH
    imageCopyright = base_img_url+'copyrigh_'+imageUrl
    if not (os.path.exists(imageCopyright)):
        try:
            image = Image.open(base_img_url+imageUrl)
            draw = ImageDraw.Draw(image)
            width, height = image.size
            draw.text((10, height-24),"© Copyright 2018 by Parc National de la Vanoise",font=font,fill=(255,255,255,255))
            image.save(imageCopyright)
        except Exception:
            print('addWatherMark Invalid image')

@main.route('/')
def home():
    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    #return render_template('home.html', titre="Bienvenue !", mots=result)
    return redirect("/comparateur", code=302)

@main.route('/comparateur')
def comparateur():

    filenames = ['oppv-003-00-2007.jpg', 'oppv-003-01-2008.jpg', 'oppv-003-02-2009.jpg', 'oppv-003-03-2010.jpg', 'oppv-003-04-2011.jpg', 'oppv-003-05-2012.jpg', 'oppv-003-06-2013.jpg', 'oppv-003-07-2014.jpg', 'oppv-003-08-2015.jpg', 'oppv-003-09-2016.jpg', 'oppv-003-10-2017.jpg']
    def getPhoto(n):
        filename = filenames[n]
        def url(i, size):
            base = 'https://res.cloudinary.com/naturalsolutions/image/upload'
            path = 'v1539596666/Vanoise'
            return '%s/%s/%s/%s' % (base, size, path, filename)

        return {
            'sm': url(n, 'c_thumb,w_200,h_200'),
            'md': url(n, 'c_limit,w_800,h_800'),
            'lg': url(n, 'c_limit,w_2000,h_2000'),
            'date': filename.split('-')[3].split('.')[0]
        }


    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    photos = [getPhoto(i) for i in range(len(filenames))]
    site = {
        'photos': photos
    }
    return render_template('comparateur.html', titre="Bienvenue !", mots=result, site=site)

@main.route('/map')
def map():
    
    sites=[{
        "title": 'Marseille Vieux-Port',
        'township': 2,
        "latlon": [43.2908575, 5.3630115],
        "themes": [1],
        "subthemes": [1, 2],
        'photos': [{
            'year': 2000
        }, {
            'year': 2001
        }]
    }, {
        "title": "Arles Centre",
        'township': 1,
        "latlon": [43.5444826, 4.5108427],
        "themes": [2],
        "subthemes": [3],
        'photos': [{
            'year': 2001
        }, {
            'year': 2002
        }]
    }, {
        'title': "Camargue",
        'township': 1,
        'latlon': [43.6788978, 4.6047767],
        "themes": [1],
        "subthemes": [3],
        'photos': [{
            'year': 2002
        }, {
            'year': 2003
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