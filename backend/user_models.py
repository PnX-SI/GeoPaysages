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

    id_role = db.Column(db.Integer, primary_key=True)
    identifiant = db.Column(db.String)
    nom_role = db.Column(db.String)
    id_organisme = db.Column(db.Integer)
    id_application = db.Column(db.Integer)
    id_droit_max = db.Column(db.Integer)

#schemas#


class usersViewSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        fields = ('id_role', 'identifiant', 'nom_role',
                  'id_organisme', 'id_application', 'id_droit_max')
