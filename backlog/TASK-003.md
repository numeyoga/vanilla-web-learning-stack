---
id: TASK-003
title: Recherche par nom
status: todo
---

## Description

Ajouter au-dessus de la liste un champ de recherche qui filtre les participants par nom pendant la saisie.

## Critères d'acceptation

- [ ] `filterByName` (src/lib/search.js) est insensible à la casse et aux accents
- [ ] Un champ `data-testid="search-input"` est placé dans la zone `data-testid="list-tools"`
- [ ] La liste est filtrée à chaque frappe
- [ ] Si rien ne correspond, un message `data-testid="empty-state"` indique « Aucun participant ne correspond à … »
- [ ] Le message disparaît quand la recherche est effacée

## Tests (déjà écrits, ne pas modifier)

- tests/task-003-recherche.test.js
- e2e/task-003-recherche.spec.js

## Journal
