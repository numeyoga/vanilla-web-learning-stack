// Station 2 — Garde-fous programmatiques (plugin Opencode v2).
//
// Chargé automatiquement par Opencode depuis .opencode/plugins/.
// Un plugin v2 exporte par défaut un objet { id, setup } ; aucune dépendance à installer.
// Lever une erreur dans le hook « execute.before » bloque l'appel d'outil ;
// le message est renvoyé au modèle : il doit expliquer quoi faire à la place.

import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';

/** Dossiers dont les fichiers suivis par git sont « gelés » : ce sont des contrats. */
const PROTECTED_DIRS = ['tests/', 'e2e/'];

/** Commandes shell interdites, avec la consigne renvoyée au modèle. */
const DANGEROUS_COMMANDS = [
  {
    pattern: /\bgit\s+push\b/,
    advice: 'La publication est faite par un humain après revue. Termine ton travail et signale-le.',
  },
  {
    pattern: /\brm\s+-[a-z]*(r[a-z]*f|f[a-z]*r)/i,
    advice: 'Suppression récursive interdite. Supprime les fichiers un par un si nécessaire, en le justifiant.',
  },
  {
    pattern: /\bgit\s+(reset\s+--hard|clean\s+-[a-z]*f)/,
    advice: 'Opération git destructive interdite. Utilise git status / git diff pour analyser la situation.',
  },
];

/** Écriture via le shell vers un dossier protégé : redirection, tee, sed -i, mv, cp, rm, truncate. */
const SHELL_WRITE = /(>|\btee\b|\bsed\s+-i|\bmv\b|\bcp\b|\brm\b|\btruncate\b)[^|;&]*?\b(tests|e2e)\//;

/** Outils intégrés d'Opencode v2 et nom de leur paramètre principal. */
const EDIT_TOOLS = ['edit', 'write']; // paramètre « path »
const PATCH_TOOL = 'patch'; //           paramètre « patchText »
const SHELL_TOOL = 'shell'; //           paramètre « command »

export default {
  id: 'factory-gate',

  async setup(ctx) {
    const directory = ctx.location.directory;

    /** Chemin relatif au projet, avec des « / » (fonctionne aussi sous Windows). */
    const toRelative = (path) =>
      relative(directory, isAbsolute(path) ? path : join(directory, path)).replaceAll('\\', '/');

    /** Un fichier est gelé s'il est dans un dossier protégé ET déjà suivi par git (committé ou indexé). */
    const isFrozen = (file) =>
      PROTECTED_DIRS.some((dir) => file.startsWith(dir)) &&
      spawnSync('git', ['ls-files', '--error-unmatch', file], { cwd: directory }).status === 0;

    const frozenError = (file) =>
      new Error(
        `GATE : ${file} est un test validé (suivi par git). Les tests sont la spécification : ` +
          'ne les modifie pas. Corrige le code de production dans src/ pour les faire passer. ' +
          "Si tu penses que le test lui-même est faux, arrête-toi et explique pourquoi à l'humain.",
      );

    /** Vérifie un fichier ciblé par un outil d'écriture. */
    const checkFile = (path) => {
      const file = toRelative(path);
      if (isFrozen(file)) throw frozenError(file);
    };

    /** Lève une erreur si l'appel d'outil enfreint une règle. */
    const check = (tool, input) => {
      // 1. Écriture de fichier par les outils d'édition
      if (EDIT_TOOLS.includes(tool) && typeof input.path === 'string') {
        checkFile(input.path);
      }

      // 1 bis. Patchs multi-fichiers
      if (tool === PATCH_TOOL && typeof input.patchText === 'string') {
        for (const [, path] of input.patchText.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) {
          checkFile(path.trim());
        }
      }

      // 2. Commandes shell
      if (tool === SHELL_TOOL && typeof input.command === 'string') {
        const command = input.command;
        for (const { pattern, advice } of DANGEROUS_COMMANDS) {
          if (pattern.test(command)) throw new Error(`GATE : commande interdite (${command}). ${advice}`);
        }
        if (SHELL_WRITE.test(command)) {
          throw new Error(
            `GATE : écriture dans tests/ ou e2e/ via le shell interdite (${command}). ` +
              'Les tests sont la spécification : corrige le code de production dans src/.',
          );
        }
      }
    };

    // --- Bonus : piste d'audit dans factory.log (ignoré par git) -------------

    const targetOf = (input) => input?.path ?? input?.command ?? input?.pattern ?? '';

    const audit = (status, event) => {
      const target = String(targetOf(event.input)).replaceAll('\n', ' ').slice(0, 200);
      const line = `${new Date().toISOString()}\t${status}\t${event.agent ?? '?'}\t${event.tool}\t${target}\n`;
      try {
        appendFileSync(join(directory, 'factory.log'), line);
      } catch {
        // L'audit ne doit jamais bloquer le travail de l'agent.
      }
    };

    // --- Hooks ----------------------------------------------------------------

    await ctx.tool.hook('execute.before', (event) => {
      try {
        check(event.tool, event.input ?? {});
      } catch (error) {
        audit('BLOQUÉ', event);
        throw error;
      }
    });

    await ctx.tool.hook('execute.after', (event) => {
      audit(event.status === 'completed' ? 'OK' : 'ERREUR', event);
    });
  },
};
