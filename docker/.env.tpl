PROXY_HTTP_PORT=80

DB_NAME=geopaysages
DB_USER=geopaysages
DB_PASSWORD=password
DB_PORT=5432

THUMBOR_SECURITY_KEY=secret
FLASK_SECRET_KEY=secret

# Docker images
DB_IMAGE=ghcr.io/naturalsolutions/geopaysages_db:latest
ADMIN_IMAGE=ghcr.io/naturalsolutions/geopaysages_admin:latest
BACKEND_IMAGE=ghcr.io/naturalsolutions/geopaysages_backend:latest

# You probably don't need to change this values
DEBUG=0
ADMIN_ENV_DEV=0
DB_ADDRESS=db
DB_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_ADDRESS}:5432/${DB_NAME}
CUSTOM_PATH=../custom

# PROXY_API_PORT=8081