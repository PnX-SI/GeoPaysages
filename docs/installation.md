# Installer Géopaysages

- Atteindre la racine du répertoire cloné
- Désampler le fichier de configuration puis l'éditer :
  - `mv ./docker/.env.example ./docker/.env`
  - Exemple :
    ```
    DB_USER=geopaysages
    DB_NAME=geopaysages
    DB_PASSWORD=password
    DB_PORT=5432
    THUMBOR_SECURITY_KEY=secret

    PROXY_HTTP_PORT=8080
    PROXY_API_PORT=8081
    HTTP_PORT=8082
    DB_ADDRESS=db
    VOLUME_PATH=../data
    IMG_SRV=http://localhost:8083
    PROJECT=geopaysages
    ```
- Mettre les droits d'exécution sur backend/prestart.sh
  - `chmod +x backend/prestart.sh`
- Lancer le container
  - `./scripts/docker.sh up -d --build`
- Avant de continuer, s'assurer que la base de données est up avec un client de base de données - (dbeaver, pgadmin, etc...)