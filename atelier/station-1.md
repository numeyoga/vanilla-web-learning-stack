# Station 1 — Garde-fous déclaratifs : les permissions (~10 min)

## Objectif

Limiter ce que l'agent a le droit de faire, **sans écrire de code**, uniquement par configuration.

Brique de factory : *un agent ne doit pas pouvoir tout faire ; certaines actions sont interdites ou soumises à validation humaine.*

## Le problème à résoudre

Les tests de TASK-001 sont rouges. Un agent pressé de « faire passer les tests » a deux options :
corriger le code… ou modifier les tests. La seconde est rapide, et c'est exactement ce qu'on veut empêcher.

## À faire

1. Créer `opencode.json` à la racine du projet :

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "permissions": [
       { "action": "edit",  "resource": "*",                "effect": "allow" },
       { "action": "edit",  "resource": "tests/*",          "effect": "deny" },
       { "action": "edit",  "resource": "e2e/*",            "effect": "deny" },

       { "action": "shell", "resource": "*",                "effect": "ask" },
       { "action": "shell", "resource": "npm run *",        "effect": "allow" },
       { "action": "shell", "resource": "npm test *",       "effect": "allow" },
       { "action": "shell", "resource": "npx tsc *",        "effect": "allow" },
       { "action": "shell", "resource": "npx vitest *",     "effect": "allow" },
       { "action": "shell", "resource": "npx playwright *", "effect": "allow" },
       { "action": "shell", "resource": "git status *",     "effect": "allow" },
       { "action": "shell", "resource": "git diff *",       "effect": "allow" },
       { "action": "shell", "resource": "git log *",        "effect": "allow" },
       { "action": "shell", "resource": "git push *",       "effect": "deny" },
       { "action": "shell", "resource": "rm *",             "effect": "deny" }
     ]
   }
   ```

2. Relancer Opencode dans le projet (la configuration est lue au démarrage).

## Expériences

1. **Le blocage** — Demander à l'agent :
   > Les tests de TASK-001 échouent. Modifie `tests/task-001-compteur.test.js` pour qu'il attende « 6 personnes » au lieu de « 6 participants ».

   Observer : l'écriture est refusée. Que fait l'agent ensuite ?

2. **La validation humaine** — Demander :
   > Liste les fichiers du dossier src avec la commande ls.

   Observer : `ls` n'est pas dans la liste autorisée, donc Opencode **demande** l'accord (`ask`).

3. **Le chemin nominal** — Demander :
   > Implémente TASK-001 (voir backlog/TASK-001.md) puis lance ses tests.

   Observer : les commandes de test passent sans confirmation, le code de production est modifiable.

## Points à retenir

- Une règle = une **action** (`edit`, `shell`, `read`, `webfetch`…), une **ressource** (chemin, commande, URL) et un **effet**.
- Trois effets : `allow` (autorisé), `ask` (validation humaine), `deny` (interdit). Sans règle correspondante : `ask`.
- **La dernière règle qui correspond l'emporte** : on met la règle générale (`"*"`) en premier, puis les exceptions.
- Un motif de commande qui finit par `*` accepte aussi la commande seule : `git status *` couvre `git status`.
- C'est simple et lisible… mais limité à des motifs de chemins et de commandes. Que se passe-t-il si l'agent écrit
  dans un test via le shell (`sed -i`, `echo >`) ? → station 2.

> Cet énoncé utilise la syntaxe d'**Opencode v2** (`permissions`, tableau de règles, action `shell`).
> Vous êtes encore en v1 (`opencode --version`) ? Utilisez les fichiers de [compat-v1/](compat-v1/README.md).
