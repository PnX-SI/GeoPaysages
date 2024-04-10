----------------------------------
-->> Sur le serveur UsersHub ciblé
----------------------------------
-- Créer un utilisateur à faire correspondre à celui du serveur GeoPaysages
CREATE ROLE geopaysages_uh WITH PASSWORD 'motdepasseàchanger';
-- Lui donner des droits sur le schéma utilisateurs
GRANT USAGE ON SCHEMA utilisateurs TO geopaysages_uh;
GRANT SELECT ON ALL TABLES IN SCHEMA utilisateurs TO geopaysages_uh;
ALTER DEFAULT PRIVILEGES FOR ROLE geopaysages_uh IN SCHEMA utilisateurs 
	GRANT SELECT ON TABLES TO geopaysages_uh; 
-- Ajout de l'extension FDW 
CREATE EXTENSION postgres_fdw; 
