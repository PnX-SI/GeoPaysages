# Documention administrateur

## Gestion des utilisateurs
Pour pouvoir accéder à l'admin, un utilisateur doit être associé à l'application GeoPaysages dans UsersHub.
- Accéder UsersHub.
- Créer l'utilisateur si nécessaire.
- Accéder à l'onglet **Applications**.
- Si besoin, ajouter l'application GeoPaysages, en lui donnant le code **GP**
- Éditer l'application pour définir les "profils disponibles" : 
  - Administrateur
  - Rédacteur
- Associer enfin l'utilisateur à GeoPaysages avec l’un des profils :
  - Administrateur : il aura tous les droits dans GeoPaysages.
  - Rédacteur : nécessite un paramétrage complémentaire dans l'admin de GeoPaysages (voir ci-dessous).

## Gestion du profil Rédacteur dans GeoPaysages
Un utilisateur défini comme **Rédacteur** dans UsersHub **n’a aucun droit par défaut** dans l’administration de GeoPaysages.  
Il faut lui attribuer des droits **au niveau de chaque observatoire**.  
### Principes :
- Les droits sont définis **par observatoire**.
- Un même utilisateur peut avoir des rôles différents selon l’observatoire :
  - Administrateur dans certains
  - Contributeur dans d’autres
- L’utilisateur ne voit dans les listes que les observatoires, sites et photos pour lesquels il dispose d’un droit au niveau de l’observatoire.  
### Rôles disponibles dans GeoPaysages :
#### Administrateur d’observatoire
- Peut gérer entièrement l’observatoire et ses sites.
- Limite : ne peut pas modifier le statut de publication de l’observatoire.
#### Contributeur
- Ne peut pas modifier les données de l’observatoire.
- Peut créer et éditer des sites mais ne peut pas les supprimer ou changer leur status de publication.