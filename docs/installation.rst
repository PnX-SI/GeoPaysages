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
- un utilisateur (``monuser`` dans cette documentation) appartenant au groupe ``sudo`` (pour pouvoire bénéficier des droits d'administrateur)

:notes:

    Si sudo n'est pas installé par défaut, voir https://www.privateinternetaccess.com/forum/discussion/18063/debian-8-1-0-jessie-sudo-fix-not-installed-by-default
    

Installation de l'environnement logiciel
========================================

Le script ``install_env.sh`` va automatiquement installer les outils nécessaires à l'application si ils ne sont pas déjà sur le serveur : 

- PostgreSQL 9.6+
- PostGIS 
- Nginx
- Python 3

Cela installera les logiciels nécessaires au fonctionnement de l'application 

**1. Récupérez la dernière version  de GeoPaysages sur le dépot (https://github.com/PnX-SI/GeoPaysages/releases)**
	
Ces opérations doivent être faites avec l'utilisateur courant (autre que ``root``), ``monuser`` dans l'exemple :

::

    cd /home/monuser
    wget https://github.com/PnX-SI/GeoPaysages/archive/X.Y.Z.zip

    
:notes:

    Si la commande ``wget`` renvoie une erreur liée au certificat, installez le paquet ``ca-certificates`` (``sudo apt-get install ca-certificates``) puis relancer la commande ``wget`` ci-dessus.

Dézippez l'archive :
	
::

    unzip X.Y.Z.zip
	
Vous pouvez renommer le dossier qui contient l'application (dans un dossier ``/home/monuser/geopaysages/`` par exemple) :
	
::

    mv GeoPaysages-X.Y.Z geopaysages



**2. Placez-vous dans le dossier qui contient l'application et lancez l'installation de l'environnement serveur :**
::

    cd /home/monuser/geopaysages
    ./install_env.sh



Installation de la base de données
==================================

**1. Configuration de la BDD  :** 

Modifiez le fichier de configuration de la BDD et de son installation automatique ``install_configuration/settings.ini``. 


:notes:

    Suivez bien les indications en commentaire dans ce fichier

:notes:

    Attention à ne pas mettre de 'quote' dans les valeurs, même pour les chaines de caractères.
    
:notes:

    Le script d'installation automatique de la BDD ne fonctionne que pour une installation de celle-ci en localhost car la création d'une BDD recquiert des droits non disponibles depuis un autre serveur. Dans le cas d'une BDD distante, adaptez les commandes du fichier `install_db.sh` en les executant une par une.


**2. Lancez le fichier fichier d'installation de la base de données en sudo :**

::

    sudo ./install_db.sh
    
:notes:

    Vous pouvez consulter le log de cette installation de la base dans ``/var/log/install_db.log`` et vérifier qu'aucune erreur n'est intervenue.
    
    Le script ``install_db.sh`` supprime la BDD de GeoPaysages et la recréer entièrement. 


Installtion de l'application
============================

**1. Configuration de l'application :**


Editer le fichier de configuration ``./backend/config.py.tpl``.

- Vérifier que la variable 'SQLALCHEMY_DATABASE_URI' contient les bonnes informations de connexion à la base
- Ne modifiez pas les path des fichiers static
- Renseignez les autres paramètres selon votre contexte


**2. Lancez l'installation automatique de l'application :**
	
::

    ./install_app.sh


Customisation de l'application
==============================   
	
En plus de la configuration, vous pouvez customiser l'application en modifiant et ajoutant des fichiers dans le répertoire ``backend/static/custom/`` (css, logo).

Internationalisation de l'application
======================================   

- Pour modifier les labels Editer le fichier backend/i18n/fr/messages.po
- activer le environnement virtuel 

::

    . venv/bin/activate
    
- lanceer la commande suivante :

::

    . pybabel compile -d i18n

:notes:

  Pour plus d'informations, voir https://pythonhosted.org/Flask-Babel/
 
Installtion de back-office
============================

**1. Configuration de l'application :**

Editer le fichier de configuration ``./front-backOffice/src/app/config.ts.tpl``.

**2. Lancez l'installation automatique de l'application :**
	
::

    ./install_backoffice.sh
    
Configuration de Nginx
======================

**1. Configuration de supervisor :**
	
::

   sudo nano /etc/supervisor/conf.d/oppv.conf

Copiez/collez-y ces lignes en renseignant les bons chemains et le bon port : 
::

    directory=/home/monuser/GeoPaysages/backend
    command=/home/monuser/venv/bin/gunicorn app:app -b localhost:8000
    autostart=true
    autorestart=true

    stderr_logfile=/var/log/oppv_vanoise/oppv_vanoise.err.log
    stdout_logfile=/var/log/oppv_vanoise/oppv_vanoise.out.log


**2. Configuration de Nginx :**

::

    sudo nano /etc/nginx/conf.d/oppv_vanoise.conf

Copiez/collez-y ces lignes en renseignant les bons chemains et le bon port : 

::

	server {
        listen       80;
        server_name  vps587786.ovh.net;
        
        location / {
            proxy_pass http://127.0.0.1:8000;
        }
    
        location /pictures {
            alias  /home/oppv/data/images/;
        }

        location /app_admin {
            alias /home/oppv/app_admin;
            try_files $uri$args $uri$args/ /app_admin/index.html;
        }
    }


:notes:	

    Modifier server_name pour ajouter le nom domaine associé a GeoPaysages :
	 
::

    server_name mondomaine.fr

**3. Redémarrer supervisor et Nginx :**
 
::  

    sudo supervisorctl reread
    sudo service supervisor restart
    sudo service nginx restart


