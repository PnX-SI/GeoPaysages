# coding: utf-8
from flask import Flask

app = Flask(__name__)
import models
app.config.from_pyfile('config.py')
from models import (db)

db.init_app(app)

from routes import main as main_blueprint
app.register_blueprint(main_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
