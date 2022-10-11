from flask import render_template, Blueprint
import utils

# This file is a docker volume in place of /backend/custom_app.py
# So, paths are relative from /backend/custom_app.py

custom = Blueprint('custom', __name__)

def getHomeBlock1Data():
    """ You can import models and query the database
    schema = models.TPhotoSchema(many=True)
    photos = models.TPhoto.query.limit(1)
    return {
        'photos': schema.dump(photos)
    } """
    return {
        'comment': 'This line is generated from Python !!!'
    }

def custom_inject_to_tpl():
    return dict(
        getHomeBlock1Data = getHomeBlock1Data
    )

@custom.route('/about')
def about():
    return render_template(utils.getCustomTpl('about'))