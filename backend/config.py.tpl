SQLALCHEMY_DATABASE_URI='postgres://<user>:<passwd>@<host>:<port>/<database>'

IGN_KEY='ign_key'
PASS_METHOD='md5'
COOKIE_EXPIRATION = 36000
COOKIE_AUTORENEW = True
SESSION_TYPE = 'filesystem'
SECRET_KEY = 'secret key'

# Do not edit except in exceptional cases
DATA_IMAGES_PATH='data/images/'# From ./static dir
DATA_NOTICES_PATH='data/notice-photo/'# From ./static dir
BABEL_TRANSLATION_DIRECTORIES='./i18n'# From ./ dir