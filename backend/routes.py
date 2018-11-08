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
    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    #return render_template('home.html', titre="Bienvenue !", mots=result)
    return redirect("/comparateur", code=302)

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
