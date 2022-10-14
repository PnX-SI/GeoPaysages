# Pré-requis
- `docker compose` ou `docker-compose`  
> Si docker est déjà installé, une de ces commandes est sûrement disponible.  
> Sinon le mieux est d'installer la dernière version de docker qui intègre par défaut la commande `compose`
- Installation sur Debian : https://docs.docker.com/engine/install/debian/
- Autres distributions Linux : https://docs.docker.com/engine/install/#server
- Installation Windows **(non recommandée)** : https://docs.docker.com/desktop/install/windows-install/

# Installer GéoPaysages

- Atteindre la racine du répertoire cloné
- Désampler le fichier de configuration puis l'éditer :
  - `mv ./docker/.env.example ./docker/.env`  
  >**Important**  
  >Les variables `DB_NAME`, `DB_USER`, `DB_PASSWORD` sont utilisées pour :
  >  - initialiser la DB.
  >  - créer la chaîne de connexion à la DB  
  >
  >**Attention !!!** Une fois la DB initialisée la modification d'une de ces variables modifiera la chaîne de connexion **mais pas les valeurs dans la DB.**  
  >Vous pourrez le faire à main, mais en attendant l'app sera HS.
- Démarer l'app
  - `./docker/docker.sh up -d`  
  **Bien lire les sorties du script !**

### Pour redémarrer l'app
`./docker/docker.sh up -d`

# Éditer le .env
Vous pouvez à tout moment éditer le .env et redémarrer l'app, faîtes juste attention à :   
- Ces variables `DB_NAME`, `DB_USER`, `DB_PASSWORD`  
  - Voir note si dessus
- Si vous voulez déplacer le dossier custom :  
  - modifier `CUSTOM_PATH` tel qu'indiqué dans le tableau ci-dessous.
  - déplacer le dossier **avant** de redémarrer l'app sinon un nouveau custom sera créer à partir du template initial.  
  Rien de grave, il vous faudrait juste le supprimer, déplacer votre custom et redémarrer l'app

# Variables du .env
| Nom | Description | Valeur |
| ------ | ------ | ------ |
| PROXY_HTTP_PORT | Port vers lequel pointe votre serveur | integer |
| DB_NAME | Nom de la DB | string |
| DB_USER | User de la DB | string |
| DB_PASSWORD | Password de la DB | string |
| DB_PORT | Port de la DB | integer |
| THUMBOR_SECURITY_KEY | Utilisé pour signer l'url de transformation d'image | string |
| FLASK_SECRET_KEY | Utilisé par Flask pour crypter les infos de session | string |
| DEBUG | Affichage des informations de debug  | 0: masquer<br>1: afficher |
| ADMIN_ENV_DEV | L'admin est lancée via `npm start` ? | 0: non<br>1: oui |
| DB_ADDRESS | Adresse de la DB<br>**Ne changer que si une autre DB est utilisé** | string |
| CUSTOM_PATH | Chemin vers le dossier contenant les fichiers custom<br>**Le dossier ne doit pas exister pour que l'install puisse le créer** | **Si vous modifier la valeur par défaut :**<br>Utiliser un chemin absolu<br>ex. /home/nsdev/GeoPaysages-sit-paca |