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

class TSite(db.Model):
    __tablename__ = 't_site'
    __table_args__ = {'schema': 'geopaysages'}

    id_site = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_site = db.Column(db.String)
    desc_site = db.Column(db.String)
    testim_site = db.Column(db.String)
    code_city_site = db.Column(db.Integer)
    alti_site = db.Column(db.Integer)
    path_file_guide_site = db.Column(db.String(1))
    publish_site = db.Column(db.Boolean)
    #geom = db.Column(Geometry(geometry_type='POINT', srid=4326))



class CorSiteSthemeTheme(db.Model):
    __tablename__ = 'cor_site_stheme_theme'
    __table_args__ = {'schema': 'geopaysages'}

    id_site_stheme_theme = db.Column(db.Integer, nullable=False, server_default=db.FetchedValue())
    id_site = db.Column(db.ForeignKey('geopaysages.t_site.id_site'), primary_key=True, nullable=False)
    id_stheme_theme = db.Column(db.ForeignKey('geopaysages.cor_stheme_theme.id_stheme_theme'), primary_key=True, nullable=False)

    t_site = db.relationship('TSite', primaryjoin='CorSiteSthemeTheme.id_site == TSite.id_site', backref='cor_site_stheme_themes')
    cor_stheme_theme = db.relationship('CorSthemeTheme', primaryjoin='CorSiteSthemeTheme.id_stheme_theme == CorSthemeTheme.id_stheme_theme', backref='cor_site_stheme_themes')


class CorSthemeTheme(db.Model):
    __tablename__ = 'cor_stheme_theme'
    __table_args__ = {'schema': 'geopaysages'}

    id_stheme_theme = db.Column(db.Integer, nullable=False, unique=True, server_default=db.FetchedValue())
    id_stheme = db.Column(db.ForeignKey('geopaysages.dico_stheme.id_stheme'), primary_key=True, nullable=False)
    id_theme = db.Column(db.ForeignKey('geopaysages.dico_theme.id_theme'), primary_key=True, nullable=False)

    dico_stheme = db.relationship('DicoStheme', primaryjoin='CorSthemeTheme.id_stheme == DicoStheme.id_stheme', backref='cor_stheme_themes')
    dico_theme = db.relationship('DicoTheme', primaryjoin='CorSthemeTheme.id_theme == DicoTheme.id_theme', backref='cor_stheme_themes')


class DicoLicencePhoto(db.Model):
    __tablename__ = 'dico_licence_photo'
    __table_args__ = {'schema': 'geopaysages'}

    id_licence_photo = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_licence_photo = db.Column(db.String)
    description_licence_photo = db.Column(db.String)


class DicoStheme(db.Model):
    __tablename__ = 'dico_stheme'
    __table_args__ = {'schema': 'geopaysages'}

    id_stheme = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_stheme = db.Column(db.String)


class DicoTheme(db.Model):
    __tablename__ = 'dico_theme'
    __table_args__ = {'schema': 'geopaysages'}

    id_theme = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_theme = db.Column(db.String)



class TRole(db.Model):
    __tablename__ = 't_roles'
    __table_args__ = {'schema': 'utilisateurs'}

    groupe = db.Column(db.Boolean, nullable=False, server_default=db.FetchedValue())
    id_role = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    identifiant = db.Column(db.String(100))
    nom_role = db.Column(db.String(50))
    prenom_role = db.Column(db.String(50))
    desc_role = db.Column(db.Text)
    _pass = db.Column('pass', db.String(100))
    email = db.Column(db.String(250))
    id_organisme = db.Column(db.ForeignKey('utilisateurs.bib_organismes.id_organisme', onupdate='CASCADE'))
    organisme = db.Column(db.String(32))
    id_unite = db.Column(db.ForeignKey('utilisateurs.bib_unites.id_unite', onupdate='CASCADE'))
    remarques = db.Column(db.Text)
    pn = db.Column(db.Boolean)
    session_appli = db.Column(db.String(50))
    date_insert = db.Column(db.DateTime)
    date_update = db.Column(db.DateTime)


class TPhoto(db.Model):
    __tablename__ = 't_photo'
    __table_args__ = {'schema': 'geopaysages'}

    id_photo = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    id_site = db.Column(db.ForeignKey('geopaysages.t_site.id_site'))
    path_file_photo = db.Column(db.String)
    id_role = db.Column(db.ForeignKey('utilisateurs.t_roles.id_role'))
    date_photo = db.Column(db.Date)
    legende_photo = db.Column(db.String)
    display_gal_photo = db.Column(db.Boolean)
    id_licence_photo = db.Column(db.ForeignKey('geopaysages.dico_licence_photo.id_licence_photo'))

    dico_licence_photo = db.relationship('DicoLicencePhoto', primaryjoin='TPhoto.id_licence_photo == DicoLicencePhoto.id_licence_photo', backref='t_photos')
    t_role = db.relationship('TRole', primaryjoin='TPhoto.id_role == TRole.id_role', backref='t_photos')
    t_site = db.relationship('TSite', primaryjoin='TPhoto.id_site == TSite.id_site', backref='t_photos')


#schemas#
class DicoThemeSchema(ma.ModelSchema):
    class Meta:
        model = DicoTheme

class LicencePhotoSchema(ma.ModelSchema):
    class Meta:
        model = DicoLicencePhoto

class TPhotoSchema(ma.ModelSchema):
    dico_licence_photo = ma.Nested(LicencePhotoSchema ,exclude=['t_photos']) 
    class Meta:
        model = TPhoto
    
    
class TSiteSchema(ma.ModelSchema):
    class Meta:
        model = TSite
    
    

