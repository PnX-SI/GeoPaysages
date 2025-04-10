from flask import render_template, Blueprint, abort, request, redirect, url_for
from functools import wraps
from sqlalchemy import text
from sqlalchemy.sql.expression import desc
import models
import utils
from config import COMPARATOR_VERSION
from datetime import datetime
import math
import os

main = Blueprint("main", __name__, template_folder="tpl")

from env import db

photo_schema = models.TPhotoSchema(many=True)
themes_sthemes_schema = models.CorSthemeThemeSchema(many=True)
sthemes_schema = models.DicoSthemeSchema(many=True)


@main.route("/")
@main.route("/<string:locale>/")
@utils.localeGuard
def home(locale=None):
    locale = utils.getLocale()
    site_schema = models.TSiteSchema(many=True, locale=locale)
    communes_schema = models.CommunesSchema(many=True, locale=locale)
    sql = text(
        f"""SELECT * FROM geopaysages.t_site p 
        join geopaysages.t_site_translation pt on p.id_site=pt.row_id and pt.lang_id = '{locale}'
        join geopaysages.t_observatory o on o.id=p.id_observatory 
        join geopaysages.t_observatory_translation ot on o.id=ot.row_id and ot.lang_id = '{locale}'
        where pt.publish_site=true and ot.is_published is true ORDER BY RANDOM() LIMIT 6
        """
    )
    sites_proxy = db.engine.execute(sql).fetchall()
    sites = [dict(row.items()) for row in sites_proxy]

    if len(sites):
        diff_nb = 6 - len(sites)
        for x in range(0, diff_nb):
            sites.append(sites[x])

    photo_ids = []
    sites_without_photo = []
    code_communes = []
    for site in sites:
        photo_id = site.get("main_photo")
        if photo_id:
            photo_ids.append(site.get("main_photo"))
        else:
            sites_without_photo.append(str(site.get("id_site")))
        code_communes.append(site.get("code_city_site"))

    query_photos = models.TPhoto.query.filter(models.TPhoto.id_photo.in_(photo_ids))
    dump_photos = photo_schema.dump(query_photos)
    # WAHO tordu l'histoire!
    if len(sites_without_photo):
        sql_missing_photos_str = (
            "select distinct on (id_site) p.* from geopaysages.t_photo p "
            + "join geopaysages.t_observatory o on o.id=p.id_observatory "
            + "join geopaysages.t_observatory_translation ot on o.id=ot.row_id and ot.lang_id = '"
            + locale
            + "' "
            + "where p.id_site IN ("
            + ",".join(sites_without_photo)
            + ") and ot.is_published is true order by id_site, filter_date desc"
        )
        sql_missing_photos = text(sql_missing_photos_str)
        missing_photos_result = db.engine.execute(sql_missing_photos).fetchall()
        missing_photos = [dict(row) for row in missing_photos_result]
        for missing_photo in missing_photos:
            missing_photo["t_site"] = missing_photo.get("id_site")
            dump_photos.append(missing_photo)

    query_commune = models.Communes.query.filter(
        models.Communes.code_commune.in_(code_communes)
    )
    dump_communes = communes_schema.dump(query_commune)
    for site in sites:
        id_site = site.get("id_site")
        photo = None
        try:
            photo = next(
                photo for photo in dump_photos if (photo.get("t_site") == id_site)
            )
        except StopIteration:
            pass
        if photo:
            site["photo"] = photo.get(
                "path_file_photo"
            )  # utils.getMedium(photo).get('output_url')
        site["commune"] = next(
            commune
            for commune in dump_communes
            if (commune.get("code_commune") == site.get("code_city_site"))
        )

    all_sites = site_schema.dump(
        models.TSite.query.join(
            models.TSiteTranslation,
            (models.TSite.id_site == models.TSiteTranslation.row_id)
            & (models.TSiteTranslation.lang_id == locale),
        )
        .join(models.Observatory)
        .join(
            models.ObservatoryTranslation,
            (models.Observatory.id == models.ObservatoryTranslation.row_id)
            & (models.ObservatoryTranslation.lang_id == locale),
        )
        .filter(
            models.TSiteTranslation.publish_site == True,
            models.ObservatoryTranslation.is_published == True,
        )
    )

    carousel_photos = [
        fileName for fileName in os.listdir("/app/static/custom/home-carousel")
    ]
    carousel_photos = list(filter(lambda x: x != ".gitkeep", carousel_photos))

    if utils.isMultiObservatories() == True:
        observatories = (
            models.Observatory.query.join(
                models.ObservatoryTranslation,
                (models.Observatory.id == models.ObservatoryTranslation.row_id)
                & (models.ObservatoryTranslation.lang_id == locale),
            )
            .filter(models.ObservatoryTranslation.is_published == True)
            .order_by(models.ObservatoryTranslation.title)
        )
        observatory_schema_lite = models.ObservatorySchemaLite(many=True, locale=locale)
        dump_observatories = observatory_schema_lite.dump(observatories)

        col_max = 5
        nb_obs = len(dump_observatories) + 1
        nb_rows = math.ceil(nb_obs / col_max)
        nb_cols = math.ceil(nb_obs / nb_rows)

        patchwork_options = {"nb_cols": nb_cols}
        return render_template(
            "home_multi_obs.jinja",
            carousel_photos=carousel_photos,
            observatories=dump_observatories,
            sites=all_sites,
            patchwork_options=patchwork_options,
        )

    return render_template(
        "home_mono_obs.jinja",
        carousel_photos=carousel_photos,
        blocks=sites,
        sites=all_sites,
    )


