# coding: utf-8
from geoalchemy2.types import Geometry
import geoalchemy2.functions as geo_funcs
from geoalchemy2.shape import to_shape
from marshmallow import fields
from marshmallow_enum import EnumField
from shapely.geometry import mapping

from enum import Enum
from env import db, ma
from sqlalchemy.dialects import postgresql


class Conf(db.Model):
    __tablename__ = "conf"
    __table_args__ = {"schema": "geopaysages"}

    key = db.Column(db.String, primary_key=True)
    value = db.Column(db.String)


class Lang(db.Model):
    __tablename__ = "lang"
    __table_args__ = (
        {"schema": "geopaysages"},
    )

    id = db.Column(db.String, primary_key=True)
    label = db.Column(db.String)
    is_published = db.Column(db.Boolean)
    is_default = db.Column(db.Boolean, default=False)
    __table_args__ = (
        db.UniqueConstraint('is_default', name='uq_default_lang'),
        {"schema": "geopaysages"},
    )
    observatory_translations = db.relationship(
        "ObservatoryTranslation", back_populates="lang"
    )
    site_translations = db.relationship("TSiteTranslation", back_populates="lang")
    dico_stheme_translations = db.relationship(
        "DicoSthemeTranslation", back_populates="lang"
    )
    dico_theme_translations = db.relationship(
        "DicoThemeTranslation", back_populates="lang"
    )
    communes_translations = db.relationship(
        "CommunesTranslation", back_populates="lang"
    )


class ComparatorEnum(Enum):
    sidebyside = "sidebyside"
    split = "split"


class Observatory(db.Model):
    __tablename__ = "t_observatory"
    __table_args__ = {"schema": "geopaysages"}

    id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    ref = db.Column(db.String)
    color = db.Column(db.String)
    thumbnail = db.Column(db.String)
    logo = db.Column(db.String)
    comparator = db.Column(db.Enum(ComparatorEnum, name="comparator_enum"))
    geom = db.Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326))
    translations = db.relationship(
        "ObservatoryTranslation", back_populates="row", lazy=True
    )


class ObservatoryTranslation(db.Model):
    __tablename__ = "t_observatory_translation"
    __table_args__ = {"schema": "geopaysages"}

    id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    title = db.Column(db.String)
    is_published = db.Column(db.Boolean)
    row_id = db.Column(
        db.ForeignKey("geopaysages.t_observatory.id", name="observatory_id")
    )
    row = db.relationship("Observatory", back_populates="translations")
    lang_id = db.Column(
        db.ForeignKey("geopaysages.lang.id", name="t_observatory_translation_fk_lang")
    )
    lang = db.relationship(
        "Lang", primaryjoin="ObservatoryTranslation.lang_id == Lang.id"
    )


class TSite(db.Model):
    __tablename__ = "t_site"
    __table_args__ = {"schema": "geopaysages"}

    id_site = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    id_observatory = db.Column(
        db.ForeignKey("geopaysages.t_observatory.id", name="t_site_fk_observatory")
    )
    observatory = db.relationship(
        "Observatory", primaryjoin="TSite.id_observatory == Observatory.id"
    )
    ref_site = db.Column(db.String)
    code_city_site = db.Column(db.String)
    alti_site = db.Column(db.Integer)
    path_file_guide_site = db.Column(db.String)
    geom = db.Column(Geometry(geometry_type="POINT", srid=4326))
    main_photo = db.Column(db.Integer)
    main_theme_id = db.Column(db.ForeignKey("geopaysages.dico_theme.id_theme"))
    main_theme = db.relationship(
        "DicoTheme", primaryjoin="TSite.main_theme_id == DicoTheme.id_theme"
    )
    translations = db.relationship("TSiteTranslation", back_populates="row", lazy=True)


class TSiteTranslation(db.Model):
    __tablename__ = "t_site_translation"
    __table_args__ = {"schema": "geopaysages"}

    id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_site = db.Column(db.String)
    desc_site = db.Column(db.String)
    testim_site = db.Column(db.String)
    legend_site = db.Column(db.String)
    publish_site = db.Column(db.Boolean)
    row_id = db.Column(db.ForeignKey("geopaysages.t_site.id_site", name="site_id_site"))
    row = db.relationship("TSite", back_populates="translations")
    lang_id = db.Column(
        db.ForeignKey("geopaysages.lang.id", name="t_site_translation_fk_lang")
    )
    lang = db.relationship("Lang", back_populates="site_translations")


