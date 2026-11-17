# Station 3 — Étapes et agents spécialisés (~20 min)

## Objectif

Transformer une suite de prompts improvisés en **pipeline nommé**, où chaque étape est confiée à un agent
qui n'a que les droits nécessaires.

Brique de factory : *spécification → tests → implémentation → revue, avec séparation des rôles.*

## Le pipeline

| Étape | Commande | Agent | Peut écrire dans |
|---|---|---|---|
| Spécifier | `/spec TASK-004` | `analyste` | `specs/` uniquement |
| Écrire les tests | `/tests TASK-004` | `testeur` | `tests/` et `e2e/` uniquement |
| ✋ Valider le contrat | `git add tests e2e && git commit` | **vous** | — |
| Implémenter | `/implement TASK-004` | `build` | tout sauf les tests (stations 1 et 2) |
| Relire | `/review` | `relecteur` (sous-agent) | rien |

L'étape ✋ est la clé : une fois **committés par un humain**, les tests deviennent gelés (hook de la station 2).
L'agent d'implémentation ne peut plus les « arranger ».

## À faire

### 1. Les agents (`.opencode/agents/*.md`)

Un agent = un fichier Markdown : l'en-tête (frontmatter) porte la configuration, le corps est son prompt système.
Exemple pour l'analyste :

```markdown
---
description: Rédige la spécification d'une tâche (critères d'acceptation vérifiables), sans écrire de code.
mode: all
permissions:
  - { action: edit,  resource: "*",                            effect: deny }
  - { action: edit,  resource: "specs/*",                      effect: allow }
  - { action: shell, resource: "*",                            effect: deny }
  - { action: shell, resource: "node scripts/task.mjs show *", effect: allow }
---

Tu es analyste. Tu rédiges des spécifications courtes et vérifiables dans specs/TASK-XXX.md.
Chaque critère d'acceptation est observable (un comportement, un data-testid, un texte affiché).
Tu ne modifies jamais le code ni les tests.
```

Les règles d'un agent s'**ajoutent après** celles de `opencode.json` : comme la dernière règle qui correspond
l'emporte, l'agent peut réautoriser ce que la configuration globale interdit (ici, écrire dans `specs/`).

Créer sur le même modèle `testeur.md` (écrit dans `tests/` et `e2e/`, peut lancer vitest/playwright/tsc)
et `relecteur.md` (`mode: subagent`, aucune écriture, peut lire le diff git).

### 2. Les commandes (`.opencode/commands/*.md`)

Une commande = un prompt réutilisable. `$1` est le premier argument ; `` !`commande` `` injecte la sortie d'une
commande shell dans le prompt **avant** l'envoi au modèle.

```markdown
---
description: Rédige la spécification d'une tâche du backlog
agent: analyste
---

Rédige la spécification de la tâche $1 dans specs/$1.md.

Voici la tâche :
!`node scripts/task.mjs show $1`

Lis src/main.js et src/lib/ pour comprendre l'existant. Structure attendue :
## Comportement attendu, ## Critères d'acceptation (cases à cocher, observables), ## Hors périmètre.
```

Créer ensuite `tests.md`, `implement.md` et `review.md`.

## Expérience

Dérouler le pipeline complet sur **TASK-004** (badge « Nouveau »), qui n'a ni spécification ni tests.
Après `/tests`, vérifier que les nouveaux tests sont **rouges pour la bonne raison** avant de les committer.

## Points à retenir

- Une commande fige une **étape** ; un agent fige un **rôle** (prompt + droits).
- La séparation des rôles empêche l'auto-validation : celui qui implémente n'écrit ni la spec ni les tests.
- Le point de contrôle humain est placé là où il a le plus de valeur : la validation du contrat.

> En v2, le hook de la station 2 reçoit l'agent qui appelle l'outil (`event.agent`) : on peut le vérifier dans
> `factory.log` en lançant `/review`, qui s'exécute dans un sous-agent.
> Syntaxe v1 des agents (`permission:` en objet, `bash`) : voir [compat-v1/](compat-v1/README.md).
