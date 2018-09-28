# coding: utf-8
from flask import Flask, render_template
import models
from models import (db)

dicotheme_schema = models.DicoThemeSchema(many=True)

from flask import Blueprint
main = Blueprint('main', __name__, template_folder='tpl')

@main.route('/')
def home():
    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    return render_template('home.html', titre="Bienvenue !", mots=result)