class CorSiteSthemeTheme(db.Model):
    __tablename__ = "cor_site_stheme_theme"
    __table_args__ = {"schema": "geopaysages"}

    id_site_stheme_theme = db.Column(
        db.Integer, nullable=False, server_default=db.FetchedValue()
    )
    id_site = db.Column(
        db.ForeignKey("geopaysages.t_site.id_site"), primary_key=True, nullable=False
    )
    id_stheme_theme = db.Column(
        db.ForeignKey("geopaysages.cor_stheme_theme.id_stheme_theme"),
        primary_key=True,
        nullable=False,
    )

    t_site = db.relationship(
        "TSite",
        primaryjoin="CorSiteSthemeTheme.id_site == TSite.id_site",
        backref="cor_site_stheme_themes",
    )
    cor_stheme_theme = db.relationship(
        "CorSthemeTheme",
        primaryjoin="CorSiteSthemeTheme.id_stheme_theme == CorSthemeTheme.id_stheme_theme",
        backref="cor_site_stheme_themes",
    )


class CorSthemeTheme(db.Model):
    __tablename__ = "cor_stheme_theme"
    __table_args__ = {"schema": "geopaysages"}

    id_stheme_theme = db.Column(
        db.Integer, nullable=False, unique=True, server_default=db.FetchedValue()
    )
    id_stheme = db.Column(
        db.ForeignKey("geopaysages.dico_stheme.id_stheme"),
        primary_key=True,
        nullable=False,
    )
    id_theme = db.Column(
        db.ForeignKey("geopaysages.dico_theme.id_theme"),
        primary_key=True,
        nullable=False,
    )

    dico_stheme = db.relationship(
        "DicoStheme",
        primaryjoin="CorSthemeTheme.id_stheme == DicoStheme.id_stheme",
        backref="cor_stheme_themes",
    )
    dico_theme = db.relationship(
        "DicoTheme",
        primaryjoin="CorSthemeTheme.id_theme == DicoTheme.id_theme",
        backref="cor_stheme_themes",
    )


class DicoLicencePhoto(db.Model):
    __tablename__ = "dico_licence_photo"
    __table_args__ = {"schema": "geopaysages"}

    id_licence_photo = db.Column(
        db.Integer, primary_key=True, server_default=db.FetchedValue()
    )
    name_licence_photo = db.Column(db.String)
    description_licence_photo = db.Column(db.String)


class DicoStheme(db.Model):
    __tablename__ = "dico_stheme"
    __table_args__ = {"schema": "geopaysages"}

    id_stheme = db.Column(
        db.Integer, primary_key=True, server_default=db.FetchedValue()
    )
    translations = db.relationship(
        "DicoSthemeTranslation", back_populates="row", lazy=True
    )


class DicoSthemeTranslation(db.Model):
    __tablename__ = "dico_stheme_translation"
    __table_args__ = {"schema": "geopaysages"}

    id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_stheme = db.Column(db.String)
    row_id = db.Column(
        db.ForeignKey("geopaysages.dico_stheme.id_stheme", name="stheme_id_stheme")
    )
    row = db.relationship("DicoStheme", back_populates="translations")
    lang_id = db.Column(
        db.ForeignKey("geopaysages.lang.id", name="dico_stheme_translation_fk_lang")
    )
    lang = db.relationship("Lang", back_populates="dico_stheme_translations")


class DicoTheme(db.Model):
    __tablename__ = "dico_theme"
    __table_args__ = {"schema": "geopaysages"}

    id_theme = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    icon = db.Column(db.String)
    translations = db.relationship(
        "DicoThemeTranslation", back_populates="row", lazy=True
    )


class DicoThemeTranslation(db.Model):
    __tablename__ = "dico_theme_translation"
    __table_args__ = {"schema": "geopaysages"}

    id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    name_theme = db.Column(db.String)
    row_id = db.Column(
        db.ForeignKey("geopaysages.dico_theme.id_theme", name="theme_id_theme")
    )
    row = db.relationship("DicoTheme", back_populates="translations")
    lang_id = db.Column(
        db.ForeignKey("geopaysages.lang.id", name="dico_theme_translation_fk_lang")
    )
    lang = db.relationship("Lang", back_populates="dico_theme_translations")


