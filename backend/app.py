# coding: utf-8
from authlib.jose import JsonWebToken
from authlib.jose.errors import ExpiredTokenError, JoseError
#from pypnusershub import routes
#from pypnusershub.login_manager import login_manager
from pypnusershub.db import models
from routes import main as main_blueprint
from flask import Flask, current_app
from flask_babel import Babel
from flask_cors import CORS
from flask_login import LoginManager
from api import api
import config
import utils
import os
import custom_app

from env import db, migrate

def decode_token(payload):
    jwt = JsonWebToken(["HS256"])
    key = current_app.config["SECRET_KEY"].encode("UTF-8")
    claims = jwt.decode(payload, key)
    claims.validate()
    return dict(claims)

login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(models.User, user_id)


@login_manager.request_loader
def load_user_from_request(request):
    bearer = request.headers.get("Authorization", default=None, type=str)
    if bearer:
        jwt = bearer.replace("Bearer ", "")
    else:
        return None
    try:
        user_dict = decode_token(jwt)
        user = db.session.get(models.User, user_dict["id_role"])
        g.login_via_request = True
        return user
    except (ExpiredTokenError, JoseError):
        return None


class ReverseProxied(object):
    """Wrap the application in this middleware and configure the
    front-end server to add these headers, to let you quietly bind
    this to a URL other than / and to an HTTP scheme that is
    different than what is used locally.

    In nginx:
    location /myprefix {
        proxy_pass http://192.168.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Script-Name /myprefix;
        }

    :param app: the WSGI application
    """

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        script_name = environ.get("HTTP_X_SCRIPT_NAME", "")
        if script_name:
            environ["SCRIPT_NAME"] = script_name
            path_info = environ["PATH_INFO"]
            if path_info.startswith(script_name):
                environ["PATH_INFO"] = path_info[len(script_name) :]

        scheme = environ.get("HTTP_X_SCHEME", "")
        if scheme:
            environ["wsgi.url_scheme"] = scheme
        return self.app(environ, start_response)


app = Flask(__name__)
app.config["BABEL_TRANSLATION_DIRECTORIES"] = config.BABEL_TRANSLATION_DIRECTORIES
babel = Babel(app)
# app.wsgi_app = ReverseProxied(app.wsgi_app)
CORS(app, supports_credentials=True)


@babel.localeselector
def determine_locale():
    locale = utils.getLocale()
    translation_ids = [str(translation) for translation in babel.list_translations()]
    translation_exists = locale in translation_ids
    if not translation_exists and "-" in locale:
        locale = locale.split("-")[0]
        translation_exists = locale in translation_ids
    if not translation_exists:
        default_lang = utils.getDefaultLang()
        locale = default_lang.id
    return locale


app.register_blueprint(main_blueprint)
app.register_blueprint(api)
app.register_blueprint(custom_app.custom)
#app.register_blueprint(routes.routes, url_prefix="/api/auth")

app.config.from_pyfile("config.py")
db.init_app(app)
login_manager.init_app(app)
migrate.init_app(app, db)


@app.context_processor
def inject_to_tpl():
    custom = custom_app.custom_inject_to_tpl()
    data = dict(
        dbconf=utils.getDbConf(),
        debug=app.debug,
        locale=utils.getLocale(),
        isMultiLangs=utils.isMultiLangs(),
        langs=utils.getLangs(),
        isMultiObservatories=utils.isMultiObservatories,
        getThumborUrl=utils.getThumborUrl,
        getCustomTpl=utils.getCustomTpl,
        getLocalizedLink=utils.getLocalizedLink,
        getLocalizedRequestEndpoint=utils.getLocalizedRequestEndpoint,
    )
    data.update(custom)
    return data


if __name__ == "__main__":
    app.run(debug=True)
