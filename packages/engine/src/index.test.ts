import { describe, expect, it } from 'vitest';
import { computeStandings, pairRound, roundsForPlayerCount, VERSION } from './index.js';

describe('motor (API pública)', () => {
  it('exporta la API esperada', () => {
    expect(VERSION).toBe('0.2.0');
    expect(typeof computeStandings).toBe('function');
    expect(typeof pairRound).toBe('function');
    expect(typeof roundsForPlayerCount).toBe('function');
  });
});
