# TASK-004 — Badge « Nouveau » sur les ajouts récents

> Spécification de référence (branche `solution/features`). En atelier, elle est produite par `/spec TASK-004`.

## Comportement attendu

Un participant ajouté depuis moins de 10 minutes affiche un badge « Nouveau » à côté de son nom.

## Critères d'acceptation

- [ ] `isNew(participant, now)` (src/lib/recent.js) retourne `true` si l'ajout date de moins de 10 minutes, `false` sinon
- [ ] Le badge porte `data-testid="new-badge"` et affiche le texte « Nouveau »
- [ ] Aucun des participants initiaux n'a de badge
- [ ] Un participant ajouté via le formulaire porte le badge

## Hors périmètre

- Disparition automatique du badge sans rechargement ni nouvel affichage de la liste.
