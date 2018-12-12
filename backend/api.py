from flask import Flask, request, Blueprint, jsonify, url_for
from routes import main as main_blueprint
from config import DATA_IMAGES_PATH
from pypnusershub import routes as fnauth
import fnmatch
import re
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
themes_sthemes_schema = models.CorSthemeThemeSchema(many=True)
ville_schema = models.VilleSchema(many=True)


@api.route('/api/sites', methods=['GET'])
def returnAllSites():
    get_all_sites = models.TSite.query.order_by('name_site').all()
    sites = site_schema.dump(get_all_sites).data
    for site in sites:
        get_main_photo = models.TPhoto.query.filter_by(
            id_photo=site.get('main_photo'))
        '''
        get_photos = models.TPhoto.query.filter(
        models.TPhoto.id_photo.in_(site.get('t_photos')))
        dump_photos = photo_schema.dump(get_photos).data
        for photo in dump_photos :
            photo['sm'] = utils.getThumbnail(photo).get('output_name'),
        site['photos'] = dump_photos
        '''
        main_photo = photo_schema.dump(get_main_photo).data
        site['main_photo'] = utils.getThumbnail(
            main_photo[0]).get('output_name')
    return jsonify(sites), 200

@api.route('/api/site/<int:id_site>', methods=['GET'])
def returnSiteById(id_site):
    get_site_by_id = models.TSite.query.filter_by(id_site=id_site)
    site = site_schema.dump(get_site_by_id).data
    get_photos_by_site = models.TPhoto.query.order_by('filter_date').filter_by(id_site=id_site).all()
    dump_photos = photo_schema.dump(get_photos_by_site).data

    cor_sthemes_themes = site[0].get('cor_site_stheme_themes')
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

    site[0]['themes'] = themes_list
    site[0]['subthemes'] = subthemes_list

    for photo in dump_photos :
        photo['sm'] = utils.getThumbnail(photo).get('output_name'),

    photos = dump_photos
    return jsonify(site=site, photos=photos), 200

@api.route('/api/gallery')
def gallery():
  
    get_photos = models.TPhoto.query.order_by('id_site').all()
    dump_photos = photo_schema.dump(get_photos).data
    for photo in dump_photos :
        photo['sm'] = utils.getThumbnail(photo).get('output_name'),
    return jsonify(dump_photos), 200

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

@api.route('/api/site/<int:id_site>', methods=['DELETE'])
@fnauth.check_auth(6, False, None, None)
def deleteSite(id_site):
    base_path = './static/' + DATA_IMAGES_PATH
    models.CorSiteSthemeTheme.query.filter_by(id_site=id_site).delete()
    photos = models.TPhoto.query.filter_by(id_site=id_site).all()
    photos = photo_schema.dump(photos).data
    models.TPhoto.query.filter_by(id_site=id_site).delete()
    site = models.TSite.query.filter_by(id_site=id_site).delete()
    for photo in photos:
        photo_name = photo.get('path_file_photo')
        for fileName in os.listdir(base_path):
            if fileName.endswith(photo_name):
                os.remove(base_path + fileName)
    db.session.commit()
    if site:
        return jsonify('site has been deleted'), 200
    else:
        return jsonify('error'), 400

@api.route('/api/addSite', methods=['POST'])
@fnauth.check_auth(6, False, None, None)
def add_site():
    try:
        data = dict(request.get_json())
        site = models.TSite(**data)
        db.session.add(site)
        db.session.commit()
        return jsonify(id_site=site.id_site), 200
    except Exception as exception:
        return jsonify(error=exception), 400


@api.route('/api/updateSite', methods=['PATCH'])
@fnauth.check_auth(6, False, None, None)
def update_site():
    site = request.get_json()
    models.CorSiteSthemeTheme.query.filter_by(id_site=site.get('id_site')).delete()
    models.TSite.query.filter_by(id_site= site.get('id_site')).update(site)
    db.session.commit()
    return jsonify('site updated successfully'), 200


