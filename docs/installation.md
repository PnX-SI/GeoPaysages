### Introduction

L'infrastructure de l'app est constituée de 5 containers docker.  
Elle est donc isolée du system qui l'héberge, ne pouvant ni subir ni causer de conflits avec les paquets déjà installés.  
Seuls les ports configurés peuvent entrer en collision avec d'autres services utilisant les même ports. 

**Détail des containers**  

- db : Le serveur de base de données, Postgres/Postgis
- backend : L'application serveur, Python/Flask
- admin : L'espace d'administration, Angular
- thumbor : Un service de transformation d'image, Python
- proxy : Le point d'entrée de l'app, Traefik

# 

### Les commandes les plus utilisées

- Démarrer les containers, donc l'app  
  `./docker/docker.sh up -d`

- Stopper les containers  
  `./docker/docker.sh down`

- Parfois, mais vraiment très rarement, il faudra juste redémarrer le backend    
  `./docker/docker.sh restart backend`    

- Il peut-être parfois utile de redémarrer le container postgresql    
  `./docker/docker.sh restart db`  

- Lister les containers du système :
  `docker ps -a`

- Supprimer les containers arrêtés : 
  `docker container prune`

- Supprimer les image sans container associé : 
  `docker image prune -a`

- **Voir les logs d'un container**  
  `./docker/docker.sh logs -f <nom_du_container>`  
  <nom_du_container> : db, backend, proxy, ...  
  Exemples :  
  Afficher les logs dans le terminal  
  `./docker/docker.sh logs -f backend`  
  Générer un fichier  
  `./docker/docker.sh logs -f backend > /path/to/logfile.txt`

# 

### Pré-requis

**Application développée, installée et testée sur environnements serveurs Debian 11 et 12.**

Se connecter d'abord en tant que super utilisateur `root` au serveur Linux hôte.

Mettre à jour les paquets :

```sh
apt update && apt upgrade
```

Installer `sudo` et `rsync`:

```shell
apt install sudo rsync
```

Créer un utilisateur système autre que `root` (variable système `'whoami'` dans cette documentation) puis, l'ajouter au groupe `sudo` (afin de bénéficier des droits d'administrateur) :

Remplacer `<nom_utilisateur>` dans les commandes suivantes :

```sh
useradd <nom_utilisateur>
usermod -aG sudo <nom_utilisateur>
```

Installer Docker Engine et Compose en suivant la documentation d'installation officielle selon votre distribution (+ postinstall) :

- Installation sur Debian : https://docs.docker.com/engine/install/debian/

- Autres distributions Linux : https://docs.docker.com/engine/install/#server

- Post-installation de Docker pour Linux : https://docs.docker.com/engine/install/linux-postinstall/

Se connecter avec l'utilisateur créer précedemment  et arrêter de travailler avec `root` à partir d'ici :

```shell
su - <nom_utilisateur>
```

# 

### Installer GeoPaysages

**1. Récupérer la dernière version de GeoPaysages sur le dépôt (https://github.com/PnX-SI/GeoPaysages/releases)**

Ces opérations doivent être faites avec l'utilisateur courant (autre
que `root`); 

Remplacer `X.Y.Z` par la version que vous souhaitez installer.

#### Avec une archive :

```sh
cd /home/`whoami`
wget https://github.com/PnX-SI/GeoPaysages/archive/vX.Y.Z.zip
```

> Si la commande `wget` renvoie une erreur liée au certificat, installer le paquet `ca-certificates` (`sudo apt-get install ca-certificates`) puis relancer la commande `wget` ci-dessus.

- Dézipper l'archive :

```
unzip vX.Y.Z.zip
```

Vous pouvez renommer le répertoire qui contient l'application (dans un
dossier `/home/<monuser>/geopaysages/` par exemple) :

```
mv ~/GeoPaysages-X.Y.Z ~/geopaysages
```

Modifier les permissions du répertoire :

```shell
chmod -R 755 ~/geopaysages
```

#### Avec Git :

Si Git n'est pas installé sur le système :

```sh
sudo apt update
sudo apt install git
```

Se placer dans le répertoire de l'utilisateur courant (`whoami`) et clôner le dépôt depuis la release souhaitée (remplacer `X.Y.Z` par la version souhaitée) :

```sh
cd /home/`whoami`
git clone -b vX.Y.Z https://github.com/PnX-SI/GeoPaysages.git
```

Renommer le répertoire clôné de l'application :

```sh
mv GeoPaysages-X.Y.Z geopaysages
```

Modifier les permissions du répertoire :

```shell
chmod -R 755 ~/geopaysages
```

**2. Se placer dans le dossier qui contient l'application et lancer l'installation de l'environnement serveur :**

