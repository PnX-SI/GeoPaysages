#!/bin/bash

. install_configuration/settings.ini

function database_exists () {
    # /!\ Will return false if psql can't list database. Edit your pg_hba.conf as appropriate.
    if [ -z $1 ]
        then
        # Argument is null
        return 0
    else
        # Grep db name in the list of database
        sudo -n -u postgres -s -- psql -tAl | grep -q "^$1|"
        return $?
    fi
}

# Suppression du fichier de log d'installation si il existe déjà puis création de ce fichier vide.
sudo rm  -f /var/log/geopaysages/install_db.log
sudo touch /var/log/geopaysages/install_db.log
# Creation d'une variale pour le fichier de log
DBLogFile="/var/log/geopaysages/install_db.log"

# Si la BDD existe, je verifie le parametre qui indique si je dois la supprimer ou non

if database_exists $db_name
then
        if $drop_apps_db
            then
            echo "Suppression de la BDD..."
            sudo -n -u postgres -s dropdb $db_name  &>> $DBLogFile
        else
            echo "La base de données existe et le fichier de settings indique de ne pas la supprimer."
        fi
fi 

# Sinon je créé la BDD
if ! database_exists $db_name 
then
	
	echo "Création de la BDD..."
    sudo -u postgres psql -c "CREATE USER $owner_geopaysages WITH PASSWORD '$owner_geopaysages_pass' "  &>> $DBLogFile
    sudo -n -u postgres -s createdb  $db_name
    sudo -n -u postgres -s psql -c "ALTER DATABASE $db_name OWNER TO $owner_geopaysages ;"
    echo "Ajout de postGIS et pgSQL à la base de données"
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION IF NOT EXISTS postgis;"  &>> $DBLogFile
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION postgis_topology;" &>> $DBLogFile
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog; COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';"  &>> $DBLogFile
    sudo -n -u postgres -s psql -d $db_name -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' &>> $DBLogFile

    # Création des schémas de la BDD
    echo "Création de la structure de la BDD..."
    cp install_configuration/oppvdb.sql /tmp/oppvdb.sql
    cp install_configuration/userHubDB.sql /tmp/userHubDB.sql
    echo "" &>> $DBLogFile
    echo "" &>> $DBLogFile
    echo "--------------------" &>> $DBLogFile
    echo "" &>> $DBLogFile

    export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/userHubDB.sql &>> $DBLogFile
    export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/oppvdb.sql &>> $DBLogFile

 
fi
