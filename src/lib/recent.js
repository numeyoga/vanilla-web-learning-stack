// @ts-check

/** @typedef {import('./participants.js').Participant} Participant */

/** Durée pendant laquelle un participant est considéré comme « nouveau ». */
export const NEW_DURATION_MS = 10 * 60 * 1000;

/**
 * TASK-004 — Indique si un participant a été ajouté il y a moins de 10 minutes.
 *
 * @param {Pick<Participant, 'addedAt'>} participant
 * @param {Date} [now]  Date de référence (injectable pour les tests).
 * @returns {boolean}
 */
export function isNew(participant, now = new Date()) {
  const age = now.getTime() - new Date(participant.addedAt).getTime();
  return age >= 0 && age < NEW_DURATION_MS;
}
