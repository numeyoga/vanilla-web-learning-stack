// @ts-check

/** @typedef {'light' | 'dark'} Theme */

/** @typedef {Pick<Storage, 'getItem' | 'setItem'>} ThemeStorage */

/** Clé utilisée dans le localStorage. */
export const THEME_STORAGE_KEY = 'factory-kit:theme';

/**
 * TASK-002 — Retourne le thème suivant (bascule clair ↔ sombre).
 *
 * @param {Theme} theme
 * @returns {Theme}
 */
export function nextTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * TASK-002 — Lit le thème mémorisé. Retourne « light » si rien n'est mémorisé ou si la valeur est invalide.
 *
 * @param {ThemeStorage} storage
 * @returns {Theme}
 */
export function loadTheme(storage) {
  return storage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

/**
 * TASK-002 — Mémorise le thème choisi.
 *
 * @param {ThemeStorage} storage
 * @param {Theme} theme
 * @returns {void}
 */
export function saveTheme(storage, theme) {
  storage.setItem(THEME_STORAGE_KEY, theme);
}
