---
description: Étape 2 — Écrit les tests d'une tâche à partir de sa spécification (agent testeur)
agent: testeur
---

Écris les tests de la tâche $1 à partir de sa spécification `specs/$1.md`.

- Tests unitaires Vitest dans `tests/` et tests e2e Playwright dans `e2e/`,
  nommés avec l'identifiant de la tâche **en minuscules** (ex. `tests/task-004-badge.test.js`).
- Lance-les ensuite : ils doivent échouer, et uniquement parce que la fonctionnalité n'existe pas encore.

Rappel : tu ne modifies pas `src/`.
