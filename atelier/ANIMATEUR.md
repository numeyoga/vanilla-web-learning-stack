# Guide de l'animateur

## Déroulé (1h50)

| Bloc | Durée | Contenu |
|---|---|---|
| Théorie | 15 min | Définition, niveaux d'autonomie, 5 briques, correspondance avec Opencode, limites |
| Présentation de la pratique | 10 min | Dépôt, tâches, stations, branches de solution, règles du jeu |
| Stations 1 + 2 | 25 min | Permissions, hooks |
| Station 3 | 20 min | Pipeline et agents spécialisés |
| Station 4 | 17-20 min | Flux des tâches |
| Débrief | 10-15 min | Voir questions ci-dessous |

Parcours minimal si le temps manque : stations 1 à 3 ; la station 4 devient un bonus.

## Préparation (à faire avant le jour J)

- [ ] **Version d'Opencode** des postes (`opencode --version`) : le kit est écrit pour la **v2**.
      Les participants encore en v1 utilisent les fichiers de [compat-v1/](compat-v1/README.md) :
      le plugin de la station 2 n'est pas chargé d'une version à l'autre.
- [ ] **Dépendances** : `npm install` fonctionne via le registre interne (Nexus). Idéalement, `node_modules`
      déjà installé avant la séance.
- [ ] **Chrome** installé sur les postes (Playwright utilise `channel: 'chrome'`, aucun navigateur n'est téléchargé).
      Sinon, utiliser un environnement (ex. OpenDevBox) où Chrome est présent.
- [ ] **Essai complet** de chaque station avec le modèle interne, au moins deux fois (le modèle n'est pas déterministe).
- [ ] **Hooks et sous-agents** : vérifier dans `factory.log` que le hook s'applique aussi aux outils du sous-agent
      `relecteur` (colonne agent). Si non, le montrer comme limite (les permissions par agent restent la protection).
- [ ] Vérifier que les dossiers `.opencode/plugins/`, `.opencode/agents/`, `.opencode/commands/` sont bien lus
      par votre version (certaines versions anciennes utilisaient les noms au singulier).

## État de départ attendu

```bash
npm run typecheck   # OK
npm test            # 4 tests du socle verts, 14 tests des tâches rouges (voulu)
npm run test:e2e    # 3 tests du socle verts, tests des tâches rouges (voulu)
node scripts/task.mjs list
```

## Branches

| Branche | Contenu |
|---|---|
| `main` | État de départ |
| `solution/station-1` | + `opencode.json` (permissions) |
| `solution/station-2` | + `.opencode/plugins/factory-gate.js` |
| `solution/station-3` | + agents `analyste`, `testeur`, `relecteur` et commandes `/spec`, `/tests`, `/implement`, `/review` |
| `solution/station-4` | + flux des tâches : permissions backlog, hook, `AGENTS.md`, `/start`, `/livrer` |
| `solution/features` | Implémentation de référence de TASK-001 à TASK-004 (démonstration de secours) |

## Différences v1 / v2 à connaître

Le kit est en v2. Les équivalents v1 sont dans [compat-v1/](compat-v1/README.md).

| Élément | Opencode v2 (kit) | Opencode v1 |
|---|---|---|
| Permissions | `permissions` : tableau de règles `{ action, resource, effect }` | `permission` : objet par outil |
| Outil shell | action et outil `shell` | `bash` |
| Sous-agents | action `subagent` | `task` |
| Agent Markdown | `permissions:` en liste YAML | `permission:` en objet YAML |
| Commande en sous-session | `subagent: true` | `subtask: true` (encore accepté en v2) |
| Plugin | `export default { id, setup(ctx) }`, `ctx.tool.hook("execute.before", …)` | `export const X = async () => ({ "tool.execute.before": … })` |
| Paramètres des outils | `event.input.path`, `event.input.command` | `output.args.filePath`, `output.args.command` |

Dans les deux versions : la dernière règle qui correspond l'emporte, et lever une erreur dans le hook bloque l'appel.

⚠️ Les plugins ne sont **pas compatibles** entre versions : un plugin v1 n'est pas chargé par la v2, et inversement.
Les permissions au format v1 restent lues par la v2, mais ne pas mélanger les deux formats dans un même fichier.

## Points pédagogiques à faire ressortir

1. **Le LLM propose, le système impose** : chaque station ajoute du déterministe autour d'un modèle probabiliste.
2. **Le message d'erreur est un prompt** : un garde-fou utile explique quoi faire à la place.
3. **Défense en profondeur** : permission + hook + script. Aucun n'est parfait seul (ex. contournement par le shell).
4. **L'humain se place sur le contrat** : valider la spécification et les tests a plus de valeur que relire chaque ligne.

## Questions de débrief

1. Quelle brique vous paraît la plus utile dans votre travail quotidien, dès demain ?
2. Que manque-t-il pour une « vraie » software factory ?
   (déclenchement automatique depuis un ticket, exécution en parallèle, intégration continue, isolation, coûts…)
3. Où l'humain doit-il absolument rester dans la boucle ?
