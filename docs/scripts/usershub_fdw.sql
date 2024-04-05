-------------------------------
-->> Sur le serveur GeoPaysages
-------------------------------
-- Suprimer la contrainte FK sur t_photo vers t_roles
ALTER TABLE geopaysages.t_photo DROP CONSTRAINT t_photo_fk3;

-- Renommer le schéma utilisateurs crée lors de l'installation
ALTER SCHEMA utilisateurs RENAME TO utilisateurs_default;

-- Recréer un schéma utilisateurs vide dans lequel sera importé les objets de celui du UsersHub distant via FDW
CREATE SCHEMA IF NOT EXISTS utilisateurs AUTHORIZATION $owner_geopaysages;
COMMENT ON SCHEMA utilisateurs IS 'Schema utilisateurs de UsersHub : FDW sur BDD distante';

-- Affectation de permissions et privilèges par défaut
GRANT USAGE ON SCHEMA utilisateurs TO $owner_geopaysages ;

-- Creation de l'extension FDW (à faire également sur le serveur UsersHub ciblé)
CREATE EXTENSION postgres_fdw;
GRANT USAGE ON FOREIGN DATA WRAPPER postgres_fdw to $owner_geopaysages;

-- Création du serveur FDW
CREATE SERVER fdw_usershub
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host '$usershub_host', port '$usershub_port', dbname '$usershub_db');
       
GRANT USAGE ON FOREIGN SERVER fdw_usershub TO geopaysages;

-- Créer une correspondance d'utilisateurs avec le role utilisé sur le serveur UsersHub distant
CREATE USER MAPPING FOR $owner_geopaysages
        SERVER fdw_usershub
        OPTIONS (user '$usershub_user', password '$usershub_pass');

-- Import des tables du schéma utilisateurs (distant) en foreign tables :
IMPORT FOREIGN SCHEMA utilisateurs
FROM SERVER fdw_usershub
INTO utilisateurs;

-- Recréer la contrainte supprimée sur t_photo après avoir vérifier les correspondances utilisateurs si nécéssaires dans la table t_photo (id_role >>> t_role)
-- /!\ il ne sera pas possible de recréer cette contrainte FK sur la foreign table t_roles
-- On crée donc une contrainte CHECK à la place basée sur une fonction vérifiant la correspondance d'id_role
CREATE OR REPLACE FUNCTION geopaysages.role_exists(role_id INT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM utilisateurs.t_roles WHERE id_role = role_id);
END;
$$ LANGUAGE plpgsql;

ALTER TABLE geopaysages.t_photo
ADD CONSTRAINT check_role_id_exists
CHECK (geopaysages.role_exists(id_role));