/**
 * Emparejamiento suizo.
 *
 * Algoritmo: agrupa por puntos, empareja "fold" (mitad superior vs mitad inferior)
 * dentro de cada grupo, evita revanchas (con backtracking), y "flota" al jugador
 * sobrante de un grupo impar al grupo siguiente. Si el total de activos es impar,
 * el bye se asigna al de menor ranking que aún no lo haya recibido.
 *
 * Determinista y testeable. Si el backtracking estricto no encuentra pareja sin
 * revancha (caso patológico), cae en un emparejamiento voraz como último recurso.
 */

import type { Match, Player } from './model';
import { computeStandings } from './standings';

export interface Pairing {
  player1Id: string;
  player2Id: string;
}

export interface RoundPairing {
  matches: Pairing[];
  /** Id del jugador que recibe el bye, o `null` si el total es par. */
  bye: string | null;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function buildRematchSet(matches: Match[]): Set<string> {
  const set = new Set<string>();
  for (const m of matches) {
    if (m.player1Id && m.player2Id) set.add(pairKey(m.player1Id, m.player2Id));
  }
  return set;
}

/** Empareja un grupo (par) con backtracking, evitando revanchas. Devuelve `null` si es imposible. */
function pairGroup(group: string[], played: Set<string>): Pairing[] | null {
  const n = group.length;
  if (n === 0) return [];

  const used = new Array<boolean>(n).fill(false);
  const pairs: Pairing[] = [];

  function backtrack(): boolean {
    const first = used.indexOf(false);
    if (first === -1) return true;
    used[first] = true;

    // Orden de preferencia: primero el compañero "fold", luego el resto.
    const candidates: number[] = [];
    const fold = first + n / 2;
    if (fold < n && used[fold] === false) candidates.push(fold);
    for (let i = first + 1; i < n; i++) {
      if (used[i] === false && i !== fold) candidates.push(i);
    }

    for (const other of candidates) {
      if (played.has(pairKey(group[first]!, group[other]!))) continue;
      used[other] = true;
      pairs.push({ player1Id: group[first]!, player2Id: group[other]! });
      if (backtrack()) return true;
      pairs.pop();
      used[other] = false;
    }

    used[first] = false;
    return false;
  }

  return backtrack() ? pairs : null;
}

/** Emparejamiento voraz como último recurso (puede permitir revanchas). */
function pairGreedy(group: string[], played: Set<string>): Pairing[] {
  const remaining = [...group];
  const pairs: Pairing[] = [];
  while (remaining.length >= 2) {
    const first = remaining.shift()!;
    let idx = remaining.findIndex((o) => !played.has(pairKey(first, o)));
    if (idx === -1) idx = 0;
    const other = remaining.splice(idx, 1)[0]!;
    pairs.push({ player1Id: first, player2Id: other });
  }
  return pairs;
}

export function pairRound(players: Player[], matches: Match[], roundNumber: number): RoundPairing {
  void roundNumber; // reservado (p. ej. sembrado aleatorio en ronda 1)

  const active = players.filter((p) => !p.dropped);
  const standings = computeStandings(players, matches);
  const rankMap = new Map(standings.map((s) => [s.player.id, s]));

  const ordered = active
    .slice()
    .sort((a, b) => {
      const sa = rankMap.get(a.id)!;
      const sb = rankMap.get(b.id)!;
      return (
        sb.points - sa.points ||
        sb.omw - sa.omw ||
        sb.oomw - sa.oomw ||
        a.name.localeCompare(b.name)
      );
    });

  const played = buildRematchSet(matches);
  let pool = ordered.map((p) => p.id);

  // Bye si el total de activos es impar.
  let bye: string | null = null;
  if (pool.length % 2 === 1) {
    const hadBye = new Set(
      matches.filter((m) => m.outcome === 'BYE' && m.player1Id).map((m) => m.player1Id!),
    );
    const lowest = pool[pool.length - 1]!;
    bye = [...pool].reverse().find((id) => !hadBye.has(id)) ?? lowest;
    pool = pool.filter((id) => id !== bye);
  }

  // Agrupar por puntos (manteniendo el orden de clasificación).
  const groups: string[][] = [];
  for (const id of pool) {
    const pts = rankMap.get(id)!.points;
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || rankMap.get(lastGroup[0]!)!.points !== pts) {
      groups.push([id]);
    } else {
      lastGroup.push(id);
    }
  }

  // Procesar grupos de arriba hacia abajo, flotando al sobrante.
  const result: Pairing[] = [];
  let carry: string | null = null;
  for (const group of groups) {
    let current: string[];
    if (carry !== null) {
      current = [carry, ...group];
      carry = null;
    } else {
      current = [...group];
    }
    if (current.length % 2 === 1) {
      carry = current.pop() ?? null;
    }
    const pairs = pairGroup(current, played) ?? pairGreedy(current, played);
    result.push(...pairs);
  }

  // Seguridad: con total par no debería quedar carry. Si ocurre, lo asignamos como bye.
  if (carry !== null && bye === null) {
    bye = carry;
  }

  return { matches: result, bye };
}
