# Factory Kit — mini software factory avec Opencode

Support pratique de l'atelier **« Structurer son workflow humain-IA avec l'IA »**.

Le principe : une *software factory* n'est pas un produit qu'on installe, c'est un assemblage de briques
(spécification, étapes, agents spécialisés, garde-fous, feedback et traçabilité). Pendant l'atelier,
chaque participant construit ces briques dans Opencode, sur une petite application web.

## Démarrage

Prérequis : Node.js 22+, Google Chrome installé, **Opencode v2** (pour la v1, voir [atelier/compat-v1/](atelier/compat-v1/README.md)).

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # types + tests unitaires + tests e2e
```

Au départ, la vérification de types et les tests du socle passent ; les tests des tâches TASK-001 à TASK-003
sont **rouges** (c'est voulu : ils décrivent ce qui reste à faire).

## Parcours de l'atelier

| Station | Brique de factory | Énoncé | Solution |
|---|---|---|---|
| 1 | Garde-fous déclaratifs (permissions) | [atelier/station-1.md](atelier/station-1.md) | branche `solution/station-1` |
| 2 | Garde-fous programmatiques (hooks) | [atelier/station-2.md](atelier/station-2.md) | branche `solution/station-2` |
| 3 | Étapes et agents spécialisés | [atelier/station-3.md](atelier/station-3.md) | branche `solution/station-3` |
| 4 | Mise à jour du flux et traçabilité | [atelier/station-4.md](atelier/station-4.md) | branche `solution/station-4` |

Les stations sont **cumulatives** : chaque branche de solution contient aussi les précédentes.
Pour rattraper le groupe : `git checkout solution/station-N`.

La branche `solution/features` contient une implémentation de référence des quatre tâches
(démonstration de secours si le modèle ne coopère pas).

Animateur : voir [atelier/ANIMATEUR.md](atelier/ANIMATEUR.md).
