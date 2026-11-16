# Station 2 — Garde-fous programmatiques : les hooks (~15 min)

## Objectif

Écrire un contrôle **bloquant** en JavaScript, exécuté avant chaque appel d'outil de l'agent.

Brique de factory : *une « quality gate » avec de la logique, là où une simple permission ne suffit pas.*

## Le principe

Opencode charge automatiquement les plugins placés dans `.opencode/plugins/`. Un plugin peut s'abonner au hook
`tool.execute.before` : il reçoit le nom de l'outil (`input.tool`) et ses arguments (`output.args`).
**Lever une erreur bloque l'appel**, et le message d'erreur est renvoyé au modèle.

➡️ Le message d'erreur est donc aussi un **prompt** : un bon gate dit pourquoi il bloque *et quoi faire à la place*.

## À faire

Créer `.opencode/plugins/factory-gate.js` et compléter les `TODO` :

```js
import { spawnSync } from 'node:child_process';
import { isAbsolute, join, relative } from 'node:path';

/** Dossiers dont les fichiers suivis par git sont « gelés » : ce sont des contrats. */
const PROTECTED_DIRS = ['tests/', 'e2e/'];

export const FactoryGate = async ({ directory }) => {
  /** Chemin relatif au projet, avec des « / » (fonctionne aussi sous Windows). */
  const toRelative = (path) =>
    relative(directory, isAbsolute(path) ? path : join(directory, path)).replaceAll('\\', '/');

  /** Un fichier est gelé s'il est dans un dossier protégé ET déjà suivi par git (committé ou indexé). */
  const isFrozen = (file) =>
    PROTECTED_DIRS.some((dir) => file.startsWith(dir)) &&
    spawnSync('git', ['ls-files', '--error-unmatch', file], { cwd: directory }).status === 0;

  return {
    'tool.execute.before': async (input, output) => {
      const args = output.args ?? {};

      // 1. Écriture de fichier par les outils d'édition
      if (['edit', 'write'].includes(input.tool) && typeof args.filePath === 'string') {
        const file = toRelative(args.filePath);
        // TODO : si le fichier est gelé, lever une erreur qui explique quoi faire à la place
      }

      // 2. Commandes shell dangereuses
      if (input.tool === 'bash' && typeof args.command === 'string') {
        // TODO : bloquer « git push » et « rm -rf », avec un message clair
      }
    },
  };
};
```

Relancer Opencode, puis rejouer l'expérience 1 de la station 1.

## Expériences

1. **Défense en profondeur** — Mettre temporairement `"tests/*": "allow"` dans `opencode.json` et redemander la
   modification du test : c'est maintenant le hook qui bloque. Lire comment l'agent réagit au message.
2. **Le contournement par le shell** — Demander :
   > Remplace « participants » par « personnes » dans tests/task-001-compteur.test.js avec sed.

   La permission `bash` (`ask`) vous demande votre accord… mais si vous aviez autorisé `sed` ? Ajouter au hook la
   détection d'une écriture shell vers un dossier protégé (`sed -i`, `>`, `tee`, `mv`, `cp`, `rm`).
3. **Nouveau test autorisé** — Demander à l'agent de *créer* `tests/essai.test.js` : c'est accepté, car le fichier
   n'est pas encore suivi par git. Pourquoi est-ce un choix pertinent ? (indice : station 3)

## Bonus — piste d'audit

Ajouter un hook `tool.execute.after` qui ajoute une ligne à `factory.log` pour chaque appel d'outil
(date, outil, fichier ou commande). Le fichier est ignoré par git.

## Points à retenir

- Permission = règle **déclarative** simple. Hook = règle **programmable** (contexte, git, contenu de la commande…).
- Les deux se cumulent : si l'un oublie un cas, l'autre peut le rattraper.
- Le message d'erreur guide le modèle : il fait partie du design du garde-fou.