@main.route("/gallery/")
@main.route("/<string:locale>/gallery/")
def gallery(locale=None):
    data = utils.getFiltersData()

    return render_template(
        "gallery.jinja",
        filters=data["filters"],
        sites=data["sites"],
        observatories=data["observatories"],
    )


@main.route("/sites/<int:id_site>/")
@main.route("/<string:locale>/sites/<int:id_site>/")
@utils.localeGuard
def site(id_site, locale=None):
    site_schema = models.TSiteSchema(many=True, locale=locale)
    communes_schema = models.CommunesSchema(many=True, locale=locale)
    get_site_by_id = utils.getLocalizedSitesQuery().filter(
        models.TSite.id_site == id_site
    )
    site = site_schema.dump(get_site_by_id)
    if len(site) == 0:
        return abort(404)

    site = site[0]

    get_villes = models.Communes.query.filter_by(
        code_commune=site.get("code_city_site")
    )
    site["ville"] = communes_schema.dump(get_villes)[0]

    get_photos_by_site = models.TPhoto.query.filter_by(
        id_site=id_site, display_gal_photo=True
    ).order_by("filter_date")
    photos = photo_schema.dump(get_photos_by_site)

    cor_sthemes_themes = site.get("cor_site_stheme_themes")
    cor_list = []
    subthemes_list = []
    for cor in cor_sthemes_themes:
        cor_list.append(cor.get("id_stheme_theme"))
    query = models.CorSthemeTheme.query.filter(
        models.CorSthemeTheme.id_stheme_theme.in_(cor_list)
    )
    themes_sthemes = themes_sthemes_schema.dump(query)

    id_sthemes = [item.get("dico_stheme").get("id_stheme") for item in themes_sthemes]
    translations_query = models.DicoSthemeTranslation.query.filter(
        models.DicoSthemeTranslation.row_id.in_(id_sthemes),
        models.DicoSthemeTranslation.lang_id == locale,
    ).all()

    for translation in translations_query:
        subthemes_list.append(translation.name_stheme)

    site["stheme"] = list(set(subthemes_list))

    def getPhoto(photo):
        captions = []
        licence_photo = photo.get("dico_licence_photo")
        if licence_photo:
            captions.append(licence_photo.get("name_licence_photo"))
        caption = " | ".join(captions)

        return {
            "id": photo.get("id_photo"),
            "filename": photo.get("path_file_photo"),
            "shot_on": photo.get("filter_date"),
            "date_approx": photo.get("date_photo"),
            "caption": caption,
        }

    photos = [getPhoto(photo) for photo in photos]

    return render_template(
        "site.jinja", site=site, photos=photos, comparator_version=COMPARATOR_VERSION
    )


@main.route("/sites/<int:id_site>/photos/latest/")
def site_photos_last(id_site):
    site_schema = models.TSiteSchema(many=True)
    get_site_by_id = models.TSite.query.filter_by(id_site=id_site, publish_site=True)
    site = site_schema.dump(get_site_by_id)
    if len(site) == 0:
        return abort(404)

    site = site[0]

    get_photos_by_site = (
        models.TPhoto.query.filter_by(id_site=id_site, display_gal_photo=True)
        .order_by(desc(models.TPhoto.filter_date))
        .limit(1)
    )
    photos = photo_schema.dump(get_photos_by_site)
    photo = photos[0]

    date_approx = photo.get("date_photo")
    if date_approx:
        photo["date_display"] = date_approx
    else:
        date_obj = datetime.strptime(photo.get("filter_date"), "%Y-%m-%d")
        photo["date_display"] = date_obj.strftime("%d-%m-%Y")

    return render_template("site_photo.jinja", site=site, photo=photo)


@main.route("/sites/")
@main.route("/<string:locale>/sites/")
@utils.localeGuard
def sites(locale=None):
    data = utils.getFiltersData()

    return render_template(
        "sites.jinja",
        filters=data["filters"],
        observatories=data["observatories"],
    )


@main.route("/legal-notices/")
@main.route("/<string:locale>/legal-notices/")
@utils.localeGuard
def legal_notices(locale=None):

    tpl = utils.getCustomTpl("legal_notices")

    if not tpl:
        return abort(404)

    return render_template(tpl)
