# Compatibilité Opencode v1

Le kit est écrit pour **Opencode v2**. Ce dossier contient les équivalents pour les postes encore en v1
(`opencode --version` affiche `1.x`).

Ce sont les versions **complètes** (état final de la station 4). Pendant l'atelier, prenez-en seulement
la partie qui correspond à votre station.

| Fichier v1 | Remplace (v2) | Station |
|---|---|---|
| `opencode.json` | `opencode.json` à la racine | 1 et 4 |
| `factory-gate.js` | `.opencode/plugins/factory-gate.js` | 2 et 4 |
| `agents/*.md` | `.opencode/agents/*.md` | 3 |

Les commandes (`.opencode/commands/*.md`) et le script `scripts/task.mjs` sont identiques en v1 et en v2.

## Ce qui change en v1

- **Permissions** : clé `permission` (objet par outil) au lieu du tableau `permissions` ; l'outil shell s'appelle `bash`.
  Exemple : `"bash": { "*": "ask", "git push*": "deny" }`.
- **Agents** : `permission:` en objet YAML dans l'en-tête, au lieu d'une liste de règles.
- **Plugin** : export nommé d'une fonction qui retourne les hooks ; le hook s'appelle `tool.execute.before`,
  reçoit `(input, output)`, et les paramètres sont dans `output.args` (`filePath`, `command`).

```js
// v1
export const FactoryGate = async ({ directory }) => ({
  'tool.execute.before': async (input, output) => { /* input.tool, output.args */ },
});

// v2
export default {
  id: 'factory-gate',
  async setup(ctx) {
    await ctx.tool.hook('execute.before', (event) => { /* event.tool, event.input */ });
  },
};
```

Dans les deux versions : lever une erreur dans le hook bloque l'appel d'outil et renvoie le message au modèle.

⚠️ Ne copiez pas un plugin v1 dans un poste v2 (ou l'inverse) : il ne serait pas chargé, sans forcément afficher d'erreur.
