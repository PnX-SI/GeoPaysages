============
INSTALLATION
============
.. image:: ./logo.png

-----

Prérequis
=========

Application développée et installée sur un serveur Debian 9.

Ce serveur doit aussi disposer de : 

- sudo (apt-get install sudo)
- un utilisateur (``monuser`` dans cette documentation) appartenant au groupe ``sudo`` (pour pouvoir bénéficier des droits d'administrateur)

:notes:

    Si sudo n'est pas installé par défaut, voir https://www.privateinternetaccess.com/forum/discussion/18063/debian-8-1-0-jessie-sudo-fix-not-installed-by-default
    

Installation de l'environnement logiciel
========================================

**1. Récupérer la dernière version  de GeoPaysages sur le dépôt (https://github.com/PnX-SI/GeoPaysages/releases)**
	
Ces opérations doivent être faites avec l'utilisateur courant (autre que ``root``), ``monuser`` dans l'exemple :

::

    cd /home/<monuser>
    wget https://github.com/PnX-SI/GeoPaysages/archive/X.Y.Z.zip

    
:notes:

    Si la commande ``wget`` renvoie une erreur liée au certificat, installer le paquet ``ca-certificates`` (``sudo apt-get install ca-certificates``) puis relancer la commande ``wget`` ci-dessus.

Dézipper l'archive :
	
::

    unzip X.Y.Z.zip
	
Vous pouvez renommer le dossier qui contient l'application (dans un dossier ``/home/<monuser>/geopaysages/`` par exemple) :
	
::

    mv GeoPaysages-X.Y.Z geopaysages



**2. Se placer dans le dossier qui contient l'application et lancer l'installation de l'environnement serveur :**

Le script ``install_env.sh`` va automatiquement installer les outils nécessaires à l'application s'ils ne sont pas déjà sur le serveur : 

- PostgreSQL 9.6+
- PostGIS 
- Nginx
- Python 3

Cela installera les logiciels nécessaires au fonctionnement de l'application 

::

    cd /home/<monuser>/geopaysages
    ./install_env.sh



Installation de la base de données
==================================


**1. Configuration de la BDD  :** 

Modifier le fichier de configuration de la BDD et de son installation automatique ``install_configuration/settings.ini``. 


:notes:

    Suivez bien les indications en commentaire dans ce fichier

:notes:

    Attention à ne pas mettre de 'quote' dans les valeurs, même pour les chaines de caractères.
    
:notes:

    Le script d'installation automatique de la BDD ne fonctionne que pour une installation de celle-ci en localhost car la création d'une BDD recquiert des droits non disponibles depuis un autre serveur. Dans le cas d'une BDD distante, adapter les commandes du fichier `install_db.sh` en les executant une par une.


**2. Lancer le fichier fichier d'installation de la base de données en sudo :**

::

    ./install_db.sh
    
:notes:

    Vous pouvez consulter le log de cette installation de la base dans ``/var/log/install_db.log`` et vérifier qu'aucune erreur n'est intervenue.
    
    Le script ``install_db.sh`` supprime la BDD de GeoPaysages et la recréer entièrement. 


Installation de l'application
============================

**1. Configuration de l'application :**


Editer le fichier de configuration ``./backend/config.py.tpl``.

- Vérifier que la variable 'SQLALCHEMY_DATABASE_URI' contient les bonnes informations de connexion à la base
- Ne pas modifier les path des fichiers static
- Renseigner les autres paramètres selon votre contexte


**2. Lancer l'installation automatique de l'application :**
	
::

    ./install_app.sh


Personnalisation de l'application
==============================   
	
Vous pouvez personnaliser l'application en modifiant et ajoutant des fichiers dans le répertoire ``backend/static/custom/`` (css, logo).

Certains paramètres sont dans la table conf :

- ``external_links``, les liens en bas à droite dans le footer, est un tableu d'objets devant contenir un label et une url, ex.
::

        [{
            "label": "Site du Parc national de Vanoise",
            "url": "http://www.vanoise-parcnational.fr"
        }, {
            "label": "Rando Vanoise",
            "url": "http://rando.vanoise.com"
        }]

- ``zoom_map_comparator``, la valeur du zoom à l'initialisation de la carte de page comparateur de photos
- ``zoom_max_fitbounds_map``, la valeur du zoom max lorsqu'on filtre les points sur la carte interactive. Ce paramètre évite que le zoom soit trop important lorsque les points restant sont très rapprochés.
- Si vous voyez un paramètre nommé ``zoom_map``, sachez qu'il est déprécié, vous pouvez le supprimer de la table.
- ``map_layers``, les différentes couches disponibles sur la carte interactive, voir ce lien pour connaitre toutes les options de configuration https://leafletjs.com/reference-1.5.0.html#tilelayer, ex :
::

        [
          {
            "label": "OSM classic",
            "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "options": {
              "maxZoom": 18,
              "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
            }
          },
          {
            "label": "IGN",
            "url": "http://wxs.ign.fr/[clé ign]/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg",
            "options": {
              "maxZoom": 18,
              "attribution": "&copy; <div>IgnMap</div>"
            }
          }
        ]

- ``enable_html_text``, autorise l'interprétation du HTML contenu dans les champs de type texte "Description" et "Témoignage" (dans les fiches des points d'observation).

