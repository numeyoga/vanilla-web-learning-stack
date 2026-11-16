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
     "permission": {
       "edit": {
         "*": "allow",
         "tests/*": "deny",
         "e2e/*": "deny"
       },
       "bash": {
         "*": "ask",
         "npm run *": "allow",
         "npm test": "allow",
         "npx tsc *": "allow",
         "npx vitest *": "allow",
         "npx playwright *": "allow",
         "git status*": "allow",
         "git diff*": "allow",
         "git log*": "allow",
         "git push*": "deny",
         "rm *": "deny"
       }
     }
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

- Trois effets : `allow` (autorisé), `ask` (validation humaine), `deny` (interdit).
- Pour les commandes, **la dernière règle qui correspond l'emporte** : on met le `"*"` général en premier, puis les exceptions.
- C'est simple et lisible… mais limité à des motifs de chemins et de commandes. Que se passe-t-il si l'agent écrit
  dans un test via le shell (`sed -i`, `echo >`) ? → station 2.

> Format de configuration : cet énoncé utilise la syntaxe « V1 » (`permission`), lue par Opencode 1.x **et** 2.x.
> L'équivalent en syntaxe native V2 (`permissions`, tableau de règles) est donné dans [ANIMATEUR.md](ANIMATEUR.md).
