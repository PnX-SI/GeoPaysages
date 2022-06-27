Créer un dossier "data" à coté du répertoir cloné  
Désampler le fichier de configuration puis l'éditer :  
`mv /docker/.env.example /docker.env`  
Désampler le fichier de configuration puis l'éditer :  
`mv /backend/config.py.tpl /backend/config.py`  
Lancer le container  
`docker-compose up -d --build`  
Avant de continuer, s'assurer que la base de donnée est up avec un client de base de donnée (dbeaver, pgadmin, etc...)  
`docker-compose exec backend /bin/bash`  
`flask db upgrade`  
`exit`
