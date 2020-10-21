CREATE SCHEMA IF NOT EXISTS utilisateurs AUTHORIZATION $owner_geopaysages;
COMMENT ON SCHEMA utilisateurs IS 'contient les tables du shema utilisateurs de UsersHub (BD distante) via FDW';

SET search_path = utilisateurs, pg_catalog;

-- Affectation de permissions et privilèges par défaut
GRANT USAGE ON SCHEMA utilisateurs TO $owner_geopaysages ;

-- Creation de l'extension FDW
CREATE EXTENSION postgres_fdw;

GRANT USAGE ON FOREIGN DATA WRAPPER postgres_fdw to $owner_geopaysages;

CREATE SERVER fdw_usershub
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host '$usershub_host', port '$usershub_port', dbname '$usershub_db');
        
GRANT USAGE ON FOREIGN SERVER fdw_usershub TO $owner_geopaysages;

-- créer une correspondance d'utilisateurs avec le role utilisé sur le serveur UsersHub distant
CREATE USER MAPPING FOR $owner_geopaysages
        SERVER fdw_usershub
        OPTIONS (user '$usershub_user', password '$usershub_pass');