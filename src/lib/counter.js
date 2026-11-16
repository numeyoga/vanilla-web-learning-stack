// @ts-check

/**
 * TASK-001 — Formate le nombre de participants pour l'en-tête.
 *
 * Exemples attendus : 0 → « Aucun participant », 1 → « 1 participant », 6 → « 6 participants ».
 *
 * @param {number} count  Nombre de participants (entier positif ou nul).
 * @returns {string}
 */
export function formatCount(count) {
  if (count === 0) return 'Aucun participant';
  return `${count} participant${count > 1 ? 's' : ''}`;
}
