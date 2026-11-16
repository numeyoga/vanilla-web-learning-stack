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

- [ ] **Version d'Opencode** des postes (`opencode --version`) : la configuration fournie est en syntaxe V1,
      lue par Opencode 1.x et 2.x. Ne pas mélanger syntaxe V1 et V2 dans un même fichier.
- [ ] **Dépendances** : `npm install` fonctionne via le registre interne (Nexus). Idéalement, `node_modules`
      déjà installé avant la séance.
- [ ] **Chrome** installé sur les postes (Playwright utilise `channel: 'chrome'`, aucun navigateur n'est téléchargé).
      Sinon, utiliser un environnement (ex. OpenDevBox) où Chrome est présent.
- [ ] **Essai complet** de chaque station avec le modèle interne, au moins deux fois (le modèle n'est pas déterministe).
- [ ] **Hooks et sous-agents** : vérifier si `tool.execute.before` s'applique aux outils appelés par un sous-agent
      dans votre version. Si non, le montrer comme limite (les permissions par agent restent la protection).
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

## Équivalence des permissions V1 → V2

La syntaxe native V2 remplace `permission` (objet par outil) par `permissions` (tableau ordonné de règles),
et l'action `bash` devient `shell`. Exemple pour la station 1 :

```jsonc
// V1 (utilisé dans le kit)
"permission": {
  "edit": { "*": "allow", "tests/*": "deny" },
  "bash": { "*": "ask", "git push*": "deny" }
}

// V2 natif
"permissions": [
  { "action": "edit",  "resource": "*",          "effect": "allow" },
  { "action": "edit",  "resource": "tests/*",    "effect": "deny"  },
  { "action": "shell", "resource": "*",          "effect": "ask"   },
  { "action": "shell", "resource": "git push *", "effect": "deny"  }
]
```

Dans les deux cas : la dernière règle qui correspond l'emporte.

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
