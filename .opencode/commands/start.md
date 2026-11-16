---
description: Démarre une tâche du backlog (statut in-progress) puis l'implémente
agent: build
---

Tu prends en charge la tâche $1. État actuel de la tâche :

!`node scripts/task.mjs show $1`

1. Passe la tâche en cours : `node scripts/task.mjs move $1 in-progress`.
   Si la commande est refusée, lis le message et arrête-toi pour l'expliquer.
2. Implémente la tâche en suivant la démarche de la commande /implement :
   spécification (`specs/$1.md` si elle existe), tests de la tâche, logique dans `src/lib/`,
   branchement dans `src/main.js`, styles dans `src/style.css`, boucle jusqu'au vert.
3. Note les étapes importantes au journal : `node scripts/task.mjs log $1 "…"` (une ligne courte, en français).
4. Quand les tests de la tâche passent, arrête-toi et indique que la tâche est prête pour `/livrer $1`.

Ne modifie jamais `backlog/` directement.
