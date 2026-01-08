CHANGELOG
=========

1.5.4 (2025-05-12)
------------------

**🚀 Nouveautés**

**Multi-langues :**

- Il est désormais possible de traduire l’ensemble des contenus (observatoires, sites, ...) en plusieurs langues.
- Lors de la mise à jour, tous les contenus existants sont automatiquement associés à la langue Français.
- Tant qu’une seule langue est publiée, aucun changement visible n’apparaît dans GeoPaysages.

**Gestion des droits utilisateurs :**

- Les droits sont définis au niveau de chaque observatoire.
- Un même utilisateur peut avoir des rôles différents selon l’observatoire.
- Voir la [documentation](./administration.md)

1.3.0 (2024-04-10)
------------------

📣 **Mise à jour majeure !**

Pour plus de détails sur les développements réalisés pour cette version, vous pouvez consulter [le cahier des charges](http://geonature.fr/documents/autres/geopaysages/CCTP_OPP_26-10-2021.pdf) de la commande du PNR du Luberon pour le compte des Parcs naturels régionaux de la région PACA.

**🚀 Nouveautés**

**Multi-observatoires :**

- Ajout de la notion d'observatoire permettant de structurer des sites d'observation dans différents observatoires (territoires, thématiques...)
  De nombreux changements et refonte de l'application

**Carte des sites**

- Amélioration du fonctionnement et de l'ergonomie des filtres de la carte des sites d'observations (filtrage en cascade et liens entre les filtres)

- Les paramètres des filtres actifs peuvent être traduits en URL. Exemple: ``/sites?filters=[{"name":"id_observatory","values":[6]},{"name":"themes","values":[3]}]``

- Ajout d'un bouton "partager" permettant de copier dans le pesse-papier l'URL de la carte avec les filtres actifs

- Amélioration globale de la carte des sites et ajout de symbologies pour les observatoires territoriaux et les sites
  
  Possibilité d'associer un pictogramme SVG à chaque thème. 
  Si un thème principal est précisé au niveau du site le picto s'affichera sur le marqueur de localisation du site

**Fiche site**

- Révision et amélioration du comparateur photos v2 et de sa configuration
- réintégration d'une timeline de sélection des photos de la série plus intuitive

**Galerie photo**

- intégration du composant de filtres dans la galerie photo

**Général**

- Possibilité de personnaliser la page d'accueil avec un bloc d'introduction et un carrousel de photos
- Ajout d'un template de page "mentions légales" par défaut avec lien depuis le footer
- Amélioration globale des options de personnalisation de l'application et meilleures gestions des templates des "blocs" qui composent la page d'accueil : [voir la documentation de personnalisation](/docs/personnalisation.md)
- Révision des paramètres de configuration et des documentations 
- Ajout d'une documentation développeur
- Révision de la procédure d'installation et mise à jour avec Docker : [voir la documentation d'installation](/docs/installation.md)

**Interface d'administration (backoffice)**

- Adaptation de l'interface d'administration pour la gestion des observatoires et des sites associés
- Ajout d'un éditeur de texte enrichi (WYSIWYG) pour les champs `description` et `temoignages` des sites d'observation.

**🐛 Corrections**

