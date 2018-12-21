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
def inject_dbconf():
    sql = text("SELECT key, value FROM geopaysages.conf")
    result = db.engine.execute(sql).fetchall()
    rows = [dict(row) for row in result]
    conf = {}
    for row in rows:
        conf[row.get('key')] = json.loads(row.get('value'))
    return dict(dbconf=conf)

if __name__ == "__main__":
    app.run(debug=True)