@api.route('/api/addThemes', methods=['POST'])
@fnauth.check_auth(6, False, None, None)
def add_cor_site_theme_stheme():
    data = request.get_json().get('data')
    for d in data:
        get_id_stheme_theme = models.CorSthemeTheme.query.filter_by(
            id_theme=d.get('id_theme'), id_stheme=d.get('id_stheme')).all()
        id_stheme_theme = corThemeStheme_Schema.dump(
            get_id_stheme_theme).data
        id_stheme_theme[0]['id_site'] = d.get('id_site')
        site_theme_stheme = models.CorSiteSthemeTheme(**id_stheme_theme[0])
        db.session.add(site_theme_stheme)
        db.session.commit()
    return jsonify('success'), 200


@api.route('/api/addPhotos', methods=['POST'])
@fnauth.check_auth(6, False, None, None)
def upload_file():
    base_path = './static/' + DATA_IMAGES_PATH
    data = request.form.getlist('data')
    uploaded_images = request.files.getlist('image')
    for d in data:
        d_serialized = json.loads(d)
        check_exist = models.TPhoto.query.filter_by(
            path_file_photo=d_serialized.get('path_file_photo')).first()
        if(check_exist):
            models.CorSiteSthemeTheme.query.filter_by(id_site=site.get('id_site')).delete()
            models.TSite.query.filter_by(id_site=d_serialized.get('id_site')).delete()
            db.session.commit()
            return jsonify(error='image_already_exist', image=d_serialized.get('path_file_photo')), 400
        photo = models.TPhoto(**d_serialized)
        db.session.add(photo)
        db.session.commit()
    for image in uploaded_images:
        image.save(os.path.join(base_path + image.filename))
    return jsonify('photo added successfully'), 200


@api.route('/api/updatePhoto', methods=['PATCH'])
@fnauth.check_auth(6, False, None, None)
def update_photo():
    base_path = './static/' + DATA_IMAGES_PATH
    data = request.form.get('data')
    image = request.files.get('image')
    data_serialized = json.loads(data)
    photos_query = models.TPhoto.query.filter_by(id_photo=data_serialized.get('id_photo')).all()
    photo_name = photo_schema.dump(photos_query).data[0].get('path_file_photo')
    print('data_serialized', data_serialized)
    if (data_serialized.get('main_photo') == True):
        models.TSite.query.filter_by(id_site= data_serialized.get('id_site')).update({models.TSite.main_photo: data_serialized.get('id_photo')})
    if (data_serialized.get('main_photo')):
        del data_serialized['main_photo']
    models.TPhoto.query.filter_by(id_photo = data_serialized.get('id_photo')).update(data_serialized)
    db.session.commit()
    if (image):
        for fileName in os.listdir(base_path):
            if fileName.endswith(photo_name):
                os.remove(base_path + fileName)
        image.save(os.path.join(base_path + image.filename))
    return jsonify('photo added successfully'), 200


@api.route('/api/deletePhotos', methods=['POST'])
@fnauth.check_auth(6, False, None, None)
def deletePhotos():
    base_path = './static/' + DATA_IMAGES_PATH
    photos = request.get_json()
    for photo in photos:
        photos_query = models.TPhoto.query.filter_by(
            id_photo=photo.get('id_photo')).all()
        photo_name = photo_schema.dump(
            photos_query).data[0].get('path_file_photo')
        models.TPhoto.query.filter_by(id_photo=photo.get('id_photo')).delete()
        db.session.commit()
        for fileName in os.listdir(base_path):
            if fileName.endswith(photo_name):
                os.remove(base_path + fileName)
    return jsonify('site has been deleted'), 200




@api.route('/api/villes', methods=['GET'])
def returnAllville():
    try:
        get_all_ville = models.Ville.query.all()
        ville= ville_schema.dump(get_all_ville).data
        return jsonify(ville), 200
    except Exception as exception:
        return jsonify(error=exception), 400