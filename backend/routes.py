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
