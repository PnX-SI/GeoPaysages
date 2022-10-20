## Migrer la DB
L'idée est de remplacer la DB livrée avec la nouvelle version par l'ancienne DB.  
Lorsqu'on redémarre les containers le schéma de la DB est mis à jour via Alembic.  
L'ancienne base est alors prête à être utilisée dans la nouvelle version.

Faire un dump de l'ancienne DB  
  `pg_dump -U <username> -Fc -f <destination_file> <db_name>`  
  ex. `pg_dump -U geopaysages -Fc -f ./geopaysages_1_2.dump geopaysages`

Atteindre la racine du dossier de la nouvelle version  
Démarrer les containers de la nouvelle version  
**Attention : dans le ./docker/.env choisir un autre port que celui de l'ancienne DB ou se déconnecter de l'ancienne**  
`./docker/docker.sh up -d`
 
Copier le dump dans le container de la DB
  - Version récente de docker compose :  
    `./docker/docker.sh cp <chemin_vers_geopaysages_1_2.dump> db:/geopaysages_1_2.dump`
  - Version ancienne :  
    Trouver le nom du container de la DB  
    `docker ps -f "name=geopaysages_db"`  
    Copier la valeur sous la colonne "NAMES", sera probablement "geopaysages_db_1"  
    `docker cp <chemin_vers_geopaysages_1_2.dump> <nom_container_ci_dessus>:/geopaysages_1_2.bck`  

Entrer dans le container de la DB  
`./docker/docker.sh exec db /bin/bash`  
PSQL  
`psql -U geopaysages -d postgres`   
Fermer les connexions à la DB geopaysages  
`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid()  AND datname = 'geopaysages';`  
Supprimer la DB existante  
`DROP DATABASE geopaysages`  
Quitter psql `exit`  
Créer une DB vide  
`createdb -U geopaysages geopaysages`  
**Et enfin restorer votre ancienne DB**  
`pg_restore -U geopaysages --no-owner --dbname geopaysages geopaysages_1_2.bck`  
Quitter le container de la DB `exit`  
Redémarrer le backend  
`./docker/docker.sh restart backend`  
Vos données sont à jours.

#
## Migrer les media
- Copier le contenu de data/images dans custom/upload/images
- Copier le contenu de data/notice-photo dans custom/upload/notice-photo  
  
A ce stade, l'app doit avoir un aspect normal

#
## Migrer les traductions
Le plus simple est de refaire vos modifs dans le nouveau fichier de traduction :  
custom/i18n/fr/LC_MESSAGES/messages.po  
Suivre les instructions de la doc :  
[personnalisation.md#internationalisation-de-lapplication](./personnalisation.md#internationalisation-de-lapplication)