---
description: Livre une tâche terminée - relecture, puis done si la relecture et la quality gate sont OK
agent: build
---

Livraison de la tâche $1.

1. Passe la tâche en relecture : `node scripts/task.mjs move $1 review`.
   Si c'est refusé, lis le message et arrête-toi pour l'expliquer.
2. Lance le sous-agent **relecteur** sur les modifications en cours pour la tâche $1.
3. Selon son verdict :
   - **OK** → `node scripts/task.mjs move $1 done`. Cette commande lance la quality gate (types + tests de la tâche).
     Si elle est refusée, note la raison au journal, repasse en `in-progress`, corrige le code de production,
     puis recommence `/livrer $1`.
   - **À CORRIGER** → `node scripts/task.mjs log $1 "Relecture : <points bloquants résumés>"`
     puis `node scripts/task.mjs move $1 in-progress`, et liste les corrections à faire.
4. Termine en affichant l'état final : `node scripts/task.mjs show $1`.
