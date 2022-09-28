# Installer Géopaysages

- Créer un dossier "data" à coté du répertoire cloné
- Atteindre la racine du répertoire cloné
- Désampler le fichier de configuration puis l'éditer :
  - `mv ./docker/.env.example ./docker/.env`
  - Exemple :
    ```
    PROXY_HTTP_PORT=8080
    PROXY_API_PORT=8081
    HTTP_PORT=8082

    DB_USER=geopaysages

    DB_NAME=geopaysages
    DB_ADDRESS=db
    DB_PORT=5432
    DB_PASSWORD=password
    VOLUME_PATH=../data
    IMG_SRV=http://localhost:8083
    THUMBOR_SECURITY_KEY=secret
    PROJECT=geopaysages

    DEFAULT_SORT_SITES=name_site
    SHOW_SITE_REF=False
    ```
- Désampler le fichier de configuration puis l'éditer :
  - `mv ./backend/config.py.tpl ./backend/config.py`
  - Exemple :
    ```python
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
    ```
- Désampler le fichier de configuration de l'admin Angular puis l'éditer
  - `mv ./front-backOffice/src/app/config.ts.tpl ./front-backOffice/src/app/config.ts`
  - Exemple :
    ```js
    export const Conf = {
      apiUrl: "/api/",
      img_srv: "/thumbor/",
      customFiles: "/static/custom/",
      id_application: 1,
      ign_Key: "ign key",
      map_lat_center: 45.372167,
      map_lan_center: 6.819077,
    };
    ```
- Mettre les droits d'exécution sur backend/prestart.sh
  - `chmod +x backend/prestart.sh`
- Construire le container
  - `./scripts/docker.sh up -d --build`
- Avant de continuer, s'assurer que la base de donnée est up avec un client de base de donnée - (dbeaver, pgadmin, etc...)