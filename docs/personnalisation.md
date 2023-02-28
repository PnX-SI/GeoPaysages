# Intro
Tous les fichiers pouvant être personnalisés sont dans `/custom`
>(ou autre destination renseignée dans .env CUSTOM_PATH)

**Il est fortement recommandé d'initialiser un dépôt git dans ce dossier.**

# Personnalisation de l'interface

Vous pouvez personnaliser l'interface de l'application en modifiant et ajoutant des fichiers dans le répertoire `/custom/static` (css, logo).

# Configuration en base de données

Certains paramètres sont dans la table `conf` :

- `header_bg_primary`
  - `true` utilise la couleur principale comme arrière plan du header
  - `false` le header sera sur fond blanc

- `default_sort_sites` nom de la colonne pour ordonner les sites
    - Par nom : `name_site`
    - Par référence : `ref_site`

- `show_site_ref` affiche la référence du site si la valeur est `true`

- `map_cluster_disable` permet d'activer `false` (par défaut) ou de désactiver `true` les clusters de point.

- `map_cluster_options` permet l'activation / désactivation / gestion du zoom des clusters de point. [Liste des paramètres disponibles (sauf fonctions)](https://github.com/Leaflet/Leaflet.markercluster#all-options)

- `external_links` les liens en bas à droite dans le footer, c'est un
    tableau d'objets devant contenir un label et une url, ex.

```json
[{
    "label": "Site du Parc national de Vanoise",
    "url": "http://www.vanoise-parcnational.fr"
}, {
    "label": "Rando Vanoise",
    "url": "http://rando.vanoise.com"
}]
```

- `zoom_map_comparator` la valeur du zoom à l'initialisation de la
    carte de page comparateur de photos
    
- `zoom_max_fitbounds_map` la valeur du zoom max lorsqu'on filtre
    les points sur la carte interactive. Ce paramètre évite que le zoom
    soit trop important lorsque les points restant sont très rapprochés.

- `map_layers` les différentes couches disponibles sur la carte
    interactive. Voir [ce lien](https://leafletjs.com/reference-1.5.0.html#tilelayer) pour connaitre toutes les options de
    configuration ex :

```json
[
    {
        "label": "OSM classic",
        "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "options": {
            "maxZoom": 18,
            "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
        }
    },
    {
        "label": "IGN",
        "url": "http://wxs.ign.fr/[clé ign]/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg",
        "options": {
            "maxZoom": 18,
            "attribution": "&copy; <div>IgnMap</div>"
        }
    }
]
```

Si vous utiliser la version 2 du comparateur photos (paramètre `COMPARATOR_VERSION = 2` dans `config.py`), vous pouvez personnaliser celui-ci selon votre contexte. Notamment le simplifier dans le cas de série de photos sur des pas temps plutôt espacés (reconductions pluri-annuelles, annuelles voire mensuelles) :

- `comparator_date_filter` permet d'activer `TRUE` ou de désactiver `FALSE` l'outil de filtrage par plage de dates (actif par défaut si le paramètre n'est pas renseigné). Celui-ci étant peu utile dans le cas de petites séries de photos ou de reconductions annuelles par exemple.

- `comparator_date_step_button` permet de masquer le bouton sélecteur de pas de temps. Si il est renseigné à `FALSE` le bouton ne sera pas affiché et les boutons précédent/suivant fonctionneront sans distinction de pas de temps. Utile dans le cas de petite séries de photos.

- `comparator_date_format` permet de personnaliser le format d'affichage des dates des photos dans le bouton sélecteur. Avec la valeur `year` on affiche la date au format `YYYY` ou avec `month`  au format `MM/YYYY`.
Le comportement par défaut reste l'affichage de la date complète au format `day` --> `DD/MM/YYYY` (si non-renseigné).
Ce paramètre permet aussi de filtrer en conséquence les pas de temps disponibles dans le bouton ad-hoc (exemple : si `month` est défini, les pas de temps disponibles seront `1 mois` et `1 an`). Utile dans le cas où les dates de photos sont parfois imprécises (photos ancienns, cartes postales...).

- `comparator_default_mode` permet de choisir le type de comparateur à afficher par défaut à l'ouverture de la page.
    - `sidebyside` mode superposition
    - `split` mode côte à côte

# Ajouter des pictos SVG à des thématiques

La configuration se fait dans la base de données.

Il faut se rendre dans la colonne `icon` de la table `dico_theme` et y coller le code svg.

Il est préférable d'utiliser un svg carré. Exemple de bibliothèque de SVG : [ionicons](https://ionic.io/ionicons)

# Carrousel de la page d'accueil

1. Placer les photos dans le dossier `custom/static/home-carousel`
1. Les photos doivent de préférence
    - Avoir une largeur 3x plus grande que leur hauteur. Ex : 1920 x 640
    - Avoir un format de type jpeg
    - Éviter d'avoir une largeur qui dépasse 2000px
    - Être compressées à 90 pour alléger le poids de l'image

# Ajout et personnalisation de blocs dans la page d'accueil

Il est possible d'ajouter jusqu'à 3 blocs jinja dans la page d'accueil.

Pour ce faire il faut créer un fichier dans le dossier `/custom/tpl` avec comme nom `home_block_<numero>.jinja`

En cas de contenue multilingue, préférer `home_block_<numero>_<lang>.jinja` ex. `home_block_2_fr.jinja`  

## Les emplacements

- Le bloc **1** se placera entre le carroussel d'image et la liste des sites.
- Le bloc **2** se placera entre la liste des sites et la carte.
- Le bloc **3** se placera entre la carte et le footer.

# Personnalisation de la page "À propos" (/about)

Éditer le fichier `/custom/tpl/about.jinja`

En cas de contenue multilingue, renommer en `about_<lang>.jinja` ex. `about_fr.jinja`  

## Suppression de la page "À propos"

- Supprimer ou renommer le fichier `/custom/tpl/about.jinja`  
- Supprimer le lien du menu
  - Éditer le fichier `/custom.tpl/main_menu.jinja`
  - Supprimer ou commenter le bloc `<li>` qui contient `<a href="/about" class="nav-link">`



# Personnalisation de la page "Mentions légales" (/legal-notices)

Reprendre la même procédure que pour la page "À propos", c'est à dire :

Éditer le fichier `/custom/tpl/legal_notices.jinja`

**Cette page ne peut pas être supprimée car sa présence est une obligation légale**

# Ajout et personnalisation d'une nouvelle page HTML

**1. Création de la page HTML**

- La page d'exemple pour créer une nouvelle page html dans le site est la page "À propos"
- Dupliquer le fichier `/custom/tpl/about.jinja` en lui donnant un nom approprié
- Éditer le fichier `/custom/custom_app.py` 
  - Dupliquer la route `@custom.route('/about')` le contenu de la fonction
  - 

**2. Créer la route vers la nouvelle page**

- Ouvrir le fichier `/custom/custom_app.py` 
- Copier/coller le bloc de la route `@custom.route('/about')` et effectuer les modifications
    nécessaires en lien avec la nouvelle page html

**3. Ajout du lien vers la nouvelle page HTML**

- Ouvrir le fichier `custom.tpl/main_menu.jinja`
- Copier/coller un bloc `<li>` existant et effectuer les modifications
    nécessaires en lien avec la nouvelle page html

**4. Création de l'intitulé du lien via l'internationalisation**

- Ouvrir le fichier `custom/i18n/fr/LC_MESSAGES/messages.po`
- Copier/coller un bloc existant et effectuer les modifications
    nécessaires en lien avec la nouvelle page html

**5. Prise en compte des modifications**

- Suivre les étapes du chapitre Internationalisation de l'application


# Internationalisation de l'application

1. Éditer le fichier `custom/i18n/fr/LC_MESSAGES/messages.po` 
1. Appliquer les changements `./docker/docker.sh exec backend pybabel compile -d ./i18n && ./docker/docker.sh restart backend`
1. Actualiser la page web, les modifications devraient apparaitres