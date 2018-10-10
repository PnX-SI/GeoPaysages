# coding: utf-8
from flask import Flask, render_template
import models
import random
from models import (db)

dicotheme_schema = models.DicoThemeSchema(many=True)

from flask import Blueprint
main = Blueprint('main', __name__, template_folder='tpl')


@main.route('/')
def home():
    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    return render_template('home.html', titre="Bienvenue !", mots=result)

@main.route('/comparateur')
def comparateur():

    def getPhoto(n):
        mdSizes = ['450/300', '300/450']
        lgSizes = ['900/600', '600/900']
        randSize = n % 2
        return {
            'sm': 'https://picsum.photos/200?image=%s' % n,
            'md': 'https://picsum.photos/%s?image=%s' % (mdSizes[randSize], n),
            'lg': 'https://picsum.photos/%s?image=%s' % (lgSizes[randSize], n),
            'date': '%s/%s/%s' % (random.randrange(1900, 2018), random.randrange(1, 12), random.randrange(10, 28))
        }


    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    photos = [getPhoto(i) for i in range(10, 16)]
    site = {
        'photos': photos
    }
    return render_template('comparateur.html', titre="Bienvenue !", mots=result, site=site)
