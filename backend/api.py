from flask import Flask, request,Blueprint,jsonify
from routes import main as main_blueprint
#fnauth = importlib.import_module("apptax.UsersHub-authentification-module.routes")
from pypnusershub import routes
import models
from flask_cors import CORS
 

api = Blueprint('api', __name__)
