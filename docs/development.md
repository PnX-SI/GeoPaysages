### Avant-propos
Geopaysages s'articule autour de 2 applications :  
**1. L'application principale**, celle que le publique peut consulter. Le code source est dans le dossier /backend et son container est nommé backend.  
La partie personnalisable est dans le dossier /custom (ou autre endroit défini lors de l'installation). Les modifications faites dans ce dossier ne sont pas versionnées dans ce dépôt.  
**2. L'admin**, est une application Angular dont l'accès est restreint au utilisateurs authentifiés. Elle permet de modifier le contenu de l'application principale.  
Le code source est dans /admin, son container est nommé admin.  
Le développement de l'admin ne peut pas se faire confortablement sur une machine distante, mais le backend oui.  

### Pré-requis
- Avoir suivi la doc d'installation et lancé une instance fonctionnelle.

#### Seulement si vous souhaiter modifier l'admin.
- Node 12  
Conseil : On a souvent besoin de plusieurs versions de Node sur un même post.  
Les utilisateurs Linux peuvent utiliser NVM :  
https://github.com/nvm-sh/nvm  
Les utilisateurs Windows, peuvent suivre cette documentation écrite par Microsoft :  
https://learn.microsoft.com/fr-fr/windows/dev-environment/javascript/nodejs-on-windows

### Activer l'env de dev
- Arrêter l'instance en cours  
  `./docker/docker.sh down`
- Désampler le fichier docker-compose.override.yml.sample.  
`mv ./docker/docker-compose.override.yml.sample ./docker/docker-compose.override.yml`  
(Aucun changement ne sera nécessaire dans ce fichier jusqu'à la phase de publication)
- Éditer le .env pour activer le mode debug :  
DEBUG=1 #pour activer le mode debug du backend  
ADMIN_ENV_DEV=1 #pour activer le mode debug de l'admin  
Vous n'êtes pas obligé d'activer les 2  
Conseil : Attribuer une autre valeur que 80 à PROXY_HTTP_PORT ex. 8080

- Redémarrer les containers  
`./docker/docker.sh up -d`  

Vous êtes prêt pour le développement du backend, l'app redémarre à chaque changement de code.  

**Pour le développement de l'admin :**  
`cd ./admin`  
`npm i`  
`npm start`  
Ouvrez cette url dans votre navigateur  
http://localhost:4200  
La page est rechargée à chaque changement de code.

#
### Publication des images
Pour que les modifications puissent bénéficier à tous, il faut publier les images des appli impactées. (admin ou backend)  

#### 1. S'assurer que votre utilisateur Github ait le droit de publier un package dans l'organisation (PnX-SI)

#### 2. Créer l'image
- Ouvrir docker-compose.override.yml
- Décommenter les lignes #build et #context du container  
  Attention à l'indentation ! Exemple avec le container backend :
```  
  backend:
    restart: "no"
    build:
      context: ../backend
    volumes:
    (etc...)
```
- Ouvrir le .env et modifier le tag de l'image à votre convenance  
Le tag est souvent un numéro de version  
`ghcr.io/pnx-si/geopaysages_<nom_du_container>:<tag>`
- Créer l'image  
`./docker/docker.sh build <nom_du_container>`

#### 3. Obtenir un token
- Se connecter à Github
- Atteindre cette page https://github.com/settings/tokens
- Cliquer sur Generate new token (classic)
- Sélectionner la permission : `write:packages`
- Renseigner les autres valeurs à votre convenance
- Valider
- Copier le token généré dans un endroit sécurisé

#### 4. Publier l'image
- `export CR_PAT=<TOKEN>`  
- `echo $CR_PAT | docker login ghcr.io -u <USERNAME> --password-stdin`
  > Doit afficher : Login Succeeded

- `docker push ghcr.io/pnx-si/geopaysages_<nom_du_container>:<tag>`
