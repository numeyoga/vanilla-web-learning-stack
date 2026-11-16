// @ts-check

/** @typedef {import('./participants.js').Participant} Participant */

/**
 * Met un texte en minuscules et retire les accents (« Émilie » → « emilie »).
 *
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

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
  const needle = normalize(query.trim());
  if (needle === '') return [...participants];
  return participants.filter((participant) => normalize(participant.name).includes(needle));
}
