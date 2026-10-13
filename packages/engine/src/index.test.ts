import { describe, expect, it } from 'vitest';
import { TIEBREAKERS, VERSION } from './index.js';

describe('engine (esqueleto)', () => {
  it('expone la versión', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('define el orden de desempates KTS (sin game-win %)', () => {
    expect(TIEBREAKERS).toEqual(['POINTS', 'OMW', 'OOMW']);
  });
});
