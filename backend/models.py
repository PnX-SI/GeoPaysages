# coding: utf-8
from geoalchemy2.types import Geometry
import geoalchemy2.functions as geo_funcs
from marshmallow import fields

from env import db, ma
from sqlalchemy.dialects import postgresql


class Config(db.Model):
    __tablename__ = 'config'
    __table_args__ = {'schema': 'geopaysages'}
    key = db.Column(db.String, primary_key=True)
    value = db.Column(db.String)

class TSite(db.Model):
    __tablename__ = 't_site'
    __table_args__ = {'schema': 'geopaysages'}

    id_site = db.Column(db.Integer, primary_key=True,
                        server_default=db.FetchedValue())
    name_site = db.Column(db.String)
    ref_site = db.Column(db.String)
    desc_site = db.Column(db.String)
    legend_site = db.Column(db.String)
    testim_site = db.Column(db.String)
    code_city_site = db.Column(db.String)
    alti_site = db.Column(db.Integer)
    path_file_guide_site = db.Column(db.String)
    publish_site = db.Column(db.Boolean)
    geom = db.Column(Geometry(geometry_type='POINT', srid=4326))
    main_photo = db.Column(db.Integer)


class CorSiteSthemeTheme(db.Model):
    __tablename__ = 'cor_site_stheme_theme'
    __table_args__ = {'schema': 'geopaysages'}

    id_site_stheme_theme = db.Column(
        db.Integer, nullable=False, server_default=db.FetchedValue())
    id_site = db.Column(db.ForeignKey(
        'geopaysages.t_site.id_site'), primary_key=True, nullable=False)
    id_stheme_theme = db.Column(db.ForeignKey(
        'geopaysages.cor_stheme_theme.id_stheme_theme'), primary_key=True, nullable=False)

    t_site = db.relationship(
        'TSite', primaryjoin='CorSiteSthemeTheme.id_site == TSite.id_site', backref='cor_site_stheme_themes')
    cor_stheme_theme = db.relationship(
        'CorSthemeTheme', primaryjoin='CorSiteSthemeTheme.id_stheme_theme == CorSthemeTheme.id_stheme_theme', backref='cor_site_stheme_themes')


class CorSthemeTheme(db.Model):
    __tablename__ = 'cor_stheme_theme'
    __table_args__ = {'schema': 'geopaysages'}

    id_stheme_theme = db.Column(
        db.Integer, nullable=False, unique=True, server_default=db.FetchedValue())
    id_stheme = db.Column(db.ForeignKey(
        'geopaysages.dico_stheme.id_stheme'), primary_key=True, nullable=False)
    id_theme = db.Column(db.ForeignKey(
        'geopaysages.dico_theme.id_theme'), primary_key=True, nullable=False)

    dico_stheme = db.relationship(
        'DicoStheme', primaryjoin='CorSthemeTheme.id_stheme == DicoStheme.id_stheme', backref='cor_stheme_themes')
    dico_theme = db.relationship(
        'DicoTheme', primaryjoin='CorSthemeTheme.id_theme == DicoTheme.id_theme', backref='cor_stheme_themes')


