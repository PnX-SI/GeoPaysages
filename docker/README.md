# Dev

Créer un dossier "data" à coté du répertoire cloné  
Atteindre la racine du répertoire cloné  
Désampler le fichier de configuration puis l'éditer :  
`cp ./docker/.env.example ./docker/.env`  
Désampler le fichier de configuration puis l'éditer :  
`cp ./backend/config.py.tpl ./backend/config.py`  
`cd ./docker`  
Mettre les droits d'execution sur backend/prestart.sh
`chmod +x backend/prestart.sh`
Lancer le container 
`docker-compose up -d --build`  
Avant de continuer, s'assurer que la base de donnée est up avec un client de base de donnée (dbeaver, pgadmin, etc...)  
`docker-compose exec backend /bin/bash`  
`flask db upgrade`  
`exit`
<br />
<br />
<br />

# Demo

Créer un dossier "data" à coté du répertoire cloné  
Atteindre la racine du répertoire cloné  
Désampler le fichier de configuration puis l'éditer :  
`mv ./docker/.env.example ./docker/.env`  
Exemple :

```
PROXY_HTTP_PORT=8080
PROXY_API_PORT=8081
HTTP_PORT=8082
DB_PORT=5433
DB_PASSWORD=password_to_change
```

Désampler le fichier de configuration de l'app Python puis l'éditer :  
`mv ./backend/config.py.tpl ./backend/config.py`  
Exemple de chaine de connexion :  
`SQLALCHEMY_DATABASE_URI='postgres://root:password_to_change@db:5432/geopaysages'`  
Désampler le fichier de configuration de l'admin Angular puis l'éditer :  
`mv ./front-backOffice/src/app/config.ts.tpl ./front-backOffice/src/app/config.ts`  
Exemple :

```
export const Conf = {
  apiUrl: '/api/',
  img_srv: '/static/data/images/',
  customFiles: '/static/custom/',
  id_application: 1,
  ign_Key: 'ign key',
  map_lat_center: 45.372167,
  map_lan_center: 6.819077,
};
```

Lancer le container  
`./demo.sh`  
OU  
`cd ./docker`  
`docker compose -f docker-compose-demo.yml up -d --build`  
Avant de continuer, s'assurer que la base de donnée est up avec un client de base de donnée (dbeaver, pgadmin, etc...)  
`docker compose exec backend /bin/bash`  
`flask db upgrade`  
`exit`