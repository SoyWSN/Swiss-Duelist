import { describe, expect, it } from 'vitest';
import { computeStandings, createTournament, pairRound, roundsForPlayerCount, VERSION } from './index.js';

describe('motor (API pública)', () => {
  it('exporta la API esperada', () => {
    expect(VERSION).toBe('0.2.0');
    expect(typeof computeStandings).toBe('function');
    expect(typeof pairRound).toBe('function');
    expect(typeof roundsForPlayerCount).toBe('function');
  });

  it('createTournament crea un torneo vacío en estado draft', () => {
    const t = createTournament('t1', 'Liga OTS', 4);
    expect(t.id).toBe('t1');
    expect(t.name).toBe('Liga OTS');
    expect(t.totalRounds).toBe(4);
    expect(t.currentRound).toBe(1);
    expect(t.status).toBe('draft');
    expect(t.players).toEqual([]);
    expect(t.matches).toEqual([]);
    expect(t.finishedAt).toBeNull();
  });
});
