import { describe, expect, it } from 'vitest';
import type { Match, Player } from './model.js';
import { pairRound } from './pairing.js';

function p(id: string): Player {
  return { id, name: id };
}

function m(id: string, round: number, table: number, p1: string, p2: string | null, outcome: Match['outcome']): Match {
  return { id, round, table, player1Id: p1, player2Id: p2, outcome };
}

function key(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

describe('pairRound', () => {
  it('empareja a todos sin bye cuando el total es par', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    const r = pairRound(players, [], 1);
    expect(r.matches).toHaveLength(2);
    expect(r.bye).toBeNull();
    const ids = r.matches.flatMap((x) => [x.player1Id, x.player2Id]).sort();
    expect(ids).toEqual(['A', 'B', 'C', 'D']);
  });

  it('asigna bye al de menor ranking cuando el total es impar', () => {
    const players = [p('A'), p('B'), p('C'), p('D'), p('E')];
    const r = pairRound(players, [], 1);
    expect(r.bye).toBe('E'); // todos 0 pts → último alfabético
    expect(r.matches).toHaveLength(2);
  });

  it('no repite el bye en rondas siguientes', () => {
    const players = [p('A'), p('B'), p('C'), p('D'), p('E')];
    const r1 = pairRound(players, [], 1);
    expect(r1.bye).toBe('E');

    const past = r1.matches
      .map((pr, i) => m(`r1-${i}`, 1, i + 1, pr.player1Id, pr.player2Id, 'P1_WIN'))
      .concat(m('r1-bye', 1, 0, 'E', null, 'BYE'));

    const r2 = pairRound(players, past, 2);
    expect(r2.bye).not.toBe('E');
  });

  it('evita revanchas entre rondas', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    const r1 = pairRound(players, [], 1);
    const past = r1.matches.map((pr, i) => m(`r1-${i}`, 1, i + 1, pr.player1Id, pr.player2Id, 'P1_WIN'));

    const r2 = pairRound(players, past, 2);
    const r1Keys = new Set(r1.matches.map((x) => key(x.player1Id, x.player2Id)));
    for (const pr of r2.matches) {
      expect(r1Keys.has(key(pr.player1Id, pr.player2Id))).toBe(false);
    }
  });

  it('empareja por grupo de puntos (ganadores vs ganadores)', () => {
    const players = [p('A'), p('B'), p('C'), p('D'), p('E'), p('F'), p('G'), p('H')];
    const r1 = pairRound(players, [], 1);
    // Todos los P1 ganan: 4 con 3 pts, 4 con 0 pts.
    const past = r1.matches.map((pr, i) => m(`r1-${i}`, 1, i + 1, pr.player1Id, pr.player2Id, 'P1_WIN'));
    const winners = new Set(r1.matches.map((x) => x.player1Id));

    const r2 = pairRound(players, past, 2);
    for (const pr of r2.matches) {
      const aWon = winners.has(pr.player1Id);
      const bWon = winners.has(pr.player2Id);
      expect(aWon).toBe(bWon);
    }
  });

  it('excluye a los jugadores retirados del emparejamiento', () => {
    const players = [p('A'), p('B'), p('C'), p('D')];
    players.find((x) => x.id === 'D')!.dropped = true;
    const r = pairRound(players, [], 1);
    expect(r.matches).toHaveLength(1);
    expect(r.bye).toBe('C'); // 3 activos → bye al menor de los activos
    const paired = new Set(r.matches.flatMap((x) => [x.player1Id, x.player2Id]));
    expect(paired.has('D')).toBe(false);
  });
});
