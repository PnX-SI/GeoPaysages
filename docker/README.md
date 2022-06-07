Créer un dossier "data" à coté du répertoir cloné  
`mv /backend/config.py.tpl /backend/config.py`  
Éditer la chaine de connection  
`docker-compose up -d --build`  
S'assurer que la base de donnée est up avec un client de base de donnée (dbeaver, pgadmin, etc...)  
`docker-compose exec backend /bin/bash`  
`flask db upgrade`  
`exit`  