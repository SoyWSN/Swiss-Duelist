import { describe, expect, it } from 'vitest';
import { roundsForPlayerCount } from './rounds.js';

describe('roundsForPlayerCount', () => {
  it('sigue la tabla KDE v2.5 (Tier 1-2)', () => {
    expect(roundsForPlayerCount(4)).toBe(3);
    expect(roundsForPlayerCount(8)).toBe(3);
    expect(roundsForPlayerCount(9)).toBe(4);
    expect(roundsForPlayerCount(16)).toBe(4);
    expect(roundsForPlayerCount(17)).toBe(5);
    expect(roundsForPlayerCount(32)).toBe(5);
    expect(roundsForPlayerCount(33)).toBe(6);
    expect(roundsForPlayerCount(64)).toBe(6);
    expect(roundsForPlayerCount(65)).toBe(7);
    expect(roundsForPlayerCount(128)).toBe(7);
    expect(roundsForPlayerCount(129)).toBe(8);
    expect(roundsForPlayerCount(256)).toBe(8);
  });

  it('grupos muy pequeños', () => {
    expect(roundsForPlayerCount(2)).toBe(1);
    expect(roundsForPlayerCount(3)).toBe(1);
  });
});
