import { describe, expect, it } from 'vitest';
import type { Match, Player } from './model.js';
import { computeStandings } from './standings.js';

function p(id: string): Player {
  return { id, name: id };
}

function m(id: string, round: number, table: number, p1: string, p2: string | null, outcome: Match['outcome']): Match {
  return { id, round, table, player1Id: p1, player2Id: p2, outcome };
}

function byId(standings: ReturnType<typeof computeStandings>, id: string) {
  return standings.find((s) => s.player.id === id)!;
}

describe('computeStandings', () => {
  it('puntos: victoria 3, derrota 0, bye 3', () => {
    const players = [p('A'), p('B'), p('C')];
    const matches = [m('m1', 1, 1, 'A', 'B', 'P1_WIN'), m('m2', 1, 2, 'C', null, 'BYE')];
    const s = computeStandings(players, matches);
    expect(byId(s, 'A').points).toBe(3);
    expect(byId(s, 'B').points).toBe(0);
    expect(byId(s, 'C').points).toBe(3);
    expect(byId(s, 'C').byes).toBe(1);
  });

  it('doble loss da 0 puntos a ambos y suma el contador', () => {
    const players = [p('A'), p('B')];
    const matches = [m('m1', 1, 1, 'A', 'B', 'DOUBLE_LOSS')];
    const s = computeStandings(players, matches);
    expect(byId(s, 'A').points).toBe(0);
    expect(byId(s, 'B').points).toBe(0);
    expect(byId(s, 'A').doubleLosses).toBe(1);
    expect(byId(s, 'B').doubleLosses).toBe(1);
  });

  it('ordena por puntos y desempata por OMW (caso verificado a mano)', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    const matches = [
      m('r1-1', 1, 1, 'A', 'B', 'P1_WIN'),
      m('r1-2', 1, 2, 'C', 'D', 'P1_WIN'),
      m('r2-1', 2, 1, 'A', 'C', 'P1_WIN'),
      m('r2-2', 2, 2, 'B', 'D', 'P2_WIN'), // D gana a B
    ];
    const s = computeStandings(players, matches);

    // A (6 pts) primero. C y D empatan a 3 pts: C (OMW .75) > D (OMW .4167). B (0) último.
    expect(s.map((x) => x.player.id)).toEqual(['A', 'C', 'D', 'B']);
    expect(s[1]!.omw).toBeCloseTo(0.75, 3);
    expect(s[2]!.omw).toBeCloseTo(0.4167, 3);
  });

  it('aplica el piso de 33% al OMW de oponentes sin victorias', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    const matches = [
      m('r1-1', 1, 1, 'A', 'B', 'DOUBLE_LOSS'),
      m('r1-2', 1, 2, 'C', 'D', 'P1_WIN'),
      m('r2-1', 2, 1, 'A', 'C', 'P2_WIN'), // C gana a A
      m('r2-2', 2, 2, 'B', 'D', 'P2_WIN'), // D gana a B
    ];
    const s = computeStandings(players, matches);
    // C enfrentó a D (1 victoria = 0.5) y a A (0 pts → piso 0.333).
    expect(byId(s, 'C').omw).toBeCloseTo((0.5 + 1 / 3) / 2, 4);
  });

  it('el doble loss arrastra el OMW de quienes enfrentaron a esos jugadores', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    const matches = [
      m('r1-1', 1, 1, 'A', 'B', 'DOUBLE_LOSS'),
      m('r1-2', 1, 2, 'C', 'D', 'P1_WIN'),
      m('r2-1', 2, 1, 'A', 'C', 'P2_WIN'),
      m('r2-2', 2, 2, 'B', 'D', 'P2_WIN'),
    ];
    const s = computeStandings(players, matches);
    // A y B acabaron con 0 puntos (doble loss + derrota), por eso su MWP es 0.
    expect(byId(s, 'A').points).toBe(0);
    expect(byId(s, 'B').points).toBe(0);
    // El OMW de C queda arrastrado por haber enfrentado a A (debilitado por su doble loss),
    // mientras que D enfrentó a C (6 pts) y por eso su OMW es mayor.
    expect(byId(s, 'C').omw).toBeLessThan(byId(s, 'D').omw);
  });

  it('un jugador retirado sigue en la tabla con sus resultados', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    players.find((x) => x.id === 'B')!.dropped = true;
    const matches = [
      m('r1-1', 1, 1, 'A', 'B', 'P2_WIN'), // B ganó a A antes de retirarse
      m('r1-2', 1, 2, 'C', 'D', 'P1_WIN'),
    ];
    const s = computeStandings(players, matches);
    // B sigue apareciendo con sus 3 puntos.
    expect(byId(s, 'B').points).toBe(3);
    // El OMW de A incluye a B (1 victoria = MWP 1.0).
    expect(byId(s, 'A').omw).toBe(1.0);
  });

  it('DDD = suma de los cuadrados de las rondas perdidas', () => {
    const players = [p('A'), p('B')];
    const matches = [
      m('r1', 1, 1, 'A', 'B', 'P1_WIN'), // B pierde R1
      m('r2', 2, 1, 'A', 'B', 'P1_WIN'), // B pierde R2
    ];
    const s = computeStandings(players, matches);
    expect(byId(s, 'B').ddd).toBe(1 * 1 + 2 * 2); // 5
    expect(byId(s, 'A').ddd).toBe(0);
  });

  it('DDD desempata cuando puntos, OMW% y OOMW% están iguales', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    const matches = [
      m('r1-1', 1, 1, 'A', 'B', 'P1_WIN'), // B pierde R1 → DDD 1
      m('r1-2', 1, 2, 'C', 'D', 'P1_WIN'),
      m('r2-1', 2, 1, 'A', 'C', 'P1_WIN'), // C pierde R2 → DDD 4
      m('r2-2', 2, 2, 'B', 'D', 'P1_WIN'),
    ];
    const s = computeStandings(players, matches);
    // B y C empatan en 3 pts, OMW y OOMW; el DDD decide (B 1 < C 4).
    expect(s.map((x) => x.player.id)).toEqual(['A', 'B', 'C', 'D']);
    expect(byId(s, 'B').ddd).toBe(1);
    expect(byId(s, 'C').ddd).toBe(4);
  });
});
