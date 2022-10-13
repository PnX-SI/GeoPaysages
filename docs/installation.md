# Installer Géopaysages en prod

- Atteindre la racine du répertoire cloné
- Désampler le fichier de configuration puis l'éditer :
  - `mv ./docker/.env.example ./docker/.env`
- Lancer le container
  - `./docker/docker.sh up -d`