class TRole(db.Model):
    __tablename__ = "t_roles"
    __table_args__ = {"schema": "utilisateurs", "extend_existing": True}

    groupe = db.Column(db.Boolean, nullable=False, server_default=db.FetchedValue())
    id_role = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    identifiant = db.Column(db.String(100))
    nom_role = db.Column(db.String(50))
    prenom_role = db.Column(db.String(50))
    desc_role = db.Column(db.Text)
    _pass = db.Column("pass", db.String(100))
    _pass_plus = db.Column("pass_plus", db.String(100))
    email = db.Column(db.String(250))
    id_organisme = db.Column(
        "id_organisme", db.INTEGER(), autoincrement=False, nullable=True
    )
    remarques = db.Column(db.Text)
    date_insert = db.Column(db.DateTime)
    date_update = db.Column(db.DateTime)
    uuid_role = db.Column(
        "uuid_role",
        postgresql.UUID(),
        server_default=db.text("uuid_generate_v4()"),
        autoincrement=False,
        nullable=False,
    )
    active = db.Column(
        "active",
        db.BOOLEAN(),
        server_default=db.text("true"),
        autoincrement=False,
        nullable=True,
    )
    champs_addi = db.Column(
        "champs_addi",
        postgresql.JSONB(astext_type=db.Text()),
        autoincrement=False,
        nullable=True,
    )


class TPhoto(db.Model):
    __tablename__ = "t_photo"
    __table_args__ = {"schema": "geopaysages"}

    id_photo = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    id_site = db.Column(db.ForeignKey("geopaysages.t_site.id_site"))
    id_observatory = db.Column(db.ForeignKey("geopaysages.t_observatory.id"))
    path_file_photo = db.Column(db.String)
    id_role = db.Column(db.ForeignKey("utilisateurs.t_roles.id_role"))
    date_photo = db.Column(db.String)
    filter_date = db.Column(db.Date)
    legende_photo = db.Column(db.String)
    display_gal_photo = db.Column(db.Boolean)
    id_licence_photo = db.Column(
        db.ForeignKey("geopaysages.dico_licence_photo.id_licence_photo")
    )

    dico_licence_photo = db.relationship(
        "DicoLicencePhoto",
        primaryjoin="TPhoto.id_licence_photo == DicoLicencePhoto.id_licence_photo",
        backref="t_photos",
    )
    t_role = db.relationship(
        "TRole", primaryjoin="TPhoto.id_role == TRole.id_role", backref="t_photos"
    )
    t_site = db.relationship(
        "TSite", primaryjoin="TPhoto.id_site == TSite.id_site", backref="t_photos"
    )


class Communes(db.Model):
    __tablename__ = "communes"
    __table_args__ = {"schema": "geopaysages"}

    code_commune = db.Column(
        db.String, primary_key=True, server_default=db.FetchedValue()
    )
    translations = db.relationship(
        "CommunesTranslation", back_populates="row", lazy=True
    )


class CommunesTranslation(db.Model):
    __tablename__ = "communes_translation"
    __table_args__ = {"schema": "geopaysages"}

    id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    nom_commune = db.Column(db.String)
    row_id = db.Column(
        db.ForeignKey("geopaysages.communes.code_commune", name="commune_code_commune")
    )
    row = db.relationship("Communes", back_populates="translations")
    lang_id = db.Column(
        db.ForeignKey("geopaysages.lang.id", name="communes_translation_fk_lang")
    )
    lang = db.relationship("Lang", back_populates="communes_translations")


class GeographySerializationField(fields.String):
    def _serialize(self, value, attr, obj):
        if value is None:
            return value
        else:
            if attr == "geom":
                return [
                    db.session.scalar(geo_funcs.ST_Y(value)),
                    db.session.scalar(geo_funcs.ST_X(value)),
                ]
            else:
                return None

    def _deserialize(self, value, attr, data):
        if value is None:
            return value
        else:
            if attr == "geom":
                return WKTGeographyElement(
                    "POINT({0} {1})".format(
                        str(value.get("longitude")), str(value.get("latitude"))
                    )
                )
            else:
                return None


# schemas#


class TranslationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ("lang_id", "title", "is_published")


class LangSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Lang
        fields = ("id", "label", "is_published", "is_default")


