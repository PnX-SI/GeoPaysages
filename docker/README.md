# Développer sur Géopaysage

- Créer un dossier "data" à coté du répertoire cloné
- Atteindre la racine du répertoire cloné
- Désampler le fichier de configuration puis l'éditer :
  - `cp ./docker/.env.example ./docker/.env`
- Désampler le fichier de configuration puis l'éditer :
  - `cp ./backend/config.py.tpl ./backend/config.py`
  - `cd ./docker`
- Mettre les droits d'exécution sur backend/prestart.sh
  - `chmod +x backend/prestart.sh`
- Construire le container
  - `./scripts/docker-demo.sh up -d --build`
- Avant de continuer, s'assurer que la base de donnée est up avec un client de base de donnée - (dbeaver, pgadmin, etc...)
  - `docker-compose exec backend /bin/bash`
  - `flask db upgrade`
  - `exit`

# Initialiser Géopaysage sur le serveur de démo

- Créer un dossier "data" à coté du répertoire cloné
- Atteindre la racine du répertoire cloné
- Désampler le fichier de configuration puis l'éditer : `mv ./docker/.env.example ./docker/.env`
- Exemple :

  ```
  PROXY_HTTP_PORT=8080
  PROXY_API_PORT=8081
  HTTP_PORT=8082

  DB_USER=geopaysages

  DB_NAME=geopaysages
  DB_ADDRESS=db
  DB_PORT=5432
  DB_PASSWORD=password_to_change
  VOLUME_PATH=../data
  IMG_SRV=http://localhost:9000
  PROJECT=geopaysages
  ```

- Désampler le fichier de configuration de l'app Python puis l'éditer : `mv ./backend/config.py.tpl ./backend/config.py`
- Exemple :

  ```python
  import os

  SQLALCHEMY_DATABASE_URI = f'postgresql://{os.getenv("DB_USER")}:{os.getenv("DB_PASSWORD")}@{os.getenv("DB_ADDRESS")}:5432/{os.getenv("DB_NAME")}'

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
  DEFAULT_SORT_SITES = 'name_site'
  ```

- Désampler le fichier de configuration de l'admin Angular puis l'éditer : `mv ./front-backOffice/src/app/config.ts.tpl ./front-backOffice/src/app/config.ts`
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
- Lancer le container
  - Se placer à la source du projet
  - Exécuter `./scripts/docker-demo.sh up -d --build`

# Mettre à jour le serveur de démo

- Récupérer tous les changements
  - Vérifier la branche `git branch`
  - Récupérer les nouveautés `git pull`
- Si l'on ne met à jour que le front / pas la partie admin
  - Se placer à la source du projet geopaysages
  - Mettre à jour le front `./scripts/docker-demo.sh up -d`
- Si l'on met aussi à jour la partie admin
  - Se placer à la source du projet geopaysages
  - Mettre à jour toute l'application `./scripts/docker-demo.sh up -d --build`
- Si l'on ne met à jour les traductions
  - Se placer à la source du projet geopaysages
  - Stopper les containers `./scripts/docker-demo.sh down`
  - Démarrer les container `./scripts/docker-demo.sh up -d`
- Vérifier que les changements sont appliqués
  - Se rendre sur l'application / site web
  - Vider le cache
- Profiter d'une application à jour

# Possibles bugs et comment les résoudre

## "L'application charge en continue, mais rien ne s'affiche, et ça dur longtemps"

Un problème est survenue avec le back, il suffit de le relancer : `./scripts/docker-demo.sh restart backend`

## "Quand j'exécute une commande docker pour build / lancer, j'obtiens le message d'erreur suivant : bash: ./scripts/docker-demo.sh: Aucun fichier ou dossier de ce type "

Ton fichier est mal encodé. Pour résoudre ce problème, ouvre depuis vscode le fichier `docker-demo.sh` situé dans le dossier `scripts`. En bas à droite de ton vscode, dans le bandeau bleu, il doit y avoir écrit `CRLF`. Clique dessus, change en `LF`, et sauvegarde le fichier. Ta commande devrait maintenant fonctionner.
