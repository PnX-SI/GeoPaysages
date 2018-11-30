from flask import Flask, request, Blueprint, jsonify, url_for
from routes import main as main_blueprint
from config import DATA_IMAGES_PATH
# fnauth = importlib.import_module("apptax.UsersHub-authentification-module.routes")
from pypnusershub import routes
import models
import json
import user_models
import utils
from flask_cors import CORS
import os
from app import db
api = Blueprint('api', __name__)

photo_schema = models.TPhotoSchema(many=True)
site_schema = models.TSiteSchema(many=True)
themes_schema = models.DicoThemeSchema(many=True)
subthemes_schema = models.DicoSthemeSchema(many=True)
licences_schema = models.LicencePhotoSchema(many=True)
users_schema = user_models.usersViewSchema(many=True)
corThemeStheme_Schema = models.CorThemeSthemeSchema(many=True)


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


@api.route('/api/addSite', methods=['POST'])
def add_site():
    try:
        data = dict(request.get_json())
        site = models.TSite(**data)
        db.session.add(site)
        db.session.commit()
        return jsonify(id_site=site.id_site), 200
    except Exception as exception:
        return jsonify(error=exception), 400


@api.route('/api/addThemes', methods=['POST'])
def add_cor_site_theme_stheme():
    try: 
        data = request.get_json().get('data')
        for d in data:
            get_id_stheme_theme = models.CorSthemeTheme.query.filter_by(
                id_theme=d.get('id_theme'), id_stheme=d.get('id_stheme')).all()
            id_stheme_theme = corThemeStheme_Schema.dump(get_id_stheme_theme).data
            id_stheme_theme[0]['id_site'] = d.get('id_site')
            site_theme_stheme=models.CorSiteSthemeTheme(**id_stheme_theme[0])
            db.session.add(site_theme_stheme)
            db.session.commit()
        return jsonify('success'), 200
    except Exception as exception:
        return jsonify(error=exception), 400



@api.route('/api/addPhotos', methods=['POST'])
def upload_file():
    try:
        base_path='./static/' + DATA_IMAGES_PATH
        data=request.form.getlist('data')
        uploaded_images=request.files.getlist('image')
        for d in data:
            d_serialized=json.loads(d)
            check_exist=models.TPhoto.query.filter_by(
                path_file_photo=d_serialized.get('path_file_photo')).first()
            if(check_exist):
                return jsonify(error='image_already_exist', image=d_serialized.get('path_file_photo')), 400
            photo=models.TPhoto(**d_serialized)
            db.session.add(photo)
            db.session.commit()
        for image in uploaded_images:
            image.save(os.path.join(base_path + image.filename))
        return jsonify('photo added successfully'), 200
    except Exception as exception:
        return jsonify(error=exception), 400
