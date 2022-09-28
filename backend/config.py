import os

SQLALCHEMY_DATABASE_URI = f'postgresql://{os.getenv("DB_USER")}:{os.getenv("DB_PASSWORD")}@{os.getenv("DB_ADDRESS")}:5432/{os.getenv("DB_NAME")}'
SQLALCHEMY_POOL_SIZE = 10
SQLALCHEMY_MAX_OVERFLOW = 30

IGN_KEY = 'ign_key'
# Choose between 'hash' or 'md5'
PASS_METHOD = 'hash'
TRAP_ALL_EXCEPTIONS = False
COOKIE_EXPIRATION = 36000
COOKIE_AUTORENEW = True
SESSION_TYPE = 'filesystem'
SECRET_KEY = 'secret key'

# Do not edit except in exceptional cases
IMG_SRV = f'{os.getenv("IMG_SRV")}'
DATA_IMAGES_PATH = 'data/images/'  # From ./static dir
DATA_NOTICES_PATH = 'data/notice-photo/'  # From ./static dir
BABEL_TRANSLATION_DIRECTORIES = './i18n'  # From ./ dir

COMPARATOR_VERSION = 2

# Order to sort sites (choose a field from t_site table )
DEFAULT_SORT_SITES = f'{os.getenv("DEFAULT_SORT_SITES")}'
SHOW_SITE_REF = f'{os.getenv("SHOW_SITE_REF")}' == "True"