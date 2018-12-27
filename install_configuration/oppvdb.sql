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

SET search_path = geopaysages, pg_catalog, public;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 184 (class 1259 OID 23880460)
-- Name: cor_site_stheme; Type: TABLE; Schema: geopaysages; Owner: oppvuser; Tablespace: 
--

CREATE TABLE cor_site_stheme_theme(
    id_site_stheme_theme SERIAL,
    id_site integer NOT NULL,
    id_stheme_theme integer NOT NULL,
    PRIMARY KEY(id_site, id_stheme_theme)
);


ALTER TABLE geopaysages.cor_site_stheme_theme OWNER TO oppvuser;

--
-- TOC entry 190 (class 1259 OID 23952913)
-- Name: cor_stheme_theme; Type: TABLE; Schema: geopaysages; Owner: oppvuser; Tablespace: 
--

CREATE TABLE cor_stheme_theme (
    id_stheme_theme SERIAL UNIQUE,
    id_stheme integer NOT NULL,
    id_theme integer NOT NULL,
    PRIMARY KEY (id_theme, id_stheme)
);


ALTER TABLE geopaysages.cor_stheme_theme OWNER TO oppvuser;

--
-- TOC entry 189 (class 1259 OID 23880661)
-- Name: dico_licence_photo; Type: TABLE; Schema: geopaysages; Owner: oppvuser; Tablespace: 
--

CREATE TABLE dico_licence_photo (
    id_licence_photo SERIAL PRIMARY KEY,
    name_licence_photo character varying,
    description_licence_photo character varying
);


ALTER TABLE geopaysages.dico_licence_photo OWNER TO oppvuser;

--
-- TOC entry 185 (class 1259 OID 23880465)
-- Name: dico_stheme; Type: TABLE; Schema: geopaysages; Owner: oppvuser; Tablespace: 
--

CREATE TABLE dico_stheme (
    id_stheme SERIAL PRIMARY KEY,
    name_stheme character varying
);


ALTER TABLE geopaysages.dico_stheme OWNER TO oppvuser;

--
-- TOC entry 186 (class 1259 OID 23880478)
-- Name: dico_theme; Type: TABLE; Schema: geopaysages; Owner: oppvuser; Tablespace: 
--

CREATE TABLE dico_theme (
    id_theme SERIAL PRIMARY KEY,
    name_theme character varying
);


ALTER TABLE geopaysages.dico_theme OWNER TO oppvuser;

--
-- TOC entry 211 (class 1259 OID 23981446)
-- Name: t_photo; Type: TABLE; Schema: geopaysages; Owner: oppvuser; Tablespace: 
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


ALTER TABLE geopaysages.t_photo OWNER TO oppvuser;

--
-- TOC entry 188 (class 1259 OID 23880590)
-- Name: t_serie; Type: TABLE; Schema: geopaysages; Owner: oppvuser; Tablespace: 
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


ALTER TABLE geopaysages.t_site OWNER TO oppvuser;


--
-- TOC entry 3814 (class 0 OID 21076)
-- Dependencies: 254
-- Data for Name: communes; Type: TABLE DATA; Schema: geopaysages; Owner: oppvuser
--

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



ALTER TABLE ONLY t_photo
    ADD CONSTRAINT t_photo_fk1 FOREIGN KEY (id_site) REFERENCES t_site(id_site);

--
-- TOC entry 3142 (class 2606 OID 23981459)
-- Name: t_photo_fk2; Type: FK CONSTRAINT; Schema: geopaysages; Owner: oppvuser
--

ALTER TABLE ONLY t_photo
    ADD CONSTRAINT t_photo_fk2 FOREIGN KEY (id_licence_photo) REFERENCES dico_licence_photo(id_licence_photo);

-- 
-- Name: t_photo_fk3; Type: FK CONSTRAINT; Schema: geopaysages; Owner: oppvuser
--
ALTER TABLE ONLY t_photo
    ADD CONSTRAINT t_photo_fk3 FOREIGN KEY (id_role) REFERENCES utilisateurs.t_roles(id_role);

-- 
-- Name: cor_site_stheme_theme_fk1; Type: FK CONSTRAINT; Schema: geopaysages; Owner: oppvuser
--

ALTER TABLE ONLY cor_site_stheme_theme
    ADD CONSTRAINT cor_site_stheme_theme_fk1 FOREIGN KEY (id_site) REFERENCES t_site(id_site);

-- 
-- Name: cor_site_stheme_theme_fk2; Type: FK CONSTRAINT; Schema: geopaysages; Owner: oppvuser
--

ALTER TABLE ONLY cor_site_stheme_theme
    ADD CONSTRAINT cor_site_stheme_theme_fk2 FOREIGN KEY (id_stheme_theme) REFERENCES cor_stheme_theme(id_stheme_theme);

-- 
-- Name: cor_stheme_themee_fk1; Type: FK CONSTRAINT; Schema: geopaysages; Owner: oppvuser
--

ALTER TABLE ONLY cor_stheme_theme
    ADD CONSTRAINT cor_stheme_theme_fk1 FOREIGN KEY (id_stheme) REFERENCES dico_stheme(id_stheme);

-- 
-- Name: cor_stheme_theme_fk2; Type: FK CONSTRAINT; Schema: geopaysages; Owner: oppvuser
--

ALTER TABLE ONLY cor_stheme_theme
    ADD CONSTRAINT cor_stheme_theme_fk2 FOREIGN KEY (id_theme) REFERENCES dico_theme(id_theme);



-- Completed on 2018-08-20 18:01:24

--
-- PostgreSQL database dump complete
--