- Compatibilité avec la version 2.0.0 de la dépendance [usershub-authentification-module](https://github.com/PnX-SI/UsersHub-authentification-module/releases/tag/2.0.0)
- Figer la version 2.0.0 de usershub-authentification-module dans requirements.txt
- Figer la version de PostgreSQL/PostGIS dans le Dockerfile pour éviter les supprises lors de la mises à jour de l'image
- CSS et corrections mineures

**⚠️ Notes de version**

🪄 L'application s'installe désormais avec Docker 🐳 !

- Suivre les notes de versions intermédiaires jusqu'à la version 1.2.1 puis suivre [la documentation de migration](/docs/migration_v1.2_to_v1.3.md) depuis la version 1.2
- Pour une nouvelle installation suivre [la documentation d'installation](/docs/installation.md)
- **Bien relire l'ensemble des [documentations](/docs/) suite aux nombreuses évolutions de l'application**

💻 Développements réalisés par Natural Solutions (@20cents, @Naomi-Fischer)

💵 Financés par les Parc naturel régional du Luberon et les PNR de la région PACA.

✨ Développements et contributions complémentaires (tests et documentations) par ZebraGéo, le PNR du Pilat (@xavyeah39) et le PN des Écrins (@theolechemia et @camillemonchicourt).

1.2.1 (2022-03-24)
------------------

**🐛 Corrections**

- Correction d'une régression mineure (#146)

1.2.0 (2022-03-16)
------------------

**🚀 Nouveautés**

- Amélioration du calendrier de navigation entre les photos
- Ajout du favicon de l'admin sur les pages du portail public
- Améliorations mineures de l'interface
- Affichage de la référence du site (si renseignée) dans la popup de la carte (#105)
- Possibilité d'ajouter un site sans photo (#92)
- Migration de la documentation .rst en .md (#132, par @Jeje2201)
- Compléments de la documentation

**🐛 Corrections**

- Corrections mineures du module d'import FTP
- Correction des photos principales (#106)
- Correction du widget d'affichage de la dernière photo d'un site, disponible sur <URL>/sites/<id_site>/photos/latest)

1.1.0 (2021-07-30)
------------------

**🚀 Nouveautés**

- Nouvelle version du mode d'affichage des photos en superposition ou côte à côte (comparateur v2) activable ou non dans les paramètres (``COMPARATOR_VERSION`` dans ``backend/config.py``), inspiré de https://github.com/CaussesCevennes/VOPP (#76)
- Mise en place d'un filtre et d'un selecteur navigation entre les dates des photos (#77)
- Ajout de paramètres pour pouvoir configurer le comparateur v2 (#102 par @xavyeah39)
- Mise en place d'un script d'import automatique des photos sur un serveur FTP (#79 et #85)
- Documentation du script d'import automatique (https://github.com/PnX-SI/GeoPaysages/blob/master/docs/import.md)
- Possibilité d'ajouter un texte de présentation HTML sur la page d'accueil, avant ou après la moisaïque (#65)
- Création d'une page simple affichant la dernière photo d'un site, intégrable en iframe dans un autre site (#78)
- Prise en compte du HTML dans les textes de description et de témoignage des sites (#82)
- Liste des sites d'observation : amélioration des filtres (#75)
- Révision des noms des routes et des pages (#8, #9 et #93)
- Externalisation des scripts de création du schéma ``utilisateurs`` dans le dépôt de UsersHub et amélioration de son installation (#1 par @xavyeah39)
- Mise à jour des librairies Python (#109) et Javascript (#91)
- Complément de la documentation d'installation (par @xavyeah39)

**🐛 Corrections**

- Prise en compte du paramètre ``DEFAULT_SORT_SITES`` dans la page Galerie (par @xavyeah39)
- Corrections diverses

**⚠️ Notes de version**

- Suivre la procédure de mise à jour (https://github.com/PnX-SI/GeoPaysages/blob/dev/docs/installation.rst#mise-%C3%A0-jour-de-lapplication-front-et-back / Non testée sur cette version)

1.0.1 (2020-08-13)
------------------

**🚀 Nouveautés**

- Les sites listés sur la page **carte*- sont triés par référence.

**🐛 Corrections**

- Les légendes d'images sont régénérées quand on modifie le site pour que soit pris en compte le nouveau titre, ref, etc... En fait elles deviennent éligibles à la régénération.
- Correction CSS du sélecteur de fond de carte sur la page d'un site.
- Les liens vers les assets dans le template **sample*- pointent vers des dossiers non impactés par les mises à jours.

1.0.0 (2020-07-02)
------------------

**🐛 Corrections**

- Correction de la documentation pour compiler les fichiers de langue
- Utilisation du logo customisé dans l'interface d'administration

**⚠️ Notes de version**

Si vous réalisez une mise à jour vers cette version via le script ``update_app.sh`` :

- Il y a une ligne en plus dans le fichier d'exemple ``/front-backOffice/src/app/config.ts.tpl`` : ``customFiles: '<server_name>/static/custom/'``
- Avant de lancer ``update_app.sh``, il faut ajouter cette ligne dans le fichier existant ``/front-backOffice/src/app/config.ts``.

1.0.0-rc.4.2 (2020-03-30)
-------------------------

**🚀 Nouveautés**

- Ordonner la liste des points d'observations par la référence (ordre croissant) et non plus par nom

1.0.0-rc.4.1 (2019-10-10)
-------------------------

**🚀 Nouveautés**

- Catcher les erreurs de la base de données

**⚠️ Notes de version**

Avant de lancer l'installation ou la mise à jour :

- Ajouter ces variables de conf au fichier ``/front-backOffice/src/app/config.ts`` : 
  
  - ``map_lat_center: 45.372167``
  - ``map_lan_center: 6.819077``

- Ne pas corriger la coquille sur ``map_lan_center``

1.0.0-rc.4 (2019-07-25)
-----------------------

**🚀 Nouveautés**

- Résout les issues suivantes : #58 #59 #60 #63 #66 #68
- A propos de #68
  Le script de mise à jour ajoute les nouvelles clés de traductions à celles existantes.
  L'utilisateur de l'instance devra les remplir et recompiler le catalogue de traduction.

**⚠️ Notes de version**

Avant de lancer l'installation ou la mise à jour :

- Ajouter ces variables de conf au fichier ``/front-backOffice/src/app/config.ts`` : 
  
  - ``map_lat_center: 45.372167``
  - ``map_lan_center: 6.819077``

- Ne pas corriger la coquille sur ``map_lan_center``

1.0.0-rc.3.7 (2019-05-16)
-------------------------

**🚀 Nouveautés**

- Pouvoir configurer les fonds sur les 2 cartes (carte interactive et carte point d'obs)
  
  - Ajouter une ligne dans la table ``conf`` avec en key ``map_layers`` et en value le contenu du fichier joint.
  - Adapter le contenu du fichier au besoin (modifier/ajouter des fonds)

- Dans le module "Modifier la Photo" (enlever la capitale au mot photo) : faute d’orthographe sur le mot galerie (il faut 1 seul L, dans "Photo affichée dans la galerie")

- Ajout d'un script de suppression des images générées (``rm_photos.sh``). A exécuter en cas de modif des crédits directement en base de données, d'utilisation de photos générées antérieurement.

- Le backoffice affiche une info lorsqu'il y a une erreur serveur

1.0.0-rc.3.6 (2019-05-16)
-------------------------

**🚀 Nouveautés**

- Pouvoir configurer les fonds sur les 2 cartes (carte interactive et carte point d'obs)
  
  - Ajouter une ligne dans la table ``conf`` avec en key ``map_layers`` et en value le contenu du fichier joint.
  - Adapter le contenu du fichier au besoin (modifier/ajouter des fonds)

- Dans le module "Modifier la Photo" (enlever la capitale au mot photo) : faute d’orthographe sur le mot galerie (il faut 1 seul L, dans "Photo affichée dans la galerie")

- Ajout d'un script de suppression des images générées (``rm_photos.sh``). A exécuter en cas de modif des crédits directement en base de données, d'utilisation de photos générées antérieurement.

- Le backoffice affiche une info lorsqu'il y a une erreur serveur

1.0.0-rc.3.5 (2019-04-26)
-------------------------

**🚀 Nouveautés**

- Le champ ``auteur`` n'est plus utilisé dans le copyright des photos. Il faut supprimer tous les fichiers d'image commençant par download, large, medium, thumbnail
  ::
     rm -f download*
     rm -f large*
     rm -f medium*
     rm -f thumbnail*
- Diverses améliorations sur le site (les zoom par défaut des cartes sont configurables)
- Un script d'update est désormais disponible

**⚠️ Notes de version**

- Mettre le script ``update_app.sh`` à la racine de la version actuelle (au même niveau que ``install_app.sh``) et l'exécuter
- Requêtes à exécuter (avant de lancer la mise à jour c'est mieux) :
  ::
     INSERT INTO geopaysages.conf (key, value) VALUES ('zoom_max_fitbounds_map', '13');
     INSERT INTO geopaysages.conf (key, value) VALUES ('zoom_map_comparator', '13');

1.0.0-rc.3.4 (2019-03-21)
-------------------------

**🐛 Corrections**

- Fix: Notice no more required on comparator page

1.0.0-rc.3.3 (2019-02-08)
-------------------------

**🐛 Corrections**

- Fix DB user password 
- Delete user_pg

1.0.0-rc.3.2 (2019-02-04)
-------------------------

**🐛 Corrections**

- Fix id_application
- Add demo data

1.0.0-rc.3.1 (2019-01-29)
-------------------------

**🐛 Corrections**

- Fix wheel install

1.0.0-rc.3 (2019-01-29)
-----------------------

**🐛 Corrections**

- Corrige les problèmes d'installation

1.0.0-rc.2 (2019-01-25)
-----------------------

RC install

**🚀 Nouveautés**

Cette mise à jour contient surtout une évolution des scripts d'installation

1.0.0-rc.1 (2019-01-15)
-----------------------

RC global

**🚀 Nouveautés**

- Le projet nous semble abouti.
- Tester les scripts d'installation en suivant les instructions données dans https://github.com/PnX-SI/GeoPaysages/blob/master/docs/installation.rst

1.0.0-rc.0 (2018-12-21)
-----------------------

RC.0 pour le front

**🚀 Nouveautés**

Prise en charge de l'internationalisation via Babel, Babel-Flask

1.0.0-beta.5 (2018-12-19)
-------------------------

Amélioration de la carte

**🚀 Nouveautés**

- Quelques améliorations notables
- Bouton de recentrage sur l'emprise des points d'obs filtrés
- Liste de sélection d'un fond de carte (mais ce ne sont pas les fonds définitifs)
- Au survol d'un point d'obs de la liste, le marqueur de la carte affiche la vignette
- La liste des points d'observation dépend des filtres choisis

1.0.0-beta.4 (2018-12-04)
-------------------------

Restructuration des données des sites

**🚀 Nouveautés**

- Général
  
  - Ajout de la colonne legend_site dans t_site
  - Déplacement du contenu de testim_site vers desc_site
  - Ajout d'un contenu factice dans testim_site pour le site 003.Termignon

- Comparateur
  
  - Affichage de la legende
  - Affichage conditionnel de témoignage
  - Bouton de téléchargement d'une photo
  - Suppression du zoom sur le couple de photos
  - Sur tablette, les 2 photos comparées sont côte à côte

- Galerie
  
  - Une seule photo par site (pour l'instant la 1ère)

1.0.0-beta.3 (2018-12-03)
-------------------------

Arrivée du back

**🚀 Nouveautés**

- Une 1ère version du back est dispo à cette adresse temporaire : <URL>/static/app_admin/index.html

- Les améliorations apportées au front : 
  
  - Supprimer le bouton "Contact" dans les onglets de haut de page.
  - Footer : Logo du PNV déformé
  - Le formulaire contact du footer renvoi vers l'email de Patrick F. avec un objet pré-rempli faisant référence à l’OPPV.
  - Footer : insérer une espace après le © du copyright
  - Home : Titre : ajouter un article : L’OBSERVATOIRE PHOTOGRAPHIQUE DES PAYSAGES DE VANOISE
  - Home : Au survol le bandeau "Découvrir ce site" n’est pas actif sur Firefox Ubuntu/Mac
  - Comparateur : Lorsqu’aucune photo n’est épinglée mettre la photo la plus ancienne à gauche
  - Comparateur : Faire une obs, mail pré-rempli avec référence du site concerné
  - Comparateur :  aligner les photos sur leur base
  - Compateur : Titre générique, supprimer "Comparaison de photos"

1.0.0-beta.2 (2018-11-27)
-------------------------

Le front se concrétise

**🚀 Nouveautés**

Videz le cache !

Liste des problèmes connus sur le front : 

- Home
  
  - Il y a une scrollbar horizontale si le ratio de la fenêtre s'approche trop d'un carré.

- Comparateur
  
  - Sur tablette, les 2 photos comparées sont empilées.
  - Sauf erreur, nous n'avons pas le document "Notice technique pour le photographe".

1.0.0-beta.1 (2018-11-22)
-------------------------

On your marks - Première version beta fonctionnelle de l'application

**🚀 Nouveautés**

- Videz vos cache !
- La page d'accueil s'en sort bien.
- Le carte est fonctionnelle mais a besoin d'un peu d'attention.
- Le comparateur est honorable.
