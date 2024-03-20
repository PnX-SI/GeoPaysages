-- Renommer le schéma utilisateurs crée lors de l'installation
ALTER SCHEMA utilisateurs RENAME TO utilisateurs_default;

-- Recréer un schéma utilisateurs vide dans lequel sera importé les objets de celui du UsersHub distant via FDW
CREATE SCHEMA IF NOT EXISTS utilisateurs AUTHORIZATION $owner_geopaysages;
COMMENT ON SCHEMA utilisateurs IS 'contient les tables du shema utilisateurs de UsersHub (BD distante) via FDW';

SET search_path = utilisateurs, pg_catalog;

-- Affectation de permissions et privilèges par défaut
GRANT USAGE ON SCHEMA utilisateurs TO $owner_geopaysages ;

-- Creation de l'extension FDW (à faire également sur le serveur UsersHub ciblé)
CREATE EXTENSION postgres_fdw;
GRANT USAGE ON FOREIGN DATA WRAPPER postgres_fdw to $owner_geopaysages;

-- Création du serveur FDW
CREATE SERVER fdw_usershub
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host '$usershub_host', port '$usershub_port', dbname '$usershub_db');
       
GRANT USAGE ON FOREIGN SERVER fdw_usershub TO $owner_geopaysages;

-- Créer une correspondance d'utilisateurs avec le role utilisé sur le serveur UsersHub distant
CREATE USER MAPPING FOR $owner_geopaysages
        SERVER fdw_usershub
        OPTIONS (user '$usershub_user', password '$usershub_pass');


-- Import des tables du schéma utilisateurs (distant) en foreign tables :
IMPORT FOREIGN SCHEMA utilisateurs
FROM SERVER fdw_usershub
INTO utilisateurs;
