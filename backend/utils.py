from base64 import urlsafe_b64encode
from flask import url_for, request, redirect
from functools import wraps
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import json
from flask_babel import gettext
import random
import string
import models
import hmac
import hashlib
import urllib.parse

db = SQLAlchemy()

photo_schema = models.TPhotoSchema(many=True)
themes_sthemes_schema = models.CorSthemeThemeSchema(many=True)


def localeGuard(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        locale = request.view_args.get("locale")
        if not isMultiLangs() and locale is not None:
            return redirect(url_for(request.endpoint))
        langs = models.Lang.query.filter_by(is_published=True).all()
        lang_ids = [lang.id for lang in langs]
        defaultLang = next((lang for lang in langs if lang.is_default), None)
        if isMultiLangs() and locale is not None and locale not in lang_ids:
            view_args = dict(**request.view_args)
            view_args.pop("locale", None)
            return redirect(getLocalizedRequestEndpoint(defaultLang.id))

        if isMultiLangs() and locale is None:
            userLang = request.accept_languages[0][0].split("-")[0]
            if userLang in lang_ids:
                return redirect(getLocalizedRequestEndpoint(userLang))
            return redirect(getLocalizedRequestEndpoint(defaultLang.id))
        return f(*args, **kwargs)

    return decorated_function


def getLocalizedRequestEndpoint(locale):
    view_args = dict(**request.view_args)
    view_args.pop("locale", None)
    return url_for(request.endpoint, locale=locale, **view_args)


def getLangs():
    return (
        models.Lang.query.filter_by(is_published=True).order_by(models.Lang.label).all()
    )


def getDefaultLang():
    return models.Lang.query.filter_by(is_default=True).first()


def getLocale():
    locale = request.view_args.get("locale")
    if locale is None:
        # TODO
        default_lang = getDefaultLang()
        locale = default_lang.id
    return locale


def isMultiLangs():
    count = models.Lang.query.filter_by(is_published=True).count()
    return count > 1


def getLocalizedLink(link):
    is_multi_langs = isMultiLangs()
    if not is_multi_langs:
        return link
    return f"/{getLocale()}{link}"


def getCustomTpl(name):
    tpl_local = f"custom/{name}_{getLocale()}.jinja"
    tpl_common = f"custom/{name}.jinja"
    if os.path.exists(f"tpl/{tpl_local}"):
        return tpl_local
    if os.path.exists(f"tpl/{tpl_common}"):
        return tpl_common
    return None


def getThumborSignature(url):
    key = bytes(os.getenv("THUMBOR_SECURITY_KEY"), "UTF-8")
    msg = bytes(url, "UTF-8")
    h = hmac.new(key, msg, hashlib.sha1)
    return urlsafe_b64encode(h.digest()).decode("ascii")


def getThumborUrl(params, filename):
    if params.startswith("/"):
        params = params[1:]
    url = (
        params
        + "/"
        + urllib.parse.quote(f"http://backend/static/upload/images/{filename}", safe="")
    )
    signature = getThumborSignature(url)
    return f"/thumbor/{signature}/{url}"


def getRandStr(nb):
    chars = string.ascii_lowercase + string.digits
    return "".join(random.choice(chars) for i in range(nb))


def getDbConf():
    sql = text("SELECT key, value FROM geopaysages.conf")
    result = db.engine.execute(sql).fetchall()
    rows = [dict(row) for row in result]
    conf = {}
    for row in rows:
        try:
            conf[row.get("key")] = json.loads(row.get("value"))
        except Exception as exception:
            conf[row.get("key")] = row.get("value")

    conf["default_sort_sites"] = conf.get(
        "default_sort_sites", "geopaysages.t_site_translation.name_site"
    )

    return conf


def isMultiObservatories():
    locale = getLocale()
    sql = text(
        f"""SELECT count(*) 
        FROM geopaysages.t_observatory o 
        join geopaysages.t_observatory_translation ot on o.id = ot.row_id and ot.lang_id = '{locale}' 
        where ot.is_published is true"""
    )
    result = db.engine.execute(sql)
    count = result.scalar()
    if count > 1:
        return True
    return False


def getLocalizedSitesQuery():
    locale = getLocale()
    return (
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


def getFiltersData():
    dbconf = getDbConf()
    locale = getLocale()
    observatory_schema = models.ObservatorySchema(many=True, locale=locale)
    site_schema = models.TSiteSchema(many=True, locale=locale)
    dicotheme_schema = models.DicoThemeSchema(many=True, locale=locale)
    dicostheme_schema = models.DicoSthemeSchema(many=True, locale=locale)

    sites = site_schema.dump(
        getLocalizedSitesQuery().order_by(text(dbconf["default_sort_sites"]))
    )
    for site in sites:
        cor_sthemes_themes = site.get("cor_site_stheme_themes")
        cor_list = []
        themes_list = []
        subthemes_list = []
        for cor in cor_sthemes_themes:
            cor_list.append(cor.get("id_stheme_theme"))
        query = models.CorSthemeTheme.query.filter(
            models.CorSthemeTheme.id_stheme_theme.in_(cor_list)
        )
        themes_sthemes = themes_sthemes_schema.dump(query)

        for item in themes_sthemes:
            if item.get("dico_theme").get("id_theme") not in themes_list:
                themes_list.append(item.get("dico_theme").get("id_theme"))
            if item.get("dico_stheme").get("id_stheme") not in subthemes_list:
                subthemes_list.append(item.get("dico_stheme").get("id_stheme"))

        get_photos_by_site = models.TPhoto.query.filter_by(id_site=site.get("id_site"))
        photos = photo_schema.dump(get_photos_by_site)

        site["link"] = url_for("main.site", id_site=site.get("id_site"), _external=True)
        site["latlon"] = site.get("geom")
        site["themes"] = themes_list
        site["subthemes"] = subthemes_list
        site["township"] = site.get("code_city_site")

        site["years"] = set()
        for photo in photos:
            year = str(photo.get("filter_date")).split("-")[0]
            site["years"].add(year)
            photo["year"] = year
        site["years"] = list(site["years"])
        site["photos"] = photos

    subthemes = dicostheme_schema.dump(models.DicoStheme.query.all())
    for sub in subthemes:
        themes_of_subthemes = []
        for item in sub.get("cor_stheme_themes"):
            themes_of_subthemes.append(item.get("id_theme"))
        sub["themes"] = themes_of_subthemes

    filters = [
        {"name": "themes", "label": gettext("sites.filter.themes"), "items": set()},
        {
            "name": "subthemes",
            "label": gettext("sites.filter.subthemes"),
            "items": set(),
        },
        {
            "name": "township",
            "hideNoMatched": True,
            "label": gettext("sites.filter.township"),
            "items": set(),
        },
        {
            "name": "years",
            "hideNoMatched": True,
            "label": gettext("sites.filter.years"),
            "items": set(),
        },
    ]

    for site in sites:
        # Compute the prop years
        site["years"] = set()
        for photo in site.get("photos"):
            site["years"].add(photo.get("year"))
        site["years"] = list(site["years"])

        for filter in filters:
            val = site.get(filter.get("name"))
            if isinstance(val, (list, set)):
                filter.get("items").update(val)
            else:
                filter.get("items").add(val)

    themes = dicotheme_schema.dump(models.DicoTheme.query.all())
    themes = [
        {
            "id": item["id_theme"],
            "label": item["name_theme"],
            "icon": item["icon"],
        }
        for item in themes
    ]

    subthemes = [
        {
            "id": item["id_stheme"],
            "label": item["name_stheme"],
            "themes": item["themes"],
        }
        for item in subthemes
    ]

    filter_township = [
        filter for filter in filters if filter.get("name") == "township"
    ][0]
    if not filter_township.get("items"):
        townships = []
    else:
        str_map_in = ["'" + township + "'" for township in filter_township.get("items")]
        sql_map_str = f"""SELECT c.code_commune AS id, ct.nom_commune AS label 
            FROM geopaysages.communes c
            JOIN geopaysages.communes_translation ct on ct.row_id = c.code_commune
            WHERE code_commune IN ({",".join(str_map_in)})
            AND ct.lang_id = '{locale}'"""
        sql_map = text(sql_map_str)
        townships_result = db.engine.execute(sql_map).fetchall()
        townships = [dict(row) for row in townships_result]

    for site in sites:
        site["ville"] = next(
            township
            for township in townships
            if township.get("id") == site.get("township")
        )

    dbs = {"themes": themes, "subthemes": subthemes, "township": townships}

    photo_ids = []
    sites_without_photo = []
    for site in sites:
        photo_id = site.get("main_photo")
        if photo_id:
            photo_ids.append(site.get("main_photo"))
        else:
            sites_without_photo.append(str(site.get("id_site")))

    query_photos = models.TPhoto.query.filter(models.TPhoto.id_photo.in_(photo_ids))
    dump_photos = photo_schema.dump(query_photos)

    if len(sites_without_photo):
        sql_missing_photos_str = (
            "select distinct on (id_site) * from geopaysages.t_photo where id_site IN ("
            + ",".join(sites_without_photo)
            + ") order by id_site, filter_date desc"
        )
        sql_missing_photos = text(sql_missing_photos_str)
        missing_photos_result = db.engine.execute(sql_missing_photos).fetchall()
        missing_photos = [dict(row) for row in missing_photos_result]
        for missing_photo in missing_photos:
            missing_photo["t_site"] = missing_photo.get("id_site")
            dump_photos.append(missing_photo)

    for site in sites:
        id_site = site.get("id_site")
        try:
            photo = next(
                photo for photo in dump_photos if (photo.get("t_site") == id_site)
            )
            site["photo"] = photo.get(
                "path_file_photo"
            )  # getThumbnail(photo).get('output_url')
        except StopIteration:
            pass

    def getItem(name, id):
        return next(item for item in dbs.get(name) if item.get("id") == id)

    for filter in filters:
        if filter.get("name") == "years":
            filter["items"] = [
                {"label": str(year), "id": year} for year in filter.get("items")
            ]
            filter["items"] = sorted(
                filter["items"], key=lambda k: k["label"], reverse=True
            )
        else:
            filter["items"] = [
                getItem(filter.get("name"), item_id) for item_id in filter.get("items")
            ]
            filter["items"] = sorted(filter["items"], key=lambda k: k["label"])

    observatories = []
    for site in sites:
        try:
            next(
                (item for item in observatories if item["id"] == site["id_observatory"])
            )
        except StopIteration:
            observatory_row = models.Observatory.query.filter_by(
                id=site["id_observatory"]
            )
            observatory = observatory_schema.dump(observatory_row)
            observatory = observatory[0]
            observatories.append(
                {
                    "id": site["id_observatory"],
                    "label": observatory["title"],
                    "data": {
                        "geom": observatory["geom"],
                        "color": observatory["color"],
                        "logo": observatory["logo"],
                    },
                }
            )

    observatories = sorted(observatories, key=lambda d: d["label"])
    for observatory in observatories:
        observatory["sites"] = [
            site for site in sites if site["id_observatory"] == observatory["id"]
        ]

    if len(observatories) > 1:
        filters.insert(
            0,
            {
                "name": "id_observatory",
                "label": gettext("sites.filter.obervatories"),
                "items": observatories,
            },
        )

    return {"filters": filters, "observatories": observatories}
