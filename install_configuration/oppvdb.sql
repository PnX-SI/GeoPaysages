--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.24
-- Dumped by pg_dump version 9.3.1
-- Started on 2018-08-20 18:01:15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

CREATE SCHEMA IF NOT EXISTS geopaysages;

SET search_path = geopaysages, pg_catalog, public;

SET default_tablespace = '';

SET default_with_oids = false;

CREATE SCHEMA IF NOT EXISTS geopaysages ;
--
-- TOC entry 184 (class 1259 OID 23880460)
-- Name: cor_site_stheme; Type: TABLE; Schema: geopaysages;  Tablespace: 
--

CREATE TABLE cor_site_stheme_theme(
    id_site_stheme_theme SERIAL,
    id_site integer NOT NULL,
    id_stheme_theme integer NOT NULL,
    PRIMARY KEY(id_site, id_stheme_theme)
);



--
-- TOC entry 190 (class 1259 OID 23952913)
-- Name: cor_stheme_theme; Type: TABLE; Schema: geopaysages;  Tablespace: 
--

CREATE TABLE cor_stheme_theme (
    id_stheme_theme SERIAL UNIQUE,
    id_stheme integer NOT NULL,
    id_theme integer NOT NULL,
    PRIMARY KEY (id_theme, id_stheme)
);



--
-- TOC entry 189 (class 1259 OID 23880661)
-- Name: dico_licence_photo; Type: TABLE; Schema: geopaysages;  Tablespace: 
--

CREATE TABLE dico_licence_photo (
    id_licence_photo SERIAL PRIMARY KEY,
    name_licence_photo character varying,
    description_licence_photo character varying
);


--
-- TOC entry 185 (class 1259 OID 23880465)
-- Name: dico_stheme; Type: TABLE; Schema: geopaysages; Tablespace: 
--

CREATE TABLE dico_stheme (
    id_stheme SERIAL PRIMARY KEY,
    name_stheme character varying
);


--
-- TOC entry 186 (class 1259 OID 23880478)
-- Name: dico_theme; Type: TABLE; Schema: geopaysages;  Tablespace: 
--

CREATE TABLE dico_theme (
    id_theme SERIAL PRIMARY KEY,
    name_theme character varying
);



--
-- TOC entry 211 (class 1259 OID 23981446)
-- Name: t_photo; Type: TABLE; Schema: geopaysages; Tablespace: 
--

CREATE TABLE t_photo (
    id_photo SERIAL PRIMARY KEY,
    id_site integer,
    path_file_photo character varying,
    id_role integer,
    date_photo character varying,
    filter_date date,
    legende_photo character varying,
    display_gal_photo boolean,
    id_licence_photo integer
);


--
-- TOC entry 188 (class 1259 OID 23880590)
-- Name: t_serie; Type: TABLE; Schema: geopaysages; Tablespace: 
--


CREATE TABLE t_site (
    id_site SERIAL PRIMARY KEY,
    name_site character varying,
    desc_site character varying,
    ref_site character varying,
    legend_site character varying,
    testim_site character varying,
    code_city_site character varying,
    alti_site integer,
    main_photo integer,
    path_file_guide_site character varying,
    publish_site boolean,
    geom geometry
);


CREATE TABLE conf (
    key character varying,
    value character varying
);


INSERT INTO geopaysages.conf (key, value) VALUES ('external_links', '[{
    "label": "Site du Parc national de Vanoise",
    "url": "http://www.vanoise-parcnational.fr"
}, {
    "label": "Rando Vanoise",
    "url": "http://rando.vanoise.com"
}, {
    "label": "BiodiVanoise",
    "url": "http://biodiversite.vanoise-parcnational.fr"
}, {
    "label": "Photothèque",
    "url": "https://phototheque.vanoise-parcnational.fr"
}]
');
INSERT INTO geopaysages.conf (key, value) VALUES ('zoom_map', '18');
INSERT INTO geopaysages.conf (key, value) VALUES ('zoom_max_fitbounds_map', '13');
INSERT INTO geopaysages.conf (key, value) VALUES ('zoom_map_comparator', '13');

--
-- TOC entry 3814 (class 0 OID 21076)
-- Dependencies: 254
-- Data for Name: communes; Type: TABLE DATA; Schema: geopaysages;
--
CREATE TABLE communes (
    code_commune character varying PRIMARY KEY,
    nom_commune character varying
);



INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73023', 'Aussois');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73026', 'Avrieux');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73040', 'Bessans');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73047', 'Bonneval-sur-Arc');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73054', 'Bourg-Saint-Maurice');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73055', 'Bozel');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73071', 'Champagny-en-Vanoise');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73227', 'Courchevel');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73150', 'La Plagne Tarentaise');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73142', 'Landry');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73015', 'Les Allues');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73257', 'Les Belleville');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73157', 'Modane');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73176', 'Montvalezan');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73197', 'Peisey-Nancroix');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73201', 'Planay');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73206', 'Pralognan-la-Vanoise');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73223', 'Saint-André');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73232', 'Sainte-Foy-Tarentaise');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73285', 'Séez');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73296', 'Tignes');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73290', 'Val-Cenis');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73304', 'Val-d Isère');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73322', 'Villarodin-Bourget');
INSERT INTO geopaysages.communes (code_commune, nom_commune) VALUES ('73323', 'Villaroger');


