SET search_path = utilisateurs, pg_catalog;

-- Insérer l'application GeoPaysages
INSERT INTO t_applications (code_application, nom_application, desc_application, id_parent) VALUES 
('GP', 'GeoPaysages', 'Application permettant d''administrer et de publier un Observatoire Photographique des Paysages.', NULL)
;
SELECT pg_catalog.setval('t_applications_id_application_seq', (SELECT max(id_application)+1 FROM t_applications), false);

--Définir les profils utilisables pour l'application GeoPaysages
INSERT INTO cor_profil_for_app (id_profil, id_application) VALUES
(2, (SELECT id_application FROM utilisateurs.t_applications WHERE code_application = 'GP'))
,(3, (SELECT id_application FROM utilisateurs.t_applications WHERE code_application = 'GP')) 
,(4, (SELECT id_application FROM utilisateurs.t_applications WHERE code_application = 'GP'))
,(6, (SELECT id_application FROM utilisateurs.t_applications WHERE code_application = 'GP'))
;

INSERT INTO cor_role_app_profil (id_role, id_application, id_profil) VALUES
(9, (SELECT id_application FROM utilisateurs.t_applications WHERE code_application = 'GP'), 6) --admin GeoPaysages
;