class DicoLicencePhoto(db.Model):
    __tablename__ = 'dico_licence_photo'
    __table_args__ = {'schema': 'geopaysages'}

    id_licence_photo = db.Column(
        db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_licence_photo = db.Column(db.String)
    description_licence_photo = db.Column(db.String)


class DicoStheme(db.Model):
    __tablename__ = 'dico_stheme'
    __table_args__ = {'schema': 'geopaysages'}

    id_stheme = db.Column(db.Integer, primary_key=True,
                          server_default=db.FetchedValue())
    name_stheme = db.Column(db.String)


class DicoTheme(db.Model):
    __tablename__ = 'dico_theme'
    __table_args__ = {'schema': 'geopaysages'}

    id_theme = db.Column(db.Integer, primary_key=True,
                         server_default=db.FetchedValue())
    name_theme = db.Column(db.String)


class TRole(db.Model):
    __tablename__ = 't_roles'
    __table_args__ = {'schema': 'utilisateurs', 'extend_existing': True}

    groupe = db.Column(db.Boolean, nullable=False,
                       server_default=db.FetchedValue())
    id_role = db.Column(db.Integer, primary_key=True,
                        server_default=db.FetchedValue())
    identifiant = db.Column(db.String(100))
    nom_role = db.Column(db.String(50))
    prenom_role = db.Column(db.String(50))
    desc_role = db.Column(db.Text)
    _pass = db.Column('pass', db.String(100))
    _pass_plus = db.Column('pass_plus', db.String(100))
    email = db.Column(db.String(250))
    id_organisme = db.Column('id_organisme', db.INTEGER(), autoincrement=False, nullable=True)
    remarques = db.Column(db.Text)
    date_insert = db.Column(db.DateTime)
    date_update = db.Column(db.DateTime)
    uuid_role = db.Column('uuid_role', postgresql.UUID(), server_default=db.text('uuid_generate_v4()'), autoincrement=False, nullable=False)
    active = db.Column('active', db.BOOLEAN(), server_default=db.text('true'), autoincrement=False, nullable=True)
    champs_addi = db.Column('champs_addi', postgresql.JSONB(astext_type=db.Text()), autoincrement=False, nullable=True)


class TPhoto(db.Model):
    __tablename__ = 't_photo'
    __table_args__ = {'schema': 'geopaysages'}

    id_photo = db.Column(db.Integer, primary_key=True,
                         server_default=db.FetchedValue())
    id_site = db.Column(db.ForeignKey('geopaysages.t_site.id_site'))
    path_file_photo = db.Column(db.String)
    id_role = db.Column(db.ForeignKey('utilisateurs.t_roles.id_role'))
    date_photo = db.Column(db.String)
    filter_date = db.Column(db.Date)
    legende_photo = db.Column(db.String)
    display_gal_photo = db.Column(db.Boolean)
    id_licence_photo = db.Column(db.ForeignKey(
        'geopaysages.dico_licence_photo.id_licence_photo'))

    dico_licence_photo = db.relationship(
        'DicoLicencePhoto', primaryjoin='TPhoto.id_licence_photo == DicoLicencePhoto.id_licence_photo', backref='t_photos')
    t_role = db.relationship(
        'TRole', primaryjoin='TPhoto.id_role == TRole.id_role', backref='t_photos')
    t_site = db.relationship(
        'TSite', primaryjoin='TPhoto.id_site == TSite.id_site', backref='t_photos')


class Communes(db.Model):
    __tablename__ = 'communes'
    __table_args__ = {'schema': 'geopaysages'}

    code_commune = db.Column(db.String, primary_key=True,
                             server_default=db.FetchedValue())
    nom_commune = db.Column(db.String)


class GeographySerializationField(fields.String):
    def _serialize(self, value, attr, obj):
        if value is None:
            return value
        else:
            if attr == 'geom':
                return [db.session.scalar(geo_funcs.ST_Y(value)), db.session.scalar(geo_funcs.ST_X(value))]
            else:
                return None

    def _deserialize(self, value, attr, data):
        if value is None:
            return value
        else:
            if attr == 'geom':
                return WKTGeographyElement('POINT({0} {1})'.format(str(value.get('longitude')), str(value.get('latitude'))))
            else:
                return None

#schemas#


class DicoThemeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ('id_theme', 'name_theme')


class DicoSthemeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = DicoStheme
        include_relationships = True


class CorThemeSthemeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ('id_stheme_theme',)


class LicencePhotoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ('id_licence_photo', 'name_licence_photo',
                  'description_licence_photo')


class RoleSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ('id_role', 'identifiant', 'nom_role',
                  'id_organisme')


class TPhotoSchema(ma.SQLAlchemyAutoSchema):
    dico_licence_photo = ma.Nested(LicencePhotoSchema)
    t_role = ma.Nested(RoleSchema)

    class Meta:
        model = TPhoto
        include_relationships = True


class CorSthemeThemeSchema(ma.SQLAlchemyAutoSchema):
    dico_theme = ma.Nested(DicoThemeSchema, only=["id_theme", "name_theme"])
    dico_stheme = ma.Nested(DicoSthemeSchema, only=[
                            "id_stheme", "name_stheme"])

    class Meta:
        fields = ('dico_theme', 'dico_stheme')
        #model = CorSthemeTheme


class TSiteSchema(ma.SQLAlchemyAutoSchema):
    geom = GeographySerializationField(attribute='geom')

    class Meta:
        model = TSite
        include_relationships = True


class CommunesSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Communes