INSERT INTO geopaysages.dico_theme (id_theme, name_theme) VALUES (1, 'Agriculture - Alpage');
INSERT INTO geopaysages.dico_theme (id_theme, name_theme) VALUES (2, 'Villages - Hameaux - Habitations');
INSERT INTO geopaysages.dico_theme (id_theme, name_theme) VALUES (3, 'Stations - Domaines skiables');
INSERT INTO geopaysages.dico_theme (id_theme, name_theme) VALUES (4, 'Aménagements - Travaux - Infrastructures');
INSERT INTO geopaysages.dico_theme (id_theme, name_theme) VALUES (5, 'Occupation des sols');
INSERT INTO geopaysages.dico_theme (id_theme, name_theme) VALUES (6, 'Milieux naturels');
INSERT INTO geopaysages.dico_theme (id_theme, name_theme) VALUES (7, 'Haute montagne');


INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (1, 'Prairies de fauche');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (2, 'Vergers et jardins potager');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (3, 'Agriculture et urbanisation');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (4, 'Village');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (5, 'Urbanisation des villages');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (6, 'Architecture');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (7, 'Patrimoine religieux');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (8, 'Stations - Villages');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (9, 'Aménagement des domaines skiables');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (10, 'Activités estivales en stations');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (11, 'Pistes');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (12, 'Autres - Stations de ski');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (13, 'Hydroélectricité');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (14, 'Tunnel ferroviaire entre Lyon et Turin');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (15, 'Routes et parkings');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (16, 'Infrastructures économiques et militaires');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (17, 'Autres - Aménagements - travaux');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (18, 'Implantation des villages et des hameaux');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (19, 'Paysages de vallée');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (20, 'Itinéraires de passage historique');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (21, 'Autres - Occupation des sols');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (22, 'Lacs');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (23, 'Rivières et torrents');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (24, 'Forêts');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (25, 'Glaciers');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (26, 'Érosion');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (27, 'Dynamique végétale');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (28, 'Autres - Milieux naturels');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (29, 'Alpinisme et sommets');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (30, 'Refuges');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (31, 'Sentiers et randonnée');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (32, 'Autres - Haute montagne');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (33, 'Autres - Habitat');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (34, 'Autres - Agriculture');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (35, 'Équilibre  agriculture / forêt');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (36, 'Patrimoine vernaculaire / Petit patrimoine rural');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (37, 'Avalanches / Risques naturels');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (38, 'Alpage / Prairie pâturée');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (39, 'Construction traditionnelle');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (40, 'Chalets - Hameaux d''alpage');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (41, 'Équipements d''accueil');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (42, 'Paysages d''altitude');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (43, 'Landes et pelouses d''altitude');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (44, 'Agriculture et stations de sports d''hiver');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (45, 'Aménagement de l''espace geopaysages urbain');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (46, 'Architecture des stations de sports d''hiver');
INSERT INTO geopaysages.dico_stheme (id_stheme, name_stheme) VALUES (47, 'Stations de ski d''altitude : urbanisme');


INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (1, 38, 1);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (2, 1, 1);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (3, 40, 1);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (4, 40, 2);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (5, 36, 1);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (6, 4, 2);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (7, 6, 2);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (8, 39, 2);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (9, 37, 3);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (10, 37, 4);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (11, 37, 6);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (12, 15, 4);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (13, 42, 5);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (14, 42, 6);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (15, 42, 7);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (16, 22, 6);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (17, 24, 6);
INSERT INTO geopaysages.cor_stheme_theme (id_stheme_theme, id_stheme, id_theme) VALUES (18, 27, 6);



INSERT INTO geopaysages.dico_licence_photo (id_licence_photo, name_licence_photo, description_licence_photo) VALUES (1, '© Observatoire photographique des paysages de Vanoise', '© Observatoire photographique des paysages de Vanoise');

