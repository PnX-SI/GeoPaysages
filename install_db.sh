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

# Creation d'une variale pour le fichier de log
DBLogFile="./var/log/install_db.log"

# Suppression du fichier de log d'installation si il existe déjà puis création de ce fichier vide.
rm  -f $DBLogFile
touch $DBLogFile

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
    sudo -u postgres psql -c "CREATE USER $owner_geopaysages WITH ENCRYPTED PASSWORD '$owner_geopaysages_pass' "  &>> $DBLogFile
    sudo -n -u postgres -s createdb  $db_name
  sudo -n -u postgres -s psql -c "ALTER DATABASE $db_name OWNER TO $owner_geopaysages ;"
    echo "Ajout de postGIS et pgSQL à la base de données"
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION IF NOT EXISTS postgis;"  &>> $DBLogFile
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION postgis_topology;" &>> $DBLogFile
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog; COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';"  &>> $DBLogFile
    sudo -n -u postgres -s psql -d $db_name -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' &>> $DBLogFile

    # Création des schémas de la BDD
    echo "Création de la structure de la BDD..."
    cp install_configuration/oppdb.sql /tmp/oppdb.sql
    echo "" &>> $DBLogFile
    echo "" &>> $DBLogFile
    echo "--------------------" &>> $DBLogFile
    echo "" &>> $DBLogFile

    if [ $users_schema = "local" ]
    then
        echo "Création du schéma Utilisateur..."
        wget https://raw.githubusercontent.com/PnX-SI/UsersHub/$usershub_release/data/usershub.sql -P /tmp
        wget https://raw.githubusercontent.com/PnX-SI/UsersHub/$usershub_release/data/usershub-data.sql -P /tmp
        wget https://raw.githubusercontent.com/PnX-SI/UsersHub/$usershub_release/data/usershub-dataset.sql -P /tmp
        cp install_configuration/usershub_adds.sql /tmp/usershub_adds.sql
        export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/usershub.sql &>> $DBLogFile
        export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/usershub-data.sql &>> $DBLogFile
        export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/usershub-dataset.sql &>> $DBLogFile
        export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/usershub_adds.sql &>> $DBLogFile
    else
        echo "Connexion à la base Utilisateur..."
        cp install_configuration/usershub_fdw.sql /tmp/usershub_fdw.sql
        cp install_configuration/usershub_fdw_import.sql /tmp/usershub_fdw_import.sql
        sed -i "s#\$owner_geopaysages#$owner_geopaysages#g" /tmp/usershub_fdw.sql
        sed -i "s#\$usershub_host#$usershub_host#g" /tmp/usershub_fdw.sql
        sed -i "s#\$usershub_db#$usershub_db#g" /tmp/usershub_fdw.sql
        sed -i "s#\$usershub_port#$usershub_port#g" /tmp/usershub_fdw.sql
        sed -i "s#\$usershub_user#$usershub_user#g" /tmp/usershub_fdw.sql
        sed -i "s#\$usershub_pass#$usershub_pass#g" /tmp/usershub_fdw.sql
        sudo -u postgres -s psql -d $db_name -f /tmp/usershub_fdw.sql  &>> $DBLogFile
        export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/usershub_fdw_import.sql &>> $DBLogFile
    fi

    echo "Création de la BDD de GeoPaysages..."
    export PGPASSWORD=$owner_geopaysages_pass;psql -h $db_host -U $owner_geopaysages -d $db_name -f /tmp/oppdb.sql &>> $DBLogFile

    echo "Fin... Vérifiez le fichier de log !"
 
fi