class CommunesTranslationSchema(ma.SQLAlchemyAutoSchema):
    lang = ma.Nested(LangSchema)

    class Meta:
        model = CommunesTranslation
        fields = ("nom_commune", "lang_id", "lang")


class ObservatoryTranslationSchema(ma.SQLAlchemyAutoSchema):
    lang = ma.Nested(LangSchema)

    class Meta:
        model = ObservatoryTranslation
        fields = ("title", "is_published", "lang_id")


class TSiteTranslationSchema(ma.SQLAlchemyAutoSchema):
    lang = ma.Nested(LangSchema)

    class Meta:
        model = TSiteTranslation
        fields = ("name_site", "desc_site", "legend_site", "publish_site", "lang_id")


class DicoThemeTranslationSchema(ma.SQLAlchemyAutoSchema):
    lang = ma.Nested(LangSchema)

    class Meta:
        model = DicoThemeTranslation
        fields = ("name_theme", "lang_id", "lang")


class DicoSthemeTranslationSchema(ma.SQLAlchemyAutoSchema):
    lang = ma.Nested(LangSchema)

    class Meta:
        model = DicoSthemeTranslation
        fields = ("name_stheme", "lang_id", "lang")


class DicoThemeSchema(ma.SQLAlchemyAutoSchema):
    translations = ma.Nested(DicoThemeTranslationSchema, many=True)

    class Meta:
        model = DicoTheme
        fields = ("id_theme", "icon", "translations")


class DicoSthemeSchema(ma.SQLAlchemyAutoSchema):
    translations = ma.Nested(DicoSthemeTranslationSchema, many=True)

    class Meta:
        model = DicoStheme
        include_relationships = True


class CorThemeSthemeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ("id_stheme_theme",)


class LicencePhotoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ("id_licence_photo", "name_licence_photo", "description_licence_photo")


class RoleSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ("id_role", "identifiant", "nom_role", "id_organisme")


class TPhotoSchema(ma.SQLAlchemyAutoSchema):
    dico_licence_photo = ma.Nested(LicencePhotoSchema)
    t_role = ma.Nested(RoleSchema)

    class Meta:
        model = TPhoto
        include_relationships = True


class CorSthemeThemeSchema(ma.SQLAlchemyAutoSchema):
    dico_theme = ma.Nested(DicoThemeSchema, only=["id_theme", "name_theme"])
    dico_stheme = ma.Nested(DicoSthemeSchema, only=["id_stheme", "name_stheme"])

    class Meta:
        fields = ("dico_theme", "dico_stheme")
        # model = CorSthemeTheme


class ObservatorySchema(ma.SQLAlchemyAutoSchema):
    translations = ma.Nested(ObservatoryTranslationSchema, many=True)
    comparator = EnumField(ComparatorEnum, by_value=True)
    geom = fields.Method("geomSerialize")

    @staticmethod
    def geomSerialize(obj):
        if obj.geom is None:
            return None
        p = to_shape(obj.geom)
        s = p.simplify(0.0001, preserve_topology=False)
        return s.wkt

    class Meta:
        model = Observatory
        include_relationships = True


class ObservatorySchemaFull(ObservatorySchema):
    @staticmethod
    def geomSerialize(obj):
        if obj.geom is None:
            return None
        p = to_shape(obj.geom)
        return p.wkt


class ObservatorySchemaLite(ObservatorySchema):
    comparator = EnumField(ComparatorEnum, by_value=False)

    @staticmethod
    def geomSerialize(obj):
        if obj.geom is None:
            return None
        p = to_shape(obj.geom)
        s = p.simplify(.001, preserve_topology=True)
        return s.wkt


class TSiteSchema(ma.SQLAlchemyAutoSchema):
    translations = ma.Nested(TSiteTranslationSchema, many=True)
    geom = GeographySerializationField(attribute="geom")
    observatory = ma.Nested(
        ObservatorySchema, only=["id", "title", "ref", "color", "logo"]
    )
    main_theme = ma.Nested(DicoThemeSchema, only=["id_theme", "translations", "icon"])

    class Meta:
        model = TSite
        include_fk = True
        include_relationships = True


class CommunesSchema(ma.SQLAlchemyAutoSchema):
    translations = ma.Nested(CommunesTranslationSchema, many=True)

    class Meta:
        model = Communes
        include_relationships = True
