import os

SQLALCHEMY_DATABASE_URI = f'postgresql://{os.getenv("DB_USER")}:{os.getenv("DB_PASSWORD")}@{os.getenv("DB_ADDRESS")}:5432/{os.getenv("DB_NAME")}'
SQLALCHEMY_POOL_SIZE = 10
SQLALCHEMY_MAX_OVERFLOW = 30

# Choose between 'hash' or 'md5'
PASS_METHOD = 'hash'
TRAP_ALL_EXCEPTIONS = False
COOKIE_EXPIRATION = 36000
COOKIE_AUTORENEW = True
SESSION_TYPE = 'filesystem'
SECRET_KEY = os.getenv("FLASK_SECRET_KEY")

# Do not edit except in exceptional cases
BABEL_TRANSLATION_DIRECTORIES = './i18n'  # From ./ dir

# !!! Do not change, this is the only supported value
COMPARATOR_VERSION = 2 