INSERT INTO geopaysages.t_site (id_site, name_site, desc_site, testim_site, alti_site, path_file_guide_site, publish_site, geom, code_city_site, legend_site, ref_site, main_photo) VALUES (1, 'Champagny-en-Vanoise', 'Ce lac blanc, le lac de la Glière, n''est pas pris par les glaces, malgré les apparences. Il est en réalité asséché depuis le XIXe siècle. En 1818, les hommes vivent alors dans le « petit âge glaciaire », période climatique plus froide commencée à la fin du XVIe siècle en Europe occidentale et dont nous sommes en train de voir la fin : le glacier de Rosolin vient alors « lécher » le bord du lac. Des séracs, autrement dit des morceaux de glaciers détachés de la langue principale, sont alors tombés dans ses eaux, bloquant l''écoulement naturel à la sortie du lac. L''eau a fini par déborder, emportant dans sa course les séracs, la boue et les roches vers l''aval. Après cette catastrophe naturelle de 1818, le lac s''est asséché, prenant un nouvel aspect. 
Après la vidange, les sédiments déposés au fond de la cuvette sont alors apparus à la lumière. L''alpage historique autour du lac n''en a pas été affecté, fréquenté qu''il est depuis le…XIIIe siècle.
', NULL, 2060, 'oppv-005-notice.pdf', true, '0101000020E6100000662FDB4E5B431B402026E1421EB74640', '73071', 'Lac asséché de la Glière, avec de gauche à droite : l''Aiguille Noire et le Col de la Croix des Frettes ', '005', 1);


INSERT INTO geopaysages.t_photo (id_photo, id_site, path_file_photo, id_role, date_photo, filter_date, legende_photo, display_gal_photo, id_licence_photo) VALUES (1, 1, 'oppv-005-00-2006.jpg', 1,  NULL, '2006-09-28', NULL, true, 1);
INSERT INTO geopaysages.t_photo (id_photo, id_site, path_file_photo, id_role, date_photo, filter_date, legende_photo, display_gal_photo, id_licence_photo) VALUES (3, 1, 'oppv-005-03-2014.jpg', 1, '29/09/2014', '2014-09-29', NULL, true, 1);


INSERT INTO geopaysages.cor_site_stheme_theme (id_site_stheme_theme, id_site, id_stheme_theme) VALUES (1, 1, 1);
INSERT INTO geopaysages.cor_site_stheme_theme (id_site_stheme_theme, id_site, id_stheme_theme) VALUES (2, 1, 3);
INSERT INTO geopaysages.cor_site_stheme_theme (id_site_stheme_theme, id_site, id_stheme_theme) VALUES (3, 1, 4);
INSERT INTO geopaysages.cor_site_stheme_theme (id_site_stheme_theme, id_site, id_stheme_theme) VALUES (4, 1, 9);
INSERT INTO geopaysages.cor_site_stheme_theme (id_site_stheme_theme, id_site, id_stheme_theme) VALUES (5, 1, 11);
INSERT INTO geopaysages.cor_site_stheme_theme (id_site_stheme_theme, id_site, id_stheme_theme) VALUES (6, 1, 14);
INSERT INTO geopaysages.cor_site_stheme_theme (id_site_stheme_theme, id_site, id_stheme_theme) VALUES (7, 1, 16);

ALTER TABLE ONLY t_photo
    ADD CONSTRAINT t_photo_fk1 FOREIGN KEY (id_site) REFERENCES t_site(id_site);

--
-- TOC entry 3142 (class 2606 OID 23981459)
-- Name: t_photo_fk2; Type: FK CONSTRAINT; Schema: geopaysages; 
--

ALTER TABLE ONLY t_photo
    ADD CONSTRAINT t_photo_fk2 FOREIGN KEY (id_licence_photo) REFERENCES dico_licence_photo(id_licence_photo);

-- 
-- Name: t_photo_fk3; Type: FK CONSTRAINT; Schema: geopaysages; 
--
ALTER TABLE ONLY t_photo
    ADD CONSTRAINT t_photo_fk3 FOREIGN KEY (id_role) REFERENCES utilisateurs.t_roles(id_role);

-- 
-- Name: cor_site_stheme_theme_fk1; Type: FK CONSTRAINT; Schema: geopaysages; 
--

ALTER TABLE ONLY cor_site_stheme_theme
    ADD CONSTRAINT cor_site_stheme_theme_fk1 FOREIGN KEY (id_site) REFERENCES t_site(id_site);

-- 
-- Name: cor_site_stheme_theme_fk2; Type: FK CONSTRAINT; Schema: geopaysages; 
--

ALTER TABLE ONLY cor_site_stheme_theme
    ADD CONSTRAINT cor_site_stheme_theme_fk2 FOREIGN KEY (id_stheme_theme) REFERENCES cor_stheme_theme(id_stheme_theme);

-- 
-- Name: cor_stheme_themee_fk1; Type: FK CONSTRAINT; Schema: geopaysages;
--

ALTER TABLE ONLY cor_stheme_theme
    ADD CONSTRAINT cor_stheme_theme_fk1 FOREIGN KEY (id_stheme) REFERENCES dico_stheme(id_stheme);

-- 
-- Name: cor_stheme_theme_fk2; Type: FK CONSTRAINT; Schema: geopaysages;
--

ALTER TABLE ONLY cor_stheme_theme
    ADD CONSTRAINT cor_stheme_theme_fk2 FOREIGN KEY (id_theme) REFERENCES dico_theme(id_theme);



-- Completed on 2018-08-20 18:01:24

--
-- PostgreSQL database dump complete
--

