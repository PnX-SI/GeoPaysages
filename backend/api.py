from flask import Flask, request, Blueprint, Response, jsonify
from werkzeug.exceptions import NotFound

from config import DATA_IMAGES_PATH, DATA_NOTICES_PATH
from pypnusershub import routes as fnauth
from pypnusershub.db.models import AppUser
import models
import json
import utils
import os

from env import db

api = Blueprint('api', __name__)

photo_schema = models.TPhotoSchema(many=True)
site_schema = models.TSiteSchema(many=True)
themes_schema = models.DicoThemeSchema(many=True)
subthemes_schema = models.DicoSthemeSchema(many=True)
licences_schema = models.LicencePhotoSchema(many=True)
corThemeStheme_Schema = models.CorThemeSthemeSchema(many=True)
themes_sthemes_schema = models.CorSthemeThemeSchema(many=True)
ville_schema = models.VilleSchema(many=True)


@api.route('/api/sites', methods=['GET'])
def returnAllSites():
    get_all_sites = models.TSite.query.order_by('ref_site').all()
    sites = site_schema.dump(get_all_sites)
    for site in sites:
        if len(site.get("t_photos")) > 0:
            if site.get('main_photo') == None :
                first_photo = site.get("t_photos")
                main_photo = models.TPhoto.query.filter_by(
                    id_photo=first_photo[0]
                ).one_or_none()
            else:
                main_photo = models.TPhoto.query.filter_by(
                    id_photo=site.get('main_photo')).one_or_none()
            if main_photo:
                photo_schema = models.TPhotoSchema()
                main_photo = photo_schema.dump(main_photo)
                site['main_photo'] = utils.getThumbnail(main_photo).get('output_name')
            else:
                site["main_photo"] = "no_photo"

        else:
            site["main_photo"] = "no_photo"

    return jsonify(sites)


@api.route('/api/site/<int:id_site>', methods=['GET'])
def returnSiteById(id_site):
    get_site_by_id = models.TSite.query.filter_by(id_site=id_site)
    site = site_schema.dump(get_site_by_id)
    get_photos_by_site = models.TPhoto.query.order_by(
        'filter_date').filter_by(id_site=id_site).all()
    dump_photos = photo_schema.dump(get_photos_by_site)

    cor_sthemes_themes = site[0].get('cor_site_stheme_themes')
    cor_list = []
    themes_list = []
    subthemes_list = []
    for cor in cor_sthemes_themes:
        cor_list.append(cor.get('id_stheme_theme'))
    query = models.CorSthemeTheme.query.filter(
        models.CorSthemeTheme.id_stheme_theme.in_(cor_list))
    themes_sthemes = themes_sthemes_schema.dump(query)

    for item in themes_sthemes:
        if item.get('dico_theme').get('id_theme') not in themes_list:
            themes_list.append(item.get('dico_theme').get('id_theme'))
        if item.get('dico_stheme').get('id_stheme') not in subthemes_list:
            subthemes_list.append(item.get('dico_stheme').get('id_stheme'))

    site[0]['themes'] = themes_list
    site[0]['subthemes'] = subthemes_list

    for photo in dump_photos:
        photo['sm'] = utils.getThumbnail(photo).get('output_name'),

    photos = dump_photos
    return jsonify(site=site, photos=photos), 200


@api.route('/api/gallery', methods=['GET'])
def gallery():
    get_photos = models.TPhoto.query.order_by('id_site').all()
    dump_photos = photo_schema.dump(get_photos)
    for photo in dump_photos:
        photo['sm'] = utils.getThumbnail(photo).get('output_name')

    return jsonify(dump_photos), 200


@api.route('/api/themes', methods=['GET'])
def returnAllThemes():
    get_all_themes = models.DicoTheme.query.all()
    themes = themes_schema.dump(get_all_themes)
    return jsonify(themes), 200


@api.route('/api/subThemes', methods=['GET'])
def returnAllSubthemes():
    get_all_subthemes = models.DicoStheme.query.all()
    subthemes = subthemes_schema.dump(get_all_subthemes)
    for sub in subthemes:
        themes_of_subthemes = []
        for item in sub.get('cor_stheme_themes'):
            themes_of_subthemes.append(item.get('id_theme'))
        sub['themes'] = themes_of_subthemes
        del sub['cor_stheme_themes']

    return jsonify(subthemes), 200


