# Mettre à jour Géopaysages

- Récupérer tous les changements
  - Vérifier la branche `git branch`
  - Récupérer les nouveautés `git pull`
- Appliquer tous les changements
  - Se placer à la source du projet geopaysages
  - Reconstruire toute l'application `./scripts/docker.sh up -d --build`
- Vérifier que les changements sont appliqués
  - Se rendre sur l'application / site web
  - Vider le cache (pour la partie admin)
- Profiter d'une application à jour