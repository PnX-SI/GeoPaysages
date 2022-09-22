# Personnalisation de l'application

Vous pouvez personnaliser l'interface de l'application en modifiant et ajoutant des fichiers dans le répertoire `backend/static/custom/` (css, logo).

# Base de données

Certains paramètres sont dans la table `conf` :

- `map_cluster_disable` permet d'activer `FALSE` (par défaut) ou de désactiver `TRUE` les clusters de point.

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

# Ajout et personnalisation de blocs dans la page d'accueil

Il est possible d'ajouter jusqu'à 3 blocs jinja dans la page d'accueil.

Pour ce faire il faut créer un fichier dans le dossier `/tpl` avec comme nom `home_block_<numero>.jinja`

En cas de contenue multilingue, préférer `home_block_<numero>_<lang>.jinja` ex. `home_block_2_fr.jinja`  

## Les emplacements

- Le bloc **1** se placera entre le carroussel d'image et la liste des sites.
- Le bloc **2** se placera entre la liste des sites et la carte.
- Le bloc **3** se placera entre la carte et le footer.

# Ajout et personnalisation d'une page "A propos" (/about)

Créer un fichier dans le dossier `/tpl` avec comme nom `about.jinja`

En cas de contenue multilingue, préférer `about_<lang>.jinja` ex. `about_fr.jinja`  

Ceci permettra de faire apparaitre la section "A propos" dans la barre de navigation. 

Exemple de contenue du fichier `about.jinja`

```jinja
{% extends "layout.jinja" %}
{% set active_page = 'about' %}

{% block title %}À PROPOS{% endblock %}

{% block bodyClassNames %}page-about{% endblock %}

{% block header_title %}
    <h1>
        À PROPOS
    </h1>
{% endblock %}

{% block content %}
    <div class="container">
        Contenu de la page
    </div>
{% endblock %}
```

# Ajout et personnalisation d'une page "Mentions légales" (/legal-notices)

Reprendre la même procédure que pour la page d'accueil, c'est à dire :

Créer un fichier dans le dossier `/tpl` avec comme nom `legal_notices.jinja`

En cas de contenue multilingue, préférer `legal_notices_<lang>.jinja` ex. `legal_notices_fr.jinja`  

Ceci permettra de faire apparaitre la section "Mentions légales" en bas de l'application web.

Vous pouvez trouver un exemple du gouvernement [ici](https://www.economie.gouv.fr/entreprises/site-internet-mentions-obligatoires) qui vous précise les mentions obligatoires que vous devez faire apparaître sur votre site internet. 

Exemple de contenue du fichier `legal_notices.jinja`

```jinja
{% extends "layout.jinja" %}
{% set active_page = 'legal_notices' %}

{% block title %}Mentions Légales{% endblock %}

{% block bodyClassNames %}page-legal_notices{% endblock %}

{% block header_title %}
    <h1>
        Mentions Légales
    </h1>
{% endblock %}

{% block content %}
    <div class="container">
        Contenue de la page
    </div>
{% endblock %}

```

# Ajout et personnalisation d'une nouvelle page HTML

**1. Création de la page HTML**

- La page d'exemple pour créer une nouvelle page html dans le site se
    trouve dans `backend/tpl/sample.html`
- Copier/coller `sample.html` et renommer la nouvelle page

**2. Créer la route vers la nouvelle page**

- Ouvrir le fichier `backend/routes.py`
- Copier/coller un bloc existant et effectuer les modifications
    nécessaires en lien avec la nouvelle page html

**3. Ajout du lien vers la nouvelle page HTML**

- Ouvrir le fichier `backend/tpl/layout.html`
- Copier/coller un bloc 'li' existant et effectuer les modifications
    nécessaires en lien avec la nouvelle page html

**4. Création de l'intitulé du lien via l'internationalisation**

- Ouvrir le fichier `backend/i18n/fr/LC_MESSAGES/messages.po`
- Copier/coller un bloc existant et effectuer les modifications
    nécessaires en lien avec la nouvelle page html

**5. Compilation pour la prise en compte des modifications**

- Suivre les étapes du chapitre Internationalisation de l'application
- Pour les modifications effectuées dans les fichiers python, relancer
    la compilation python

```
sudo service supervisor restart
``` 

# Internationalisation de l'application

- Pour modifier les textes, éditer le fichier `backend/i18n/fr/messages.po`
- Activer l'environnement virtuel (depuis le répertoire source, par exemple `geopaysages`)

```
cd geopaysages/
source ./venv/bin/activate (venv doit apparaitre en préfixe des commandes)
```

- lancer la commande de compilation en se plaçant au préalable dans le répertoire `backend` :

```
cd backend/
pybabel compile -d i18n
```

> Pour plus d'informations, voir <https://pythonhosted.org/Flask-Babel/>

> Pour sortir de l'environnement virtuel, taper `deactivate`