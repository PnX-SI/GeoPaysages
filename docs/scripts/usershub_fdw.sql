-------------------------------
-->> Sur le serveur GeoPaysages
-------------------------------

-- Renommer le schéma utilisateurs crée lors de l'installation
ALTER SCHEMA utilisateurs RENAME TO utilisateurs_default;

-- Lors du renommage du schéma utilisateurs en utilisateurs_default, PostgreSQL redirige automatiquement les clés étrangères vers ce nouveau nom.
-- Le script ci-dessous supprime ces clés car le schéma utilisateurs_default ne sert plus qu’en tant que sauvegarde.
-- Elles ne seront pas recréées, car le nouveau schéma utilisateurs contiendra des tables distantes (foreign tables via FDW), incompatibles avec les clés étrangères.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT format(
          'ALTER TABLE %I.%I DROP CONSTRAINT %I;',
          src_ns.nspname, src_table.relname, con.conname,
          src_ns.nspname, src_table.relname, con.conname,
          string_agg(quote_ident(src_col.attname), ', '),
          target_table.relname,
          string_agg(quote_ident(tgt_col.attname), ', ')
        ) AS ddl
        FROM pg_constraint con
        JOIN pg_class src_table ON src_table.oid = con.conrelid
        JOIN pg_namespace src_ns ON src_ns.oid = src_table.relnamespace
        JOIN pg_class target_table ON target_table.oid = con.confrelid
        JOIN pg_namespace tgt_ns ON tgt_ns.oid = target_table.relnamespace
        JOIN unnest(con.conkey) WITH ORDINALITY AS src_keys(attnum, ord) ON true
        JOIN pg_attribute src_col ON src_col.attrelid = con.conrelid AND src_col.attnum = src_keys.attnum
        JOIN unnest(con.confkey) WITH ORDINALITY AS tgt_keys(attnum, ord) ON src_keys.ord = tgt_keys.ord
        JOIN pg_attribute tgt_col ON tgt_col.attrelid = con.confrelid AND tgt_col.attnum = tgt_keys.attnum
        WHERE con.contype = 'f'
          AND tgt_ns.nspname = 'utilisateurs_default'
          AND src_ns.nspname <> 'utilisateurs_default'
        GROUP BY src_ns.nspname, src_table.relname, con.conname, target_table.relname
    LOOP
        RAISE NOTICE 'Executing: %', r.ddl;
        EXECUTE r.ddl;
    END LOOP;
END $$;

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
