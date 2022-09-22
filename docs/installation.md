# INSTALLATION

## Prérequis

Application développée et installée sur un serveur Debian 10.

Ce serveur doit aussi disposer de :

- sudo (apt-get install sudo)
- un utilisateur (`monuser` dans cette documentation) appartenant au
    groupe `sudo` (pour pouvoir bénéficier des droits d'administrateur)

> Si sudo n'est pas installé par défaut, voir [ici](https://www.privateinternetaccess.com/forum/discussion/18063/debian-8-1-0-jessie-sudo-fix-not-installed-by-default)

## Installation de l'environnement logiciel

**1. Récupérer la dernière version de GeoPaysages sur le dépôt (https://github.com/PnX-SI/GeoPaysages/releases)**

Ces opérations doivent être faites avec l'utilisateur courant (autre
que `root`), `monuser` dans l'exemple :

```
cd /home/<monuser>
wget https://github.com/PnX-SI/GeoPaysages/archive/X.Y.Z.zip
```

> Si la commande `wget` renvoie une erreur liée au certificat, installer le paquet `ca-certificates` (`sudo apt-get install ca-certificates`) puis relancer la commande `wget` ci-dessus.

Dézipper l'archive :

```
unzip X.Y.Z.zip
```

Vous pouvez renommer le dossier qui contient l'application (dans un
dossier `/home/<monuser>/geopaysages/` par exemple) :
```
mv GeoPaysages-X.Y.Z geopaysages
```

**2. Se placer dans le dossier qui contient l'application et lancer l'installation de l'environnement serveur :**

Le script `install_env.sh` va automatiquement installer les outils nécessaires à l'application s'ils ne sont pas déjà sur le serveur :

- PostgreSQL
- PostGIS
- NGINX
- Python 3

Cela installera les logiciels nécessaires au fonctionnement de l'application

```
cd /home/<monuser>/geopaysages
./install_env.sh
```

Installation de la base de données
==================================

**1. Configuration de la BDD :**

Modifier le fichier de configuration de la BDD et de son installation automatique `install_configuration/settings.ini`.

> Suivez bien les indications en commentaire dans ce fichier

> Attention à ne pas mettre de 'quote' dans les valeurs, même pour les chaines de caractères.

> Le script d'installation automatique de la BDD ne fonctionne que pour une installation de celle-ci en localhost (sur le même serveur que l'application) car la création d'une BDD recquiert des droits non disponibles depuis un autre serveur. Dans le cas d'une BDD distante, adapter les commandes du fichier `install_db.sh` en les éxecutant une par une.

La gestion des utilisateurs est centralisée dans le schéma `utilisateurs` de la BDD, hérité de l'application de gestion des utilisateurs UsersHub (https://github.com/PnX-SI/UsersHub). Ce schéma est créé automatiquement lors de l'installation de la BDD de GeoPaysages, localement ou sous forme de foreign data wrapper connecté à une BDD de UsersHub existante.

**2. Lancer le fichier fichier d'installation de la base de données :**

```
./install_db.sh
``` 

> Vous pouvez consulter le log de cette installation de la BDD dans `/var/log/install_db.log` et vérifier qu'aucune erreur n'est intervenue.

> Le script `install_db.sh` supprime la BDD de GeoPaysages et la recréé entièrement.

Installation de l'application
=============================

**1. Configuration de l'application :**

Désampler le fichier de configuration puis l'éditer :

```
cp ./backend/config.py.tpl ./backend/config.py
```

- Vérifier que la variable `SQLALCHEMY_DATABASE_URI` contient les bonnes informations de connexion à la BDD
- Ne pas modifier les path des fichiers static
- Renseigner les autres paramètres selon votre contexte

**2. Lancer l'installation automatique de l'application :**

```
./install_app.sh
```

Installation du back-office
===========================

**1. Configuration de l'application :**

Désampler et éditer le fichier de configuration
`cp ./front-backOffice/src/app/config.ts.tpl ./front-backOffice/src/app/config.ts`.

> Pour utiliser l'utilisateur \"admin\" créé par défaut, il faut renseigner `id_application : 1`

> Pour `apiUrl` et `img_srv`, bien mettre <http://xxx.xxx.xxx.xxx>, si utilisation d'une adresse IP

**2. Lancer l'installation automatique de l'application :**
```
    ./install_backoffice.sh
```

Configuration de NGINX
======================

**1. Configuration de supervisor :**

```
sudo nano /etc/supervisor/conf.d/geopaysages.conf
```

Copiez/collez-y ces lignes en renseignant les bons chemins et le bon
port :

    [program:geopaysages]
    directory=/home/<monuser>/geopaysages/backend
    command=/home/<monuser>/geopaysages/venv/bin/gunicorn app:app -b localhost:8000
    autostart=true
    autorestart=true
    user=<monuser>

    stderr_logfile=/var/log/geopaysages/geopaysages.err.log
    stdout_logfile=/var/log/geopaysages/geopaysages.out.log

**2. Configuration de NGINX :**

    sudo nano /etc/nginx/conf.d/geopaysages.conf

Copiez/collez-y ces lignes en renseignant les bons chemins et le bon
port :

    server {
        listen       80;
        server_name  localhost;
        client_max_body_size 100M;
        location / {
            proxy_pass http://127.0.0.1:8000;
        }

        location /pictures {
            alias  /home/<monuser>/data/images/;
        }

        location /app_admin {
            alias /home/<monuser>/geopaysages/front-backOffice/dist/front-backOffice;
            try_files $uri$args $uri$args/ /app_admin/index.html;
        }
    }


> La limite de la taille des fichiers en upload est configurée à 100 Mo (`client_max_body_size`). Modifier `server_name` pour ajouter le nom domaine associé à votre GeoPaysages : `server_name mondomaine.fr`

**3. Redémarrer supervisor et NGINX :**

```
    sudo supervisord -c /etc/supervisor/supervisord.conf
    sudo supervisorctl reread
    sudo service supervisor restart
    sudo service nginx restart
```

**4. Connectez-vous au back-office :**

- Allez sur l'URL: <mon_ip>/app_admin
- Connectez-vous avec :
    - Identifiant : admin
    - Mot de passe: admin
- Ajoutez vos données