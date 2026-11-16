// @ts-check

/** @typedef {import('../lib/participants.js').Participant} Participant */

/**
 * Participants fictifs présents au chargement de la page.
 * Les dates d'ajout sont anciennes : aucun n'est « nouveau ».
 *
 * @type {readonly Participant[]}
 */
export const SEED_PARTICIPANTS = Object.freeze([
  { id: 'seed-1', name: 'Alice Martin', role: 'Développeur', addedAt: '2026-01-12T08:30:00.000Z' },
  { id: 'seed-2', name: 'Bruno Keller', role: 'Testeur', addedAt: '2026-01-12T08:31:00.000Z' },
  { id: 'seed-3', name: 'Chloé Favre', role: 'Business analyst', addedAt: '2026-01-12T08:32:00.000Z' },
  { id: 'seed-4', name: 'David Rochat', role: 'Product owner', addedAt: '2026-01-12T08:33:00.000Z' },
  { id: 'seed-5', name: 'Émilie Dubois', role: 'Scrum master', addedAt: '2026-01-12T08:34:00.000Z' },
  { id: 'seed-6', name: 'Fabien Morel', role: 'Développeur', addedAt: '2026-01-12T08:35:00.000Z' },
]);
