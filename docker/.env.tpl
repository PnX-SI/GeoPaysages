PROXY_HTTP_PORT=80
# HTTPS with Traefik and LetsEncrypt :
PROXY_HTTPS_PORT=443
ACME_EMAIL=me@mydomain.fr # replace email for LetsEncrypt/ACME notifications
SERVERNAME_URL=geopaysages.fr # your GeoPaysages server name (required for https certificates)
HTTPS_IN_PROXY=1

DB_NAME=geopaysages
DB_USER=geopaysages
DB_PASSWORD=password
DB_PORT=5432

THUMBOR_SECURITY_KEY=secret # replace with a secret key
FLASK_SECRET_KEY=secret # replace with a secret key

# Docker images
DB_IMAGE=ghcr.io/pnx-si/geopaysages_db:latest
ADMIN_IMAGE=ghcr.io/pnx-si/geopaysages_admin:latest
BACKEND_IMAGE=ghcr.io/pnx-si/geopaysages_backend:latest

# Application code for UsersHub-Authentification-Module needs
CODE_APPLICATION=GP

# You probably don't need to change this values
DEBUG=0
ADMIN_ENV_DEV=0
DB_ADDRESS=db
DB_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_ADDRESS}:5432/${DB_NAME}
CUSTOM_PATH=../custom

# PROXY_API_PORT=8081