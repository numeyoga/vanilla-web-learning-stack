# Station 4 — Mise à jour du flux et traçabilité (~17-20 min)

## Objectif

Comprendre **comment l'agent lit et met à jour l'état du travail**, et rendre cette mise à jour fiable.

Brique de factory : *l'état du flux (todo → in-progress → review → done) ne dépend pas de la bonne volonté du modèle,
et « done » n'est possible qu'avec des tests verts.*

## Le format d'une tâche

```markdown
---
id: TASK-002
title: Bascule thème clair/sombre
status: todo            # todo → in-progress → review → done
---
...
## Journal
- 2026-11-16T15:24:30Z — statut : todo → in-progress
```

On va faire la même chose de trois façons, de la plus souple à la plus contrainte, sur TASK-002.

## Niveau A — Une consigne (~4 min)

Ajouter à `AGENTS.md` :

```markdown
## Flux des tâches
- Quand tu commences une tâche, passe son `status` à `in-progress` dans backlog/TASK-XXX.md
  et ajoute une ligne horodatée dans la section « ## Journal ».
- Quand tu as fini, passe le statut à `review`.
```

Demander : *« Implémente TASK-002. »* puis ouvrir `backlog/TASK-002.md`.

Observer : le statut a-t-il été mis à jour ? Avec quelle valeur exactement ? Le journal est-il au bon format ?
Recommencer avec une nouvelle session : le résultat est-il identique ?

## Niveau B — Une commande structurée (~5 min)

Créer `.opencode/commands/start.md` qui injecte la tâche dans le prompt et donne une consigne précise
(statut exact, format exact du journal).

Observer : le **contexte** est désormais fiable (la tâche est injectée), mais **l'écriture** reste faite par le modèle.

## Niveau C — Un passage obligé et déterministe (~8 min)

Le script `scripts/task.mjs` (fourni) est une machine à états :

```bash
node scripts/task.mjs list
node scripts/task.mjs show TASK-002
node scripts/task.mjs move TASK-002 in-progress
node scripts/task.mjs log  TASK-002 "message"
node scripts/task.mjs move TASK-002 done      # lance la quality gate : types + tests de la tâche
```

Il refuse les transitions invalides (`todo → done`), horodate le journal, et refuse « done » si la vérification de
types ou les tests de la tâche échouent. Ses messages de refus disent à l'agent quoi faire.

1. **Fermer les autres accès** : ajouter à la fin du tableau `permissions` de `opencode.json` :

   ```json
   { "action": "edit",  "resource": "backlog/*",               "effect": "deny" },
   { "action": "shell", "resource": "node scripts/task.mjs *", "effect": "allow" }
   ```
2. **Compléter le hook** de la station 2 : bloquer aussi les écritures shell vers `backlog/`.
3. **Remplacer la consigne** du niveau A dans `AGENTS.md` : l'état se change *uniquement* via `scripts/task.mjs`.
4. **Créer `/livrer`** : passage en `review`, relecture par le sous-agent `relecteur`, puis `done` si la relecture
   est positive (sinon retour en `in-progress` avec une note au journal).

Demander : *« /start TASK-002 »*, laisser l'agent implémenter, puis *« /livrer TASK-002 »*.

## Expériences

- Demander à l'agent de passer TASK-003 directement à `done` : lire le refus et la réaction de l'agent.
- Casser volontairement une fonction de TASK-002 puis lancer `/livrer TASK-002` : la gate refuse.

## Points à retenir

| Niveau | Contexte fourni à l'agent | Écriture de l'état | Fiabilité |
|---|---|---|---|
| A — consigne | l'agent va le chercher (ou pas) | le modèle | faible |
| B — commande | injecté, fiable | le modèle | moyenne |
| C — script + permissions + hook | injecté, fiable | code déterministe | élevée |

C'est le principe d'une software factory : **le LLM propose, le système impose.**
