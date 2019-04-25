# coding: utf-8
from pypnusershub import routes
from routes import main as main_blueprint
from models import (db)
import models
from flask import Flask
from flask_babel import Babel, gettext, ngettext
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from api import api
import config
import json

class ReverseProxied(object):
    '''Wrap the application in this middleware and configure the 
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
    '''
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '')
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]

        scheme = environ.get('HTTP_X_SCHEME', '')
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        return self.app(environ, start_response)

app = Flask(__name__)
app.config['BABEL_DEFAULT_LOCALE'] = 'fr'
app.config['BABEL_TRANSLATION_DIRECTORIES'] = config.BABEL_TRANSLATION_DIRECTORIES
babel = Babel(app)
#app.wsgi_app = ReverseProxied(app.wsgi_app)
CORS(app, supports_credentials=True)

app.register_blueprint(main_blueprint)
app.register_blueprint(api)
app.register_blueprint(routes.routes, url_prefix='/api/auth')

app.config.from_pyfile('config.py')
db.init_app(app)

db = SQLAlchemy()

@app.context_processor
def inject_dbconf():
    sql = text("SELECT key, value FROM geopaysages.conf")
    result = db.engine.execute(sql).fetchall()
    rows = [dict(row) for row in result]
    conf = {}
    for row in rows:
        try:
            conf[row.get('key')] = json.loads(row.get('value'))
        except Exception as exception:
            conf[row.get('key')] = row.get('value')
        
    return dict(dbconf=conf)

if __name__ == "__main__":
    app.run(debug=True)
