from flask import Flask, request, jsonify
import models

dicotheme_schema = models.DicoThemeSchema(many=True)


@app.route("/", methods=["GET"])
def get_dico():
    all_dicos = models.DicoTheme.query.all()
    result = dicotheme_schema.dump(all_dicos)
    return jsonify(result)
