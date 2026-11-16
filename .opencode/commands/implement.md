---
description: Étape 3 — Implémente une tâche jusqu'à ce que ses tests passent (agent build)
agent: build
---

Implémente la tâche $1.

Voici la tâche :

!`node scripts/task.mjs show $1`

Démarche :
1. Lis la spécification `specs/$1.md` si elle existe, puis les tests de la tâche
   (`tests/` et `e2e/`, fichiers dont le nom commence par l'identifiant en minuscules).
2. Implémente d'abord la logique dans `src/lib/` (fonctions pures, JSDoc typée), puis le branchement dans `src/main.js`
   et les styles dans `src/style.css`.
3. Boucle jusqu'au vert : `npm run typecheck`, puis les tests unitaires de la tâche, puis ses tests e2e.
4. Termine par `npm test` pour vérifier que rien d'autre n'est cassé.

Les tests sont la spécification : tu ne les modifies pas. Si un test te semble faux, arrête-toi et explique pourquoi.
