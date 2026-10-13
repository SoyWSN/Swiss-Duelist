/**
 * Clasificación y desempates oficiales (Konami Tournament Software, KDE v2.5).
 *
 * Formato oficial del número de desempate: AABBBCCCDDD
 *   AA  = Puntos
 *   BBB = OMW%  (match-win % de tus oponentes, con piso de 33% por oponente)
 *   CCC = OOMW% (match-win % de los oponentes de tus oponentes)
 *   DDD = suma de los CUADRADOS de las rondas en que perdiste (menor = mejor)
 *
 * Orden de desempate: Puntos → OMW% → OOMW% → DDD.
 * No existe "game-win %" en Yu-Gi-Oh (eso es de Magic): un 2-0 y un 2-1 valen lo mismo.
 *
 * Supuestos (documentados, refinables según el KTS real):
 *   - matchWinPct = puntos / (3 × rondas jugadas). El bye cuenta como victoria (3 pts) y como ronda.
 *   - El piso de 33% se aplica a cada oponente antes de promediar.
 *   - Los byes no aportan oponente (se excluyen del promedio de OMW/OOMW) ni cuentan como derrota.
 */

import type { Match, Player } from './model';

export const WIN_POINTS = 3;
export const OMW_FLOOR = 1 / 3;

export interface Standing {
  player: Player;
  points: number;
  wins: number;
  losses: number;
  doubleLosses: number;
  byes: number;
  roundsPlayed: number;
  /** Puntos / (3 × rondas jugadas), 0 si no ha jugado. */
  matchWinPct: number;
  /** Opponents' Match-Win %, con piso de 33%. */
  omw: number;
  /** Opponents' Opponents' Match-Win %. */
  oomw: number;
  /** Suma de los cuadrados de las rondas perdidas (menor = mejor). */
  ddd: number;
  /** Posición (1-based) según el orden de desempate. */
  rank: number;
}

interface Stats {
  points: number;
  wins: number;
  losses: number;
  doubleLosses: number;
  byes: number;
  roundsPlayed: number;
  opponents: string[];
  lostRounds: number[];
}

function collectStats(playerId: string, matches: Match[]): Stats {
  const s: Stats = {
    points: 0,
    wins: 0,
    losses: 0,
    doubleLosses: 0,
    byes: 0,
    roundsPlayed: 0,
    opponents: [],
    lostRounds: [],
  };
  for (const m of matches) {
    if (m.outcome === null) continue;

    if (m.outcome === 'BYE') {
      if (m.player1Id === playerId) {
        s.byes += 1;
        s.roundsPlayed += 1;
        s.points += WIN_POINTS;
      }
      continue;
    }

    const isP1 = m.player1Id === playerId;
    const isP2 = m.player2Id === playerId;
    if (!isP1 && !isP2) continue;

    const opponentId = isP1 ? m.player2Id : m.player1Id;
    s.roundsPlayed += 1;
    if (opponentId !== null) s.opponents.push(opponentId);

    if (m.outcome === 'P1_WIN') {
      if (isP1) { s.wins += 1; s.points += WIN_POINTS; } else { s.losses += 1; s.lostRounds.push(m.round); }
    } else if (m.outcome === 'P2_WIN') {
      if (isP2) { s.wins += 1; s.points += WIN_POINTS; } else { s.losses += 1; s.lostRounds.push(m.round); }
    } else if (m.outcome === 'DOUBLE_LOSS') {
      s.doubleLosses += 1;
      s.lostRounds.push(m.round);
    }
  }
  return s;
}

function meanOr(values: number[], fallback: number): number {
  if (values.length === 0) return fallback;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeStandings(players: Player[], matches: Match[]): Standing[] {
  const stats = new Map<string, Stats>();
  for (const p of players) stats.set(p.id, collectStats(p.id, matches));

  // Match-win % de cada jugador.
  const mwp = new Map<string, number>();
  for (const [id, s] of stats) {
    mwp.set(id, s.roundsPlayed === 0 ? 0 : s.points / (WIN_POINTS * s.roundsPlayed));
  }

  // OMW% (con piso de 33% por oponente).
  const omw = new Map<string, number>();
  for (const [id, s] of stats) {
    omw.set(id, meanOr(s.opponents.map((o) => Math.max(OMW_FLOOR, mwp.get(o) ?? 0)), 0));
  }

  // OOMW% (media del OMW% de los oponentes).
  const oomw = new Map<string, number>();
  for (const [id, s] of stats) {
    oomw.set(id, meanOr(s.opponents.map((o) => omw.get(o) ?? 0), 0));
  }

  const standings: Standing[] = players.map((p) => {
    const s = stats.get(p.id)!;
    return {
      player: p,
      points: s.points,
      wins: s.wins,
      losses: s.losses,
      doubleLosses: s.doubleLosses,
      byes: s.byes,
      roundsPlayed: s.roundsPlayed,
      matchWinPct: mwp.get(p.id)!,
      omw: omw.get(p.id)!,
      oomw: oomw.get(p.id)!,
      ddd: s.lostRounds.reduce((sum, r) => sum + r * r, 0),
      rank: 0,
    };
  });

  standings.sort(
    (a, b) =>
      b.points - a.points ||
      b.omw - a.omw ||
      b.oomw - a.oomw ||
      a.ddd - b.ddd ||
      a.player.name.localeCompare(b.player.name),
  );

  standings.forEach((s, i) => { s.rank = i + 1; });
  return standings;
}
