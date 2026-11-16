// @ts-check
import { describe, expect, it } from 'vitest';
import { filterByName } from '../src/lib/search.js';
import { SEED_PARTICIPANTS } from '../src/data/seed.js';

/** @param {import('../src/lib/participants.js').Participant[]} list */
const names = (list) => list.map((p) => p.name);

describe('TASK-003 — filterByName', () => {
  it('retourne tous les participants si la recherche est vide', () => {
    expect(filterByName(SEED_PARTICIPANTS, '')).toHaveLength(6);
    expect(filterByName(SEED_PARTICIPANTS, '   ')).toHaveLength(6);
  });

  it('est insensible à la casse', () => {
    expect(names(filterByName(SEED_PARTICIPANTS, 'ALICE'))).toEqual(['Alice Martin']);
  });

  it('est insensible aux accents, dans les deux sens', () => {
    expect(names(filterByName(SEED_PARTICIPANTS, 'emilie'))).toEqual(['Émilie Dubois']);
    expect(names(filterByName(SEED_PARTICIPANTS, 'chloé'))).toEqual(['Chloé Favre']);
    expect(names(filterByName(SEED_PARTICIPANTS, 'chloe'))).toEqual(['Chloé Favre']);
  });

  it('cherche dans tout le nom, pas seulement au début', () => {
    expect(names(filterByName(SEED_PARTICIPANTS, 'mor'))).toEqual(['Fabien Morel']);
  });

  it('retourne une liste vide si rien ne correspond', () => {
    expect(filterByName(SEED_PARTICIPANTS, 'zzz')).toEqual([]);
  });

  it('ne modifie pas la liste reçue', () => {
    const copy = [...SEED_PARTICIPANTS];
    filterByName(copy, 'a');
    expect(copy).toEqual(SEED_PARTICIPANTS);
  });
});