@api.route('/api/licences', methods=['GET'])
def returnAllLicences():
    get_all_licences = models.DicoLicencePhoto.query.all()
    licences = licences_schema.dump(get_all_licences)
    return jsonify(licences), 200

@api.route('/api/users/<int:id_app>', methods=['GET'])
def returnAllUsers(id_app):
    all_users = AppUser.query.filter_by(
        id_application=id_app).all()

    return jsonify([u.as_dict() for u in all_users])

# TODO : remove this view ! 
# use in the front at each refresh ... but why ?
@api.route('/api/me/', methods=['GET'])
@fnauth.check_auth(2, True, None, None)
def returnCurrentUser(id_role=None):
    current_user = AppUser.query.filter_by(
        id_role=id_role
    ).all()
    if not current_user:
        raise NotFound(f"No User with id {id_role}")
    return jsonify([d.as_dict() for d in current_user])


@api.route('/api/site/<int:id_site>', methods=['DELETE'])
@fnauth.check_auth(6, False, None, None)
def deleteSite(id_site):
    base_path = './static/' + DATA_IMAGES_PATH
    models.CorSiteSthemeTheme.query.filter_by(id_site=id_site).delete()
    photos = models.TPhoto.query.filter_by(id_site=id_site).all()
    photos = photo_schema.dump(photos)
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
@fnauth.check_auth(2, False, None, None)
def add_site():
    data = dict(request.get_json())
    site = models.TSite(**data)
    db.session.add(site)
    db.session.commit()

    return jsonify(id_site=site.id_site), 200


@api.route('/api/updateSite', methods=['PATCH'])
@fnauth.check_auth(2, False, None, None)
def update_site():
    site = request.get_json()
    models.CorSiteSthemeTheme.query.filter_by(
        id_site=site.get('id_site')).delete()
    models.TSite.query.filter_by(id_site=site.get('id_site')).update(site)
    db.session.commit()
    photos = models.TPhoto.query.filter_by(id_site=site.get('id_site')).all()
    photos = photo_schema.dump(photos).data
    base_path = './static/' + DATA_IMAGES_PATH
    photos2 = []
    for photo in photos:
        photo_name = photo.get('path_file_photo')
        for fileName in os.listdir(base_path):
            if fileName.endswith('_' + photo_name):
                os.remove(base_path + fileName)
    return jsonify('site updated successfully'), 200


@api.route('/api/addThemes', methods=['POST'])
@fnauth.check_auth(2, False, None, None)
def add_cor_site_theme_stheme():
    data = request.get_json().get('data')
    for d in data:
        get_id_stheme_theme = models.CorSthemeTheme.query.filter_by(
            id_theme=d.get('id_theme'), id_stheme=d.get('id_stheme')).all()
        id_stheme_theme = corThemeStheme_Schema.dump(
            get_id_stheme_theme)
        id_stheme_theme[0]['id_site'] = d.get('id_site')
        site_theme_stheme = models.CorSiteSthemeTheme(**id_stheme_theme[0])
        db.session.add(site_theme_stheme)
        db.session.commit()

    return jsonify('success'), 200


@api.route('/api/addPhotos', methods=['POST'])
@fnauth.check_auth(2, False, None, None)
def upload_file():
    base_path = './static/' + DATA_IMAGES_PATH
    data = request.form.getlist('data')
    new_site = request.form.getlist('new_site')
    uploaded_images = request.files.getlist('image')
    for d in data:
        d_serialized = json.loads(d)
        check_exist = models.TPhoto.query.filter_by(
            path_file_photo=d_serialized.get('path_file_photo')).first()
        if(check_exist):
            if (new_site == 'true'):
                models.TSite.query.filter_by(
                    id_site=d_serialized.get('id_site')).delete()
                models.CorSiteSthemeTheme.query.filter_by(
                    id_site=d_serialized.get('id_site')).delete()
                db.session.commit()
            return jsonify(error='image_already_exist', image=d_serialized.get('path_file_photo')), 400
        main_photo = d_serialized.get('main_photo')
        del d_serialized['main_photo']
        photo = models.TPhoto(**d_serialized)
        db.session.add(photo)
        db.session.commit()
        if (main_photo == True):
            photos_query = models.TPhoto.query.filter_by(
                path_file_photo=d_serialized.get('path_file_photo')).all()
            photo_id = photo_schema.dump(
                photos_query)[0].get('id_photo')
            models.TSite.query.filter_by(id_site=d_serialized.get(
                'id_site')).update({models.TSite.main_photo: photo_id})
            db.session.commit()
    for image in uploaded_images:
        image.save(os.path.join(base_path + image.filename))

    return jsonify('photo added successfully'), 200


