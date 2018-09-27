# coding: utf-8
from flask import Flask, request, jsonify

app = Flask(__name__)
app.config.from_pyfile('config.py')
import models
app.config.from_pyfile('config.py')
from models import (db)

import nsschema
from jsonschema import ValidationError

db.init_app(app)
dicotheme_schema = models.DicoThemeSchema(many=True)


@app.route("/", methods=["GET"])
def get_dico():
    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
