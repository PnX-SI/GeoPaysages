from flask import render_template, Blueprint
import utils

# This file is a docker volume in place of /backend/custom_app.py
# So, paths are relative from /backend/custom_app.py

custom = Blueprint('custom', __name__)

def custom_inject_to_tpl():
    return dict()

@custom.route('/about')
def about():
    return render_template(utils.getCustomTpl('about'))