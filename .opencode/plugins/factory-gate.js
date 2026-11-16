// Station 2 — Garde-fous programmatiques (hooks Opencode).
// Station 4 — + protection du backlog : l'état des tâches ne change que via scripts/task.mjs.
//
// Chargé automatiquement par Opencode depuis .opencode/plugins/.
// Lever une erreur dans « tool.execute.before » bloque l'appel d'outil ;
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

/** Station 4 — l'état des tâches ne se modifie que via scripts/task.mjs. */
const BACKLOG_DIR = 'backlog/';

/** Écriture via le shell vers un dossier protégé : redirection, tee, sed -i, mv, cp, rm, truncate. */
const SHELL_WRITE = /(>|\btee\b|\bsed\s+-i|\bmv\b|\bcp\b|\brm\b|\btruncate\b)[^|;&]*?\b(tests|e2e)\//;
const SHELL_WRITE_BACKLOG = /(>|\btee\b|\bsed\s+-i|\bmv\b|\bcp\b|\brm\b|\btruncate\b)[^|;&]*?\bbacklog\//;

/** Noms d'outils (ils varient selon les versions d'Opencode et les modèles). */
const EDIT_TOOLS = ['edit', 'write', 'multiedit'];
const SHELL_TOOLS = ['bash', 'shell'];

export const FactoryGate = async ({ directory }) => {
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

  const backlogError = (target) =>
    new Error(
      `GATE : modification directe du backlog interdite (${target}). L'état d'une tâche se change uniquement avec ` +
        'node scripts/task.mjs (move pour le statut, log pour le journal). Exemple : node scripts/task.mjs move TASK-002 review',
    );

  /** Vérifie un fichier ciblé par un outil d'édition. */
  const checkFile = (path) => {
    const file = toRelative(path);
    if (file.startsWith(BACKLOG_DIR)) throw backlogError(file);
    if (isFrozen(file)) throw frozenError(file);
  };

  /** Lève une erreur si l'appel d'outil enfreint une règle. */
  const check = (tool, args) => {
    // 1. Écriture de fichier par les outils d'édition
    if (EDIT_TOOLS.includes(tool) && typeof args.filePath === 'string') {
      checkFile(args.filePath);
    }

    // 1 bis. Patchs multi-fichiers (outil apply_patch utilisé par certains modèles)
    if (tool === 'apply_patch' && typeof args.patchText === 'string') {
      for (const [, path] of args.patchText.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) {
        checkFile(path.trim());
      }
    }

    // 2. Commandes shell
    if (SHELL_TOOLS.includes(tool) && typeof args.command === 'string') {
      const command = args.command;
      for (const { pattern, advice } of DANGEROUS_COMMANDS) {
        if (pattern.test(command)) throw new Error(`GATE : commande interdite (${command}). ${advice}`);
      }
      if (SHELL_WRITE.test(command)) {
        throw new Error(
          `GATE : écriture dans tests/ ou e2e/ via le shell interdite (${command}). ` +
            'Les tests sont la spécification : corrige le code de production dans src/.',
        );
      }
      if (SHELL_WRITE_BACKLOG.test(command)) throw backlogError(command);
    }
  };

  // --- Bonus : piste d'audit dans factory.log (ignoré par git) ---------------

  const audit = (status, tool, target) => {
    const line = `${new Date().toISOString()}\t${status}\t${tool}\t${String(target).replaceAll('\n', ' ').slice(0, 200)}\n`;
    try {
      appendFileSync(join(directory, 'factory.log'), line);
    } catch {
      // L'audit ne doit jamais bloquer le travail de l'agent.
    }
  };

  /** Cible de chaque appel en cours, mémorisée avant exécution (callID → fichier ou commande). */
  const pending = new Map();

  return {
    'tool.execute.before': async (input, output) => {
      const args = output.args ?? {};
      const target = args.filePath ?? args.command ?? args.pattern ?? '';
      try {
        check(input.tool, args);
      } catch (error) {
        audit('BLOQUÉ', input.tool, target);
        throw error;
      }
      pending.set(input.callID, target);
    },

    'tool.execute.after': async (input) => {
      audit('OK', input.tool, pending.get(input.callID) ?? '');
      pending.delete(input.callID);
    },
  };
};
