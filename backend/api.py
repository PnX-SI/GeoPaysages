from flask import Flask, request, Blueprint, jsonify
from routes import main as main_blueprint
#fnauth = importlib.import_module("apptax.UsersHub-authentification-module.routes")
from pypnusershub import routes
import models
from flask_cors import CORS

api = Blueprint('api', __name__)

photo_schema = models.TPhotoSchema(many=True)
site_schema = models.TSiteSchema(many=True)

@api.route('/api/sites', methods=['GET'])
def returnAllSites():
    try:
        get_all_sites= models.TSite.query.all()
        sites = site_schema.dump(get_all_sites).data
        return jsonify(sites), 200
    except Exception:
        traceback.print_exc()
        return jsonify(error='Invalid JSON.'), 400

