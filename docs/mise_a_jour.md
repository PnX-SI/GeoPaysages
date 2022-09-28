# Mettre à jour Géopaysages

- Récupérer tous les changements
  - Vérifier la branche `git branch`
  - Récupérer les nouveautés `git pull`
- Si l'on ne met à jour que le front / pas la partie admin
  - Se placer à la source du projet geopaysages
  - Reconstruire le front `./scripts/docker.sh up -d`
- Si l'on met aussi à jour la partie admin
  - Se placer à la source du projet geopaysages
  - Reconstruire toute l'application `./scripts/docker.sh up -d --build`
- Si l'on ne met à jour que les traductions
  - Se placer à la source du projet geopaysages
  - Stopper l'application `./scripts/docker.sh down`
  - Démarrer l'application `./scripts/docker.sh up -d`
- Vérifier que les changements sont appliqués
  - Se rendre sur l'application / site web
  - Vider le cache
- Profiter d'une application à jour