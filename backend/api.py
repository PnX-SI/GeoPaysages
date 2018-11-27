from flask import Flask, request, Blueprint, jsonify, url_for
from routes import main as main_blueprint
# fnauth = importlib.import_module("apptax.UsersHub-authentification-module.routes")
from pypnusershub import routes
import models
import user_models
import utils
from flask_cors import CORS
import os
api = Blueprint('api', __name__)

photo_schema = models.TPhotoSchema(many=True)
site_schema = models.TSiteSchema(many=True)
themes_schema = models.DicoThemeSchema(many=True)
subthemes_schema = models.DicoSthemeSchema(many=True)
licences_schema = models.LicencePhotoSchema(many=True)
users_schema = user_models.usersViewSchema(many=True)


@api.route('/api/sites', methods=['GET'])
def returnAllSites():
    try:
        get_all_sites = models.TSite.query.all()
        sites = site_schema.dump(get_all_sites).data
        for site in sites:
            get_photo = models.TPhoto.query.filter_by(
                id_photo=site.get('t_photos')[0])
            main_photo = photo_schema.dump(get_photo).data
            site['main_photo'] = utils.getThumbnail(
                main_photo[0]).get('output_name')
        return jsonify(sites), 200
    except Exception as exception:
        return jsonify(error=exception), 400


@api.route('/api/themes', methods=['GET'])
def returnAllThemes():
    try:
        get_all_themes = models.DicoTheme.query.all()
        themes = themes_schema.dump(get_all_themes).data
        return jsonify(themes), 200
    except Exception as exception:
        return jsonify(error=exception), 400


@api.route('/api/subThemes', methods=['GET'])
def returnAllSubthemes():
    try:
        get_all_subthemes = models.DicoStheme.query.all()
        subthemes = subthemes_schema.dump(get_all_subthemes).data
        for sub in subthemes:
            themes_of_subthemes = []
            for item in sub.get('cor_stheme_themes'):
                themes_of_subthemes.append(item.get('id_theme'))
            sub['themes'] = themes_of_subthemes
            del sub['cor_stheme_themes']
        return jsonify(subthemes), 200
    except Exception as exception:
        return jsonify(error=exception), 400


@api.route('/api/licences', methods=['GET'])
def returnAllLicences():
    try:
        get_all_licences = models.DicoLicencePhoto.query.all()
        licences = licences_schema.dump(get_all_licences).data
        return jsonify(licences), 200
    except Exception as exception:
        return jsonify(error=exception), 400


@api.route('/api/users', methods=['GET'])
def returnAllUsers():
    try:
        get_all_users = user_models.UsersView.query.all()
        users = users_schema.dump(get_all_users).data
        return jsonify(users), 200
    except Exception as exception:
        return jsonify(error=exception), 400


@api.route('/api/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        uploaded_images = request.files.getlist('image')
        for image in uploaded_images:
            if os.path.exists(output_path):
                image.save(os.path.join('./', image.filename))
        return jsonify('file uploaded successfully'), 200
