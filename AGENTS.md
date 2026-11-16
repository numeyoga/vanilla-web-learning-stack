# Factory Kit — instructions pour les agents

Petite application web « Participants à l'atelier », support de l'atelier
« Structurer son workflow humain-IA avec l'IA ».

## Stack

- Vanilla JS (modules ES), **typé avec JSDoc** et vérifié par TypeScript (`checkJs`, mode `strict`).
- Vite (serveur de dev et build, cible : Chrome récent).
- Vitest pour les tests unitaires (`tests/`), Playwright pour les tests e2e (`e2e/`) avec le Chrome installé.

## Commandes

| Action | Commande |
|---|---|
| Vérifier les types | `npm run typecheck` |
| Tests unitaires | `npm test` |
| Tests e2e | `npm run test:e2e` |
| Tout vérifier | `npm run check` |
| Tests d'une seule tâche | `npx vitest run tests/task-002-theme.test.js` |

## Organisation

- `src/lib/` : fonctions pures, sans accès au DOM, testées par Vitest.
- `src/main.js` : branchement du DOM (lecture de l'état, rendu, événements).
- `src/style.css` : styles, basés sur des variables CSS (`--bg`, `--text`, …).
- `backlog/` : une tâche par fichier (`TASK-XXX.md`), avec un statut dans l'en-tête.
- `specs/` : spécifications détaillées des tâches qui en ont besoin.

## Conventions de code

- Chaque fichier JS commence par `// @ts-check` ; toute fonction exportée a une JSDoc typée (`@param`, `@returns`).
- Pas de dépendance d'exécution : uniquement l'API du navigateur.
- Les éléments testés portent un attribut `data-testid` (en kebab-case).
- Les textes de l'interface et les messages sont en français.
- Accessibilité : utiliser les attributs ARIA adaptés (ex. `aria-pressed` pour un bouton bascule).

## Règles de travail

- Les tests existants décrivent le comportement attendu : **on modifie le code de production, pas les tests**.
- Une tâche est terminée quand `npm run typecheck` et ses tests passent.
- Travailler sur une seule tâche à la fois.

## Flux des tâches

L'état d'une tâche (`status` dans `backlog/TASK-XXX.md`) et son journal se modifient **uniquement** avec le script
`scripts/task.mjs`. Ne jamais éditer un fichier du backlog directement : c'est bloqué, et le script vérifie
les transitions et la qualité.

| Moment | Commande |
|---|---|
| Voir les tâches | `node scripts/task.mjs list` |
| Lire une tâche | `node scripts/task.mjs show TASK-XXX` |
| Commencer une tâche | `node scripts/task.mjs move TASK-XXX in-progress` |
| Noter une étape importante | `node scripts/task.mjs log TASK-XXX "message court"` |
| Demander la relecture | `node scripts/task.mjs move TASK-XXX review` |
| Terminer (après relecture OK) | `node scripts/task.mjs move TASK-XXX done` |
| Reprendre après relecture | `node scripts/task.mjs move TASK-XXX in-progress` |

Transitions autorisées : `todo → in-progress → review → done`, et `review → in-progress` pour une reprise.
Le passage à `done` lance la vérification de types et les tests de la tâche : s'il est refusé, lis le message,
corrige le code de production, puis relance la commande.
