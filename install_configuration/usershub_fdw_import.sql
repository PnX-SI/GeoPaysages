-- On importe toute les tables du schéma utilisateurs (distant) comme foreign tables :
IMPORT FOREIGN SCHEMA utilisateurs
FROM SERVER fdw_usershub
INTO utilisateurs;
