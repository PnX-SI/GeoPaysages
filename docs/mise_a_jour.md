Mise à jour de l'application (Front et back)
============================================

- Au préalable, s'assurer que le fichier de configuration
    `/geopaysages/front-backOffice/src/app/config.ts` contienne la ligne
    suivante :

```
customFiles: '<nom domaine ou url>/static/custom/',
```

- Se placer dans le répertoire `geopaysages`
- Lancer l'update

```
./update_app.sh
```

- Renseigner la version de production (pas de version de développement) à installer (Ex : v1.0.0)
- Un répertoire `<user>/geopaysages-[date mise à jour]` est créé ou mis à jour, contenant tout l'environnement de l'ancienne release permettant de pouvoir revenir en arrière ou de récupérer des éléments.

> La mise à jour applicative ne prend pas en compte la récupération des pages personnalisées se basant sur le template `backend/tpl/sample.html`. Cela doit être récupérer manuellement après la mise à jour applicative.

Récupération depuis geopaysages-[date mise à jour] :

- le fichier `html` de la page dans `backend/tpl`
- le fichier `layout.html` ou les modifs faites dedans dans
    `backend/tpl`
- le fichier `routes.py` ou les modifs faites dedans dans `backend`
- le fichier d'internationalisation `messages.po` ou les modifs
    dedans dans `backend/i18n/fr/LC_MESSAGES`
- s'il y a des images, les récupérer dans
    `backend/static/custom/images`
- lancer les commandes nécessaires, notamment pour python pour
    l'internationalisation (voir chapitre ci-dessous)
- lancer

```
sudo service supervisor restart
``` 
