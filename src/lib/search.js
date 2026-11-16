// @ts-check

/** @typedef {import('./participants.js').Participant} Participant */

/**
 * TASK-003 — Filtre les participants dont le nom contient la recherche.
 *
 * Règles : insensible à la casse et aux accents, espaces de début/fin ignorés,
 * recherche vide = tous les participants, la liste reçue n'est jamais modifiée.
 *
 * @param {readonly Participant[]} participants
 * @param {string} query
 * @returns {Participant[]}
 */
export function filterByName(participants, query) {
  throw new Error(`TASK-003 : filterByName(${participants.length} participants, "${query}") n'est pas encore implémenté.`);
}
