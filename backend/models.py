# coding: utf-8
from sqlalchemy import ARRAY, Boolean, CheckConstraint, Column, Date, Float, ForeignKey, Integer, String, Table, Text
from geoalchemy2.types import Geometry
from sqlalchemy.orm import relationship
from sqlalchemy.schema import FetchedValue
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import geoalchemy2.functions as geo_funcs

db = SQLAlchemy()
ma = Marshmallow()


class CorSiteStheme(db.Model):
    __tablename__ = 'cor_site_stheme'

    id_stheme_site = db.Column(db.Integer, primary_key=True)
    id_site = db.Column(db.Integer)
    id_stheme = db.Column(db.Integer)


t_cor_stheme_theme = db.Table(
    'cor_stheme_theme',
    db.Column('id_stheme_theme', db.Integer, nullable=False),
    db.Column('id_stheme', db.Integer),
    db.Column('id_theme', db.Integer)
)


class DicoLicencePhoto(db.Model):
    __tablename__ = 'dico_licence_photo'

    id_licence_photo = db.Column(db.Integer, primary_key=True)
    name_licence_photo = db.Column(db.String)
    description_licence_photo = db.Column(db.String)


class DicoStheme(db.Model):
    __tablename__ = 'dico_stheme'

    id_stheme = db.Column(db.Integer, primary_key=True)
    name_stheme = db.Column(db.String)


class DicoTheme(db.Model):
    __tablename__ = 'dico_theme'

    id_theme = db.Column(db.Integer, primary_key=True)
    name_theme = db.Column(db.String)


class TPhoto(db.Model):
    __tablename__ = 't_photo'

    id_photo = db.Column(db.Integer, primary_key=True)
    id_site = db.Column(db.ForeignKey('t_site.id_site'))
    path_file_photo = db.Column(db.String)
    id_author = db.Column(db.Integer)
    date_photo = db.Column(db.Date)
    legende_photo = db.Column(db.String)
    display_gal_photo = db.Column(db.Boolean)
    id_licence_photo = db.Column(db.ForeignKey(
        'dico_licence_photo.id_licence_photo'))

    dico_licence_photo = db.relationship(
        'DicoLicencePhoto', primaryjoin='TPhoto.id_licence_photo == DicoLicencePhoto.id_licence_photo', backref='t_photos')
    t_site = db.relationship(
        'TSite', primaryjoin='TPhoto.id_site == TSite.id_site', backref='t_photos')


class TSerie(db.Model):
    __tablename__ = 't_serie'

    id_site_serie = db.Column(db.Integer, primary_key=True)
    id_site = db.Column(db.Integer)
    id_photo = db.Column(db.Integer)


class TSite(db.Model):
    __tablename__ = 't_site'

    id_site = db.Column(db.Integer, primary_key=True)
    name_site = db.Column(db.String)
    desc_site = db.Column(db.String)
    testim_site = db.Column(db.String)
    code_city_site = db.Column(db.Integer)
    alti_site = db.Column(db.Integer)
    path_file_guide_site = db.Column(db.String(1))
    publish_site = db.Column(db.Boolean)
    geom = db.Column(Geometry(geometry_type='POINT', srid=4326))


class TUtilisateur(db.Model):
    __tablename__ = 't_utilisateur'

    id_role = db.Column(db.Integer, primary_key=True,
                        server_default=db.FetchedValue())
    id_right = db.Column(db.Integer)
    author_photo = db.Column(db.Boolean)
    id_application = db.Column(db.Integer)
    last_name = db.Column(db.String)
    first_name = db.Column(db.String)
    organization = db.Column(db.String)
    mail = db.Column(db.String)
    path_author_photo = db.Column(db.String)


##### SCHEMAS #####

class DicoThemeSchema(ma.ModelSchema):
    class Meta:
        model = DicoTheme
