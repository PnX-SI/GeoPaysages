# coding: utf-8
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from marshmallow import fields

db = SQLAlchemy()
ma = Marshmallow()


class UsersView(db.Model):
    __tablename__ = 'v_userslist_forall_applications'
    __table_args__ = {u'schema': 'utilisateurs'}

    groupe = db.Column(db.Boolean)
    id_role = db.Column(db.Integer, primary_key=True)
    identifiant = db.Column(db.String(100))
    nom_role = db.Column(db.String(50))
    prenom_role = db.Column(db.String(50))
    desc_role = db.Column(db.Text)
    email = db.Column(db.String(250))
    id_organisme = db.Column(db.Integer, primary_key=True)
    organisme = db.Column(db.String(32))
    id_unite = db.Column(db.Integer, primary_key=True)
    remarques = db.Column(db.Text)
    pn = db.Column(db.Boolean)
    session_appli = db.Column(db.String(50))
    id_application = db.Column(db.Integer,  primary_key=True)


#schemas#
class usersViewSchema(ma.ModelSchema):
    class Meta:
        model = UsersView
