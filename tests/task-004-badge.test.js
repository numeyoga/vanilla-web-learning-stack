// @ts-check
import { describe, expect, it } from 'vitest';
import { isNew } from '../src/lib/recent.js';

const now = new Date('2026-11-16T10:00:00.000Z');

describe('TASK-004 — isNew', () => {
  it('considère comme nouveau un participant ajouté à l’instant', () => {
    expect(isNew({ addedAt: '2026-11-16T10:00:00.000Z' }, now)).toBe(true);
  });

  it('considère comme nouveau un participant ajouté il y a 9 minutes', () => {
    expect(isNew({ addedAt: '2026-11-16T09:51:00.000Z' }, now)).toBe(true);
  });

  it('ne considère plus comme nouveau un participant ajouté il y a 10 minutes ou plus', () => {
    expect(isNew({ addedAt: '2026-11-16T09:50:00.000Z' }, now)).toBe(false);
    expect(isNew({ addedAt: '2026-01-12T08:30:00.000Z' }, now)).toBe(false);
  });
});
