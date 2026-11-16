// @ts-check

/**
 * Rôles disponibles dans le formulaire.
 */
export const ROLES = /** @type {const} */ ([
  'Développeur',
  'Testeur',
  'Business analyst',
  'Product owner',
  'Scrum master',
]);

/** @typedef {typeof ROLES[number]} Role */

/**
 * @typedef {Object} Participant
 * @property {string} id       Identifiant unique.
 * @property {string} name     Nom affiché.
 * @property {Role} role       Rôle dans l'équipe.
 * @property {string} addedAt  Date d'ajout au format ISO 8601.
 */

/**
 * Crée un participant validé.
 *
 * @param {string} name  Nom saisi (les espaces en début et fin sont retirés).
 * @param {Role} role    Rôle choisi.
 * @param {Date} [now]   Date d'ajout (injectable pour les tests).
 * @returns {Participant}
 * @throws {Error} si le nom est vide ou si le rôle est inconnu.
 */
export function createParticipant(name, role, now = new Date()) {
  const trimmed = name.trim();
  if (trimmed === '') {
    throw new Error('Le nom est obligatoire.');
  }
  if (!ROLES.includes(role)) {
    throw new Error(`Rôle inconnu : ${role}`);
  }
  return {
    id: crypto.randomUUID(),
    name: trimmed,
    role,
    addedAt: now.toISOString(),
  };
}

/**
 * Trie les participants par nom (ordre alphabétique français), sans modifier la liste reçue.
 *
 * @param {readonly Participant[]} participants
 * @returns {Participant[]}
 */
export function sortByName(participants) {
  return [...participants].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
