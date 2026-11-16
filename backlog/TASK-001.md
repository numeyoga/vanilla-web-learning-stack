---
id: TASK-001
title: Compteur de participants dans l'en-tête
status: todo
---

## Description

Afficher dans l'en-tête de la page le nombre de participants, mis à jour à chaque ajout.

## Critères d'acceptation

- [ ] `formatCount` (src/lib/counter.js) retourne « Aucun participant », « 1 participant » ou « N participants »
- [ ] Un élément `data-testid="participant-count"` est affiché dans le `<header>`
- [ ] Le compteur est mis à jour après chaque ajout

## Tests (déjà écrits, ne pas modifier)

- tests/task-001-compteur.test.js
- e2e/task-001-compteur.spec.js

## Journal
