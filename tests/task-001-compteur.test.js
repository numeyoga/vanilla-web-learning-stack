// @ts-check
import { describe, expect, it } from 'vitest';
import { formatCount } from '../src/lib/counter.js';

describe('TASK-001 — formatCount', () => {
  it('affiche « Aucun participant » pour 0', () => {
    expect(formatCount(0)).toBe('Aucun participant');
  });

  it('accorde au singulier pour 1', () => {
    expect(formatCount(1)).toBe('1 participant');
  });

  it('accorde au pluriel au-delà de 1', () => {
    expect(formatCount(2)).toBe('2 participants');
    expect(formatCount(6)).toBe('6 participants');
  });
});