Internationalisation de l'application
======================================   

- Pour modifier les textes, éditer le fichier backend/i18n/fr/messages.po
- activer l'environnement virtuel (depuis le répertoire source par exemple (geopaysages))

::

    . venv/bin/activate
    
- lancer la commande suivante en se plaçant au préalable dans le répertoire i18n :

::

    . pybabel compile -d i18n

:notes:

  Pour plus d'informations, voir https://pythonhosted.org/Flask-Babel/
  
  Pour sortir de l'environnement virtuel, taper deactivate
 
Installation du back-office
============================

**1. Configuration de l'application :**

Editer le fichier de configuration ``./front-backOffice/src/app/config.ts.tpl``.

:notes:

    Pour utiliser l'utilisateur admin installé par defaut il faut Renseigner  id_application : 1
    
    Pour apiUrl et staticPicturesUrl, bien mettre http://xxx.xxx.xxx.xxx, si utilisation d'une adresse IP

    Pour activer l'éditeur de texte HTML (WYSIWYG) RichTextEditor sur les champs "Description" et "Témoignage", renseigner enable_html_text_editor : 'True'. 
    /!\ Cela permet aux utilisateurs ayant accès au back-office d'injecter du HTML dans le site --> A utiliser avec parcimonie en évaluant les incidences en matière de sécurité.
    

**2. Lancer l'installation automatique de l'application :**
	
::

    ./install_backoffice.sh
    
Configuration de Nginx
======================

**1. Configuration de supervisor :**
	
::

   sudo nano /etc/supervisor/conf.d/geopaysages.conf

Copiez/collez-y ces lignes en renseignant les bons chemins et le bon port : 
::
    [program:geopaysages]
    directory=/home/<monuser>/geopaysages/backend
    command=/home/<monuser>/geopaysages/venv/bin/gunicorn app:app -b localhost:8000
    autostart=true
    autorestart=true
    user=<monuser>

    stderr_logfile=/var/log/geopaysages/geopaysages.err.log
    stdout_logfile=/var/log/geopaysages/geopaysages.out.log


**2. Configuration de Nginx :**

::

    sudo nano /etc/nginx/conf.d/geopaysages.conf

Copiez/collez-y ces lignes en renseignant les bons chemins et le bon port : 

::

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
            alias /home/<monuser>/app_admin;
            try_files $uri$args $uri$args/ /app_admin/index.html;
        }
    }


:notes:	

    La limite de la taille des fichiers en upload est configurée à 100 Mo (client_max_body_size)
    Modifier server_name pour ajouter le nom domaine associé à GeoPaysages :
	 
::

    server_name mondomaine.fr

**3. Redémarrer supervisor et Nginx :**
 
::  

    sudo supervisord -c /etc/supervisor/supervisord.conf
    sudo supervisorctl reread
    sudo service supervisor restart
    sudo service nginx restart


**4. Connectez-vous au back-office :**

::

    - Allez sur l'URL: <mon_ip>/app_admin
    - Connectez-vous avec :
        Identifiant : admin
        Mot de passe: admin
    - Ajoutez vos données
    
Ajout et personnalisation d'une nouvelle page html
==================================================

**1. Création de la page HTML**

- La page d'exemple pour créer une nouvelle page html dans le site se trouve dans backend/tpl/sample.html
- Copier/coller sample.html et renommer la nouvelle page

**2. Créer la route vers la nouvelle page**

- Ouvrir le fichier backend/routes.py
- Copier/coller un bloc existant et effectuer les modifications nécessaires en lien avec la nouvelle page html

**3. Ajout du lien vers la nouvelle page HTML**

- Ouvrir le fichier backend/tpl/layout.html
- Copier/coller un bloc 'li' existant et effectuer les modifications nécessaires en lien avec la nouvelle page html

**4. Création de l'intitulé du lien via l'internationalisation**

- Ouvrir le fichier backend/i18n/fr/LC_MESSAGES/messages.po
- Copier/coller un bloc existant et effectuer les modifications nécessaires en lien avec la nouvelle page html

**5. Compilation pour la prise en compte des modifications**

- Suivre les étapes du chapitre Internatinalisation de l'application
- Pour les modifications effectuées dans les fichiers python, relancer la compilation python

::

        sudo service supervisor restart
