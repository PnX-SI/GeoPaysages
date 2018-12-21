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

app = Flask(__name__)
app.config['BABEL_DEFAULT_LOCALE'] = 'fr'
app.config['BABEL_TRANSLATION_DIRECTORIES'] = config.BABEL_TRANSLATION_DIRECTORIES
babel = Babel(app)
CORS(app, supports_credentials=True)

app.register_blueprint(main_blueprint)
app.register_blueprint(api)
app.register_blueprint(routes.routes, url_prefix='/api/auth')

app.config.from_pyfile('config.py')
db.init_app(app)

db = SQLAlchemy()

@app.context_processor
def inject_external_links():
    sql = text("SELECT value FROM geopaysages.conf WHERE key = 'external_links'")
    rows = db.engine.execute(sql).fetchall()
    if len(rows):
        external_links = json.loads(rows[0]['value'])
    else:
        external_links = json.loads('[]')
    return dict(external_links=external_links)

if __name__ == "__main__":
    app.run(debug=True)
