import os
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

os.environ['FLASK_SQLALCHEMY_DB'] = 'env.db'
os.environ['FLASK_MARSHMALLOW'] = 'env.ma'

db = SQLAlchemy()
ma = Marshmallow()

