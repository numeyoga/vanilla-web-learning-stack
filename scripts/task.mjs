#!/usr/bin/env node
// @ts-check
/**
 * Machine à états des tâches du backlog (station 4).
 *
 * Seul point d'entrée autorisé pour modifier l'état d'une tâche :
 *   node scripts/task.mjs list
 *   node scripts/task.mjs show TASK-002
 *   node scripts/task.mjs move TASK-002 in-progress
 *   node scripts/task.mjs log  TASK-002 "Implémentation de nextTheme terminée"
 *
 * Règles appliquées :
 *   - transitions autorisées : todo → in-progress → review → done (retour review → in-progress possible) ;
 *   - passage à « done » refusé tant que la vérification de types et les tests de la tâche ne passent pas ;
 *   - chaque changement est horodaté dans la section « ## Journal » de la tâche.
 *
 * Les messages d'erreur sont rédigés pour être lus par un agent : ils disent quoi faire ensuite.
 * Variable d'environnement : TASK_GATE_SKIP_E2E=1 pour ne lancer que les tests unitaires au passage à « done ».
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BACKLOG_DIR = join(ROOT, 'backlog');

/** @typedef {'todo' | 'in-progress' | 'review' | 'done'} Status */

/** @type {Record<Status, Status[]>} */
const TRANSITIONS = {
  todo: ['in-progress'],
  'in-progress': ['review', 'todo'],
  review: ['done', 'in-progress'],
  done: [],
};

const STATUSES = /** @type {Status[]} */ (Object.keys(TRANSITIONS));

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {Status} status
 * @property {string} path
 * @property {string} content  Contenu normalisé avec des fins de ligne « \n ».
 * @property {'\n' | '\r\n'} eol  Fins de ligne d'origine du fichier (CRLF possible sous Windows).
 */

/** Erreur « métier » : message destiné à l'agent, sortie en code 1. */
class Refusal extends Error {}

/**
 * @param {string | undefined} id
 * @returns {string}
 */
function requireId(id) {
  if (!id || !/^TASK-\d{3}$/.test(id)) {
    throw new Refusal(
      `Identifiant de tâche invalide : « ${id ?? ''} ».\n` +
        'Que faire : utiliser le format TASK-XXX (ex. TASK-002). Liste des tâches : node scripts/task.mjs list',
    );
  }
  return id;
}

/**
 * @param {string} id
 * @returns {Task}
 */
function loadTask(id) {
  const path = join(BACKLOG_DIR, `${id}.md`);
  if (!existsSync(path)) {
    throw new Refusal(`La tâche ${id} n'existe pas.\nQue faire : node scripts/task.mjs list`);
  }
  // Sous Windows, git peut extraire les fichiers en CRLF : on travaille en « \n » et on restaure à l'écriture.
  const raw = readFileSync(path, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const content = raw.replace(/^﻿/, '').replaceAll('\r\n', '\n');
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!frontmatter) {
    throw new Refusal(`L'en-tête (frontmatter) de ${id} est absent ou cassé. Restaurer le fichier avec git.`);
  }
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of frontmatter[1].split('\n')) {
    const match = /^(\w+):\s*(.*)$/.exec(line);
    if (match) fields[match[1]] = match[2].trim();
  }
  const status = /** @type {Status} */ (fields.status);
  if (!STATUSES.includes(status)) {
    throw new Refusal(
      `Statut inconnu « ${fields.status} » dans ${id}. Statuts valides : ${STATUSES.join(', ')}.\n` +
        'Que faire : restaurer le fichier avec git ; ne jamais modifier le statut à la main.',
    );
  }
  return { id, title: fields.title ?? '', status, path, content, eol };
}

/**
 * Enregistre la tâche en conservant ses fins de ligne d'origine.
 *
 * @param {Task} task
 * @param {string} content  Nouveau contenu, avec des fins de ligne « \n ».
 */
function saveTask(task, content) {
  writeFileSync(task.path, task.eol === '\r\n' ? content.replaceAll('\n', '\r\n') : content);
}

/**
 * Ajoute une ligne horodatée à la fin de la section Journal.
 *
 * @param {string} content
 * @param {string} message
 * @returns {string}
 */
function appendJournal(content, message) {
  const line = `- ${new Date().toISOString()} — ${message}`;
  const withSection = content.includes('\n## Journal') ? content : `${content.trimEnd()}\n\n## Journal\n`;
  return `${withSection.trimEnd()}\n${line}\n`;
}

/**
 * Fichiers de test rattachés à une tâche (convention : préfixe « task-XXX- »).
 *
 * @param {string} id
 * @returns {{ unit: string[], e2e: string[] }}
 */
function testFilesFor(id) {
  const prefix = `${id.toLowerCase()}-`;
  /** @param {string} dir @param {string} suffix */
  const find = (dir, suffix) =>
    existsSync(join(ROOT, dir))
      ? readdirSync(join(ROOT, dir))
          .filter((file) => file.startsWith(prefix) && file.endsWith(suffix))
          .map((file) => `${dir}/${file}`)
      : [];
  return { unit: find('tests', '.test.js'), e2e: find('e2e', '.spec.js') };
}

/**
 * @param {string} label
 * @param {string[]} args  Arguments passés à npx.
 * @returns {{ ok: boolean, output: string }}
 */
function run(label, args) {
  process.stdout.write(`  • ${label} … `);
  const result = spawnSync('npx', args, { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' });
  const ok = result.status === 0;
  process.stdout.write(ok ? 'OK\n' : 'ÉCHEC\n');
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  return { ok, output };
}

/**
 * Quality gate exécutée avant le passage à « done ».
 *
 * @param {string} id
 */
function gate(id) {
  const { unit, e2e } = testFilesFor(id);
  if (unit.length === 0 && e2e.length === 0) {
    throw new Refusal(
      `Aucun test trouvé pour ${id} (attendu : tests/${id.toLowerCase()}-*.test.js ou e2e/${id.toLowerCase()}-*.spec.js).\n` +
        'Que faire : faire écrire les tests par l\'agent testeur avant de terminer la tâche.',
    );
  }
  console.log(`Quality gate pour ${id} :`);
  const steps = [run('vérification des types', ['tsc', '-p', 'jsconfig.json'])];
  if (unit.length > 0) steps.push(run(`tests unitaires (${unit.length})`, ['vitest', 'run', ...unit]));
  if (e2e.length > 0 && process.env.TASK_GATE_SKIP_E2E !== '1') {
    steps.push(run(`tests e2e (${e2e.length})`, ['playwright', 'test', ...e2e]));
  }
  const failed = steps.find((step) => !step.ok);
  if (failed) {
    const tail = failed.output.trim().split('\n').slice(-40).join('\n');
    throw new Refusal(
      `Passage à « done » refusé : la quality gate de ${id} échoue.\n\n${tail}\n\n` +
        `Que faire : corriger le code de production (pas les tests), puis relancer : node scripts/task.mjs move ${id} done`,
    );
  }
}

/** @param {string[]} argv */
function main(argv) {
  const [command, rawId, ...rest] = argv;

  switch (command) {
    case 'list': {
      const files = readdirSync(BACKLOG_DIR).filter((file) => /^TASK-\d{3}\.md$/.test(file)).sort();
      for (const file of files) {
        const task = loadTask(file.replace('.md', ''));
        console.log(`${task.id}  ${task.status.padEnd(11)}  ${task.title}`);
      }
      return;
    }

    case 'show': {
      console.log(loadTask(requireId(rawId)).content);
      return;
    }

    case 'move': {
      const task = loadTask(requireId(rawId));
      const target = /** @type {Status} */ (rest[0]);
      if (!STATUSES.includes(target)) {
        throw new Refusal(`Statut cible inconnu « ${rest[0] ?? ''} ». Statuts valides : ${STATUSES.join(', ')}.`);
      }
      const allowed = TRANSITIONS[task.status];
      if (!allowed.includes(target)) {
        throw new Refusal(
          `Transition refusée : ${task.id} est « ${task.status} », passage direct à « ${target} » interdit.\n` +
            `Que faire : depuis « ${task.status} », transitions possibles : ${allowed.join(', ') || 'aucune (tâche terminée)'}.`,
        );
      }
      if (target === 'done') gate(task.id);
      const updated = appendJournal(
        task.content.replace(/^status:.*$/m, `status: ${target}`),
        `statut : ${task.status} → ${target}`,
      );
      saveTask(task, updated);
      console.log(`${task.id} : ${task.status} → ${target}`);
      return;
    }

    case 'log': {
      const task = loadTask(requireId(rawId));
      const message = rest.join(' ').trim();
      if (!message) throw new Refusal('Message de journal vide. Usage : node scripts/task.mjs log TASK-XXX "message"');
      saveTask(task, appendJournal(task.content, message));
      console.log(`${task.id} : journal mis à jour`);
      return;
    }

    default:
      console.log(
        [
          'Usage :',
          '  node scripts/task.mjs list',
          '  node scripts/task.mjs show TASK-XXX',
          '  node scripts/task.mjs move TASK-XXX <todo|in-progress|review|done>',
          '  node scripts/task.mjs log  TASK-XXX "message"',
        ].join('\n'),
      );
      if (command) process.exitCode = 1;
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  if (error instanceof Refusal) {
    console.error(`REFUS — ${error.message}`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
