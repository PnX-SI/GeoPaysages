# coding: utf-8
from pypnusershub import routes
from routes import main as main_blueprint
from models import (db)
import models
from flask import Flask
from flask_cors import CORS
from flask_babel import Babel
from api import api

app = Flask(__name__)
app.config['BABEL_DEFAULT_LOCALE'] = 'fr'
babel = Babel(app)
CORS(app, supports_credentials=True)

app.register_blueprint(main_blueprint)
app.register_blueprint(api)
app.register_blueprint(routes.routes, url_prefix='/api/auth')

app.config.from_pyfile('config.py')
db.init_app(app)

if __name__ == "__main__":
    app.run(debug=True)