- Désampler le fichier de configuration :
  
  ```sh
  cd /home/`whoami`/geopaysages
  mv ./docker/.env.tpl ./docker/.env
  ```
  
  Editez-le et adapter les valeurs des variables à votre contexte :
  
  ```sh
  nano ./docker/.env
  ```
  
  > **Important**  
  > Les variables `DB_NAME`, `DB_USER`, `DB_PASSWORD` sont utilisées pour :
  > 
  > - initialiser la DB.
  > - créer la chaîne de connexion à la DB  
  > 
  > **Attention !!!** Une fois la DB initialisée la modification d'une de ces variables modifiera la chaîne de connexion **mais pas les valeurs dans la DB.**  
  > Vous pourrez le faire à main, mais en attendant l'app sera HS.
  > 
  > Les variables `PROXY_HTTPS_PORT`, `ACME_EMAIL` et `SERVERNAME_URL` sont utilisées la certification HTTPS du nom de domaine de l'application avec Traefik et LetsEncrypt.
  > 
  > Si vous préférez gérer la certification HTTPS différemment, vous pouvez ignorez ces variables dans le fichier `./docker/.env` et passer la variable `HTTPS_IN_PROXY` à 0.
  > 
  > Exemple de configuration avec NGinx + Certbot [ci-dessous](# Alternative à Traefik : NGINX).
  
  > **!!! Attention développeur, très important pour les instances locales !!!**  
  > SSL est activé par défaut, pour le désactiver il suffit de passer la variable `HTTPS_IN_PROXY` à 0 dans le fichier `./docker/.env`.

**3. Démarrer les containers :**

```sh
./docker/docker.sh up -d
```

  **Bien lire les sorties du script !**

# 

### Éditer le .env

Vous pouvez à tout moment éditer le .env et redémarrer l'app, faîtes juste attention à :   

- Ces variables `DB_NAME`, `DB_USER`, `DB_PASSWORD`  
  - Voir note si dessus
- Si vous voulez déplacer le dossier custom :  
  - modifier `CUSTOM_PATH` tel qu'indiqué dans le tableau ci-dessous.
  - déplacer le dossier **avant** de redémarrer l'app sinon un nouveau custom sera créer à partir du template initial.  
    Rien de grave, il vous faudrait juste le supprimer, déplacer votre custom et redémarrer l'app

# 

### Variables du .env

| Nom                  | Description                                                                                                                   | Valeur                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| PROXY_HTTP_PORT      | Port vers lequel pointe votre serveur en HTTP                                                                                 | integer                                                                                                          |
| PROXY_HTTPS_PORT     | Port vers lequel pointe votre serveur en HTTPS                                                                                | integer                                                                                                          |
| ACME_EMAIL           | Email utilisé pour la générération automatique des certificats HTTPS LetsEncrypt                                              | string                                                                                                           |
| SERVERNAME_URL       | Nom de domaine de l'application                                                                                               | string                                                                                                           |
| HTTPS_IN_PROXY       | Est-ce-que le certificat HTTPS est géré par l'application ?                                                                   | 1: oui<br>0: non                                                                                                 |
| DB_NAME              | Nom de la DB                                                                                                                  | string                                                                                                           |
| DB_USER              | User de la DB                                                                                                                 | string                                                                                                           |
| DB_PASSWORD          | Password de la DB                                                                                                             | string                                                                                                           |
| DB_PORT              | Port de la DB                                                                                                                 | integer                                                                                                          |
| THUMBOR_SECURITY_KEY | Utilisé pour signer l'url de transformation d'image                                                                           | string                                                                                                           |
| FLASK_SECRET_KEY     | Utilisé par Flask pour crypter les infos de session                                                                           | string                                                                                                           |
| DEBUG                | Affichage des informations de debug                                                                                           | 0: masquer<br>1: afficher                                                                                        |
| ADMIN_ENV_DEV        | L'admin est lancée via `npm start` ?                                                                                          | 0: non<br>1: oui                                                                                                 |
| DB_ADDRESS           | Adresse de la DB<br>**Ne changer que si une autre DB est utilisé**                                                            | string                                                                                                           |
| CUSTOM_PATH          | Chemin vers le dossier contenant les fichiers custom<br>**Le dossier ne doit pas exister pour que l'install puisse le créer** | **Si vous modifier la valeur par défaut :**<br>Utiliser un chemin absolu<br>ex. /home/nsdev/GeoPaysages-sit-paca |

# 

## Configuration de PostgreSQL

PostgreSQL étant déployé dans le conteneur Docker `db` avec docker compose (`./docker/docker-compose.yml`), Les données et les fichiers de configuration sont montés dans le volume Docker `geopaysages-db-data` sur le serveur hôte.

Par défaut, le chemin des volumes Docker sur le serveur hôte est `/var/lib/docker/volumes/`

Il est est donc possible (et conseillé) d'adapter la configuration de l'instance PostGreSQL et sa sécurisation (fichiers `postgresql.conf `et `pg_hba.conf`)

```bash
sudo su - # with root !
cd /var/lib/docker/volumes/geopaysages_geopaysages-db-data/_data
sudo nano postgresql.conf
sudo nano pg_hba.conf.conf
```

> ⚠️ Si vous souhaitez modifier le port par défaut de PostgreSQL, il vous vous faudra adapter le fichier `postgresql.conf` en conséquence (voir ci-dessus) après avoir adapté la variable `DB_PORT` dans le fichier `./docker/docker-compose.yml` et démarrer les conteneurs de l'application.

# 

### Alternative à Traefik : NGINX

Le container Docker inclus l'installation du reverse-proxy [Traefik](https://doc.traefik.io/traefik/).
Traefik permet également de gérer les certificats LetsEncrypt pour le HTTPS.
Il suffit donc de renseigner le fichier `.env` et en particulier les variables `PROXY_HTTPS_PORT`, `ACME_EMAIL` et `SERVERNAME_URL` pour associer automatiquement GeoPaysages à votre nom de domaine accessible en HTTPS.

Il reste cependant possible de préférer l'utilisation de NGINX en plus de Traefik.

Installer NGINX :

    sudo apt install nginx

Créer un fichier de configuration NGINX :**

    sudo nano /etc/nginx/conf.d/geopaysages.conf

Copiez/collez-y ces lignes et remplacer <PROXY_HTTP_PORT> par la valeur utilisée dans le fichier .env :

    server {
        listen       80;
        server_name  localhost;
        client_max_body_size 100M;
        location / {
            proxy_pass http://127.0.0.1:<PROXY_HTTP_PORT>;
        }
    }

Il est recommandé de certifié votre nom de domaine pour que celui-ci soit accessible en HTTPS. Vous pouvez utiliser certbot pour ce faire :

    sudo apt install python3-certbot-nginx

Lancer certbot pour certifier les domaines de vos configurations NGINX :

    sudo certbot --nginx

### Compatibilité avec UsersHub

[UsersHub](https://github.com/PnX-SI/usershub/#usershub) est une application web de gestion centralisée des utilisateurs développée dans la constellation [GeoNature](https://github.com/PNX-SI/GeoNature) par les Parcs nationaux français.

GeoPaysages intègre la dépendance [UsersHub-authentification-module](https://github.com/PnX-SI/UsersHub-authentification-module) qui permet que le référentiel d'utilisateurs soit compatible et connectable à une instance UsersHub prééxistante.

Pour ce faire, une fois l'application GeoPaysages installée et fonctionnelle :

* Créer un utilisateur dédié dans la base de données du serveur UsersHub cible qui sera utilisé ensuite via Foreign Data Wrapper par la BDD de GeoPaysages,

* Créer un Foreign Data Wrapper dans la base de données PostGreSQL de GeoPaysages vers celle de l'instance UsersHub,

* Remplacer le schéma utilisateurs de la bases de données de GeoPaysages en important celui de UsersHub.
1. Se connecter à la base de données du serveur UsersHub ciblé avec un client PostGreSQL puis adapter et exécuter le script prévu à cet effet : [usershub_gp_role.sql](./scripts/usershub_gp_role.sql)

2. Se connecter à la base de données de GeoPaysages avec un client PostGreSQL puis adapter et exécuter le script prévu à cet effet : [usershub_fdw.sql](./scripts/usershub_fdw.sql)

**⚠️ Bien lire les commentaires dans le scripts SQL et adapter son contenu en remplaçant les variables suivantes et en les adaptant à votre contexte :**

`$owner_geopaysages` : l'utilisateur propriétaire de la BDD de GeoPaysages (`DB_USER` dans le fichier [.env](../docker/.env.tpl))

`$usershub_host` : le serveur hôte de la base de données UsersHub ciblée 

`$usershub_db` : le nom de la base de données UsersHub ciblée

`$usershub_port` : le port utilisé par PostGreSQL sur le serveur de la base de données UsersHub ciblée

`$usershub_user` : le nom d'utilisateur à faire correspondre dans la base de données UsersHub ciblée (vous pouvez y ajouter un utilisateur spécifique dédié au FDW en prenant soin de lui donner les droits `USAGE` sur le schéma `utilisateurs` et `SELECT` sur l'ensemble des tables qu'il contient)

`$usershub_pass` : le mot de passe de `$usershub_user` ci-dessus 

> **Important**  
> Veillez à adapter au préalable la sécurisation des instances PostGreSQL de GeoPaysages et UsersHub afin de permettre la création du FDW entre les serveurs (`pg_hba.conf` et `postgresql.conf`)