@api.route('/api/addNotices', methods=['POST'])
@fnauth.check_auth(2, False, None, None)
def upload_notice():
    base_path = './static/' + DATA_NOTICES_PATH
    notice = request.files.get('notice')
    notice.save(os.path.join(base_path + notice.filename))

    return jsonify('notice added successfully'), 200


@api.route('/api/deleteNotice/<notice>', methods=['DELETE'])
@fnauth.check_auth(2, False, None, None)
def delete_notice(notice):
    base_path = './static/' + DATA_NOTICES_PATH
    for fileName in os.listdir(base_path):
        if (fileName == notice):
            os.remove(base_path + fileName)

    return jsonify('notice removed successfully'), 200


@api.route('/api/updatePhoto', methods=['PATCH'])
@fnauth.check_auth(2, False, None, None)
def update_photo():
    base_path = './static/' + DATA_IMAGES_PATH
    data = request.form.get('data')
    image = request.files.get('image')
    data_serialized = json.loads(data)
    photos_query = models.TPhoto.query.filter_by(
        id_photo=data_serialized.get('id_photo')).all()
    photo_name = photo_schema.dump(
        photos_query)[0].get('path_file_photo')
    if (data_serialized.get('main_photo') == True):
        models.TSite.query.filter_by(id_site=data_serialized.get('id_site')).update(
            {models.TSite.main_photo: data_serialized.get('id_photo')})
        db.session.commit()
    if (data_serialized.get('main_photo')):
        del data_serialized['main_photo']
    models.TPhoto.query.filter_by(
        id_photo=data_serialized.get('id_photo')).update(data_serialized)
    db.session.commit()
    if (image):
        for fileName in os.listdir(base_path):
            if fileName.endswith(photo_name):
                os.remove(base_path + fileName)
        image.save(os.path.join(base_path + image.filename))
    else:
        for fileName in os.listdir(base_path):
            if (fileName != photo_name and fileName.endswith(photo_name)):
                os.remove(base_path + fileName)

    return jsonify('photo added successfully'), 200


@api.route('/api/deletePhotos', methods=['POST'])
@fnauth.check_auth(6, False, None, None)
def deletePhotos():
    base_path = './static/' + DATA_IMAGES_PATH
    photos = request.get_json()
    for photo in photos:
        photos_query = models.TPhoto.query.filter_by(
            id_photo=photo.get('id_photo')).all()
        photo_dump = photo_schema.dump(photos_query)[0]
        photo_name = photo_dump.get('path_file_photo')
        models.TPhoto.query.filter_by(
            id_photo=photo.get('id_photo')).delete()
        get_site_by_id = models.TSite.query.filter_by(
            id_site=photo_dump.get('t_site'))
        site = site_schema.dump(get_site_by_id)[0]
        if (site.get('main_photo') == photo_dump.get('id_photo')):
            models.TSite.query.filter_by(id_site=photo_dump.get(
                't_site')).update({models.TSite.main_photo: None})
        db.session.commit()
        for fileName in os.listdir(base_path):
            if fileName.endswith(photo_name):
                os.remove(base_path + fileName)

    return jsonify('site has been deleted'), 200


@api.route('/api/communes', methods=['GET'])
def returnAllcommunes():
    get_all_communes = models.Communes.query.order_by('nom_commune').all()
    communes = models.CommunesSchema(many=True).dump(get_all_communes)
    return jsonify(communes), 200


@api.route('/api/logout', methods=['GET'])
def logout():
    resp = Response('', 200)
    resp.delete_cookie('token')
    return resp
