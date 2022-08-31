# Édition

- Éditer le fichier  
  `GeoPaysages/backend/i18n/fr/LC_MESSAGES/messages.po`
- Entrer dans le container  
  `./scripts/docker.sh exec backend /bin/bash`
- Compiler le fichier et sortir  
  `pybabel compile -d ./i18n && exit`
- Redémarrer le container  
  `./scripts/docker.sh restart backend`

# Ajout de traduction(s)

- Rajouter la traduction dans le(s) fichier(s) où l'on veut la(es) traduction(s)
- Entrer dans le container  
  `./scripts/docker.sh exec backend /bin/bash`
- Lancer l'extraction  
  `pybabel extract -F babel.cfg -o ./i18n/messages.pot .`
- Lancer la mise à jour  
  `pybabel update -i ./i18n/messages.pot -d ./i18n/`
- Avant de pouvoir éditer le fichier de traduction, se mettre les droits  
  `chmod 777 /app/i18n/fr/LC_MESSAGES/messages.po`
- Éditer le fichier de traduction
- Supprimer la ligne fuzy  
  `#, fuzzy`
- Compiler  
  `pybabel compile -d ./i18n && exit`
- Redémarrer le container  
  `./scripts/docker.sh restart backend`
