---
id: TASK-002
title: Bascule thème clair/sombre
status: todo
---

## Description

Ajouter dans l'en-tête un bouton qui bascule entre un thème clair et un thème sombre. Le choix est mémorisé.

## Critères d'acceptation

- [ ] `nextTheme`, `loadTheme` et `saveTheme` (src/lib/theme.js) sont implémentés
- [ ] Un bouton `data-testid="theme-toggle"` ajoute/retire la classe `theme-dark` sur `<body>`
- [ ] Le bouton porte `aria-pressed="true"` quand le thème sombre est actif, `"false"` sinon
- [ ] Les couleurs de la page changent réellement (variables CSS du thème sombre)
- [ ] Le choix est conservé après rechargement (localStorage)

## Tests (déjà écrits, ne pas modifier)

- tests/task-002-theme.test.js
- e2e/task-002-theme.spec.js

## Journal
