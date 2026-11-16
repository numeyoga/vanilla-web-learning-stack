// @ts-check
import { describe, expect, it } from 'vitest';
import { createParticipant, sortByName } from '../src/lib/participants.js';

describe('createParticipant', () => {
  it('crée un participant avec un nom nettoyé et une date ISO', () => {
    const now = new Date('2026-11-16T10:00:00.000Z');
    const participant = createParticipant('  Alice  ', 'Développeur', now);

    expect(participant.name).toBe('Alice');
    expect(participant.role).toBe('Développeur');
    expect(participant.addedAt).toBe('2026-11-16T10:00:00.000Z');
    expect(participant.id).toEqual(expect.any(String));
  });

  it('refuse un nom vide', () => {
    expect(() => createParticipant('   ', 'Testeur')).toThrow('Le nom est obligatoire.');
  });

  it('refuse un rôle inconnu', () => {
    // @ts-expect-error : rôle volontairement invalide
    expect(() => createParticipant('Bob', 'Astronaute')).toThrow('Rôle inconnu');
  });
});

describe('sortByName', () => {
  it('trie selon l’ordre alphabétique français sans modifier la liste d’origine', () => {
    const list = [
      createParticipant('Zoé', 'Testeur'),
      createParticipant('Émilie', 'Testeur'),
      createParticipant('Bruno', 'Testeur'),
    ];
    const sorted = sortByName(list);

    expect(sorted.map((p) => p.name)).toEqual(['Bruno', 'Émilie', 'Zoé']);
    expect(list.map((p) => p.name)).toEqual(['Zoé', 'Émilie', 'Bruno']);
  });
});
