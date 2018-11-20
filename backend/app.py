# coding: utf-8
from pypnusershub import routes
from routes import main as main_blueprint
from models import (db)
import models
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)



cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config.from_pyfile('config.py')

db.init_app(app)

app.register_blueprint(main_blueprint)
app.register_blueprint(api, url_prefix='/api/auth')

import api  # noqa
app.register_blueprint(api.api)
api.init_app(app)


if __name__ == "__main__":
    app.run(debug=True)
