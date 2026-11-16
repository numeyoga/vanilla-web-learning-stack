// @ts-check
import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY, loadTheme, nextTheme, saveTheme } from '../src/lib/theme.js';

/**
 * Stockage en mémoire qui imite localStorage.
 * @returns {import('../src/lib/theme.js').ThemeStorage & { data: Map<string, string> }}
 */
function memoryStorage() {
  const data = new Map();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

describe('TASK-002 — nextTheme', () => {
  it('bascule entre clair et sombre', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});

describe('TASK-002 — loadTheme', () => {
  it('retourne « light » quand rien n’est mémorisé', () => {
    expect(loadTheme(memoryStorage())).toBe('light');
  });

  it('retourne le thème mémorisé', () => {
    const storage = memoryStorage();
    storage.data.set(THEME_STORAGE_KEY, 'dark');
    expect(loadTheme(storage)).toBe('dark');
  });

  it('ignore une valeur invalide', () => {
    const storage = memoryStorage();
    storage.data.set(THEME_STORAGE_KEY, 'rose');
    expect(loadTheme(storage)).toBe('light');
  });
});

describe('TASK-002 — saveTheme', () => {
  it('mémorise le thème sous la clé dédiée', () => {
    const storage = memoryStorage();
    saveTheme(storage, 'dark');
    expect(storage.data.get(THEME_STORAGE_KEY)).toBe('dark');
  });
});
