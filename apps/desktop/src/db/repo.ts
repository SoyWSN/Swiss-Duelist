import type { Match, Player, Tournament, TournamentStatus } from '@swiss-duelist/engine';
import { getDb } from './db';

interface TournamentRow {
  id: string;
  name: string;
  status: string;
  current_round: number;
  total_rounds: number;
  player_count: number;
  created_at: string;
  finished_at: string | null;
  data: string;
}

export interface TournamentSummary {
  id: string;
  name: string;
  status: TournamentStatus;
  currentRound: number;
  totalRounds: number;
  playerCount: number;
  createdAt: string;
  finishedAt: string | null;
}

interface TournamentData {
  players: Player[];
  matches: Match[];
}

function toSummary(row: TournamentRow): TournamentSummary {
  return {
    id: row.id,
    name: row.name,
    status: row.status as TournamentStatus,
    currentRound: row.current_round,
    totalRounds: row.total_rounds,
    playerCount: row.player_count,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
  };
}

/** Guarda el torneo completo (autosave). Un solo UPSERT atómico. */
export async function saveTournament(t: Tournament): Promise<void> {
  const db = await getDb();
  const data: TournamentData = { players: t.players, matches: t.matches };
  await db.execute(
    `INSERT INTO tournaments
       (id, name, status, current_round, total_rounds, player_count, created_at, finished_at, data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT(id) DO UPDATE SET
       name = $2, status = $3, current_round = $4, total_rounds = $5,
       player_count = $6, created_at = $7, finished_at = $8, data = $9`,
    [t.id, t.name, t.status, t.currentRound, t.totalRounds, t.players.length, t.createdAt, t.finishedAt, JSON.stringify(data)],
  );
}

export async function loadTournament(id: string): Promise<Tournament | null> {
  const db = await getDb();
  const rows = await db.select<TournamentRow[]>('SELECT * FROM tournaments WHERE id = $1', [id]);
  const row = rows[0];
  if (!row) return null;
  const data = JSON.parse(row.data) as TournamentData;
  return {
    id: row.id,
    name: row.name,
    status: row.status as TournamentStatus,
    currentRound: row.current_round,
    totalRounds: row.total_rounds,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
    players: data.players,
    matches: data.matches,
  };
}

export async function listTournaments(): Promise<TournamentSummary[]> {
  const db = await getDb();
  const rows = await db.select<TournamentRow[]>(
    'SELECT id, name, status, current_round, total_rounds, player_count, created_at, finished_at FROM tournaments ORDER BY created_at DESC',
  );
  return rows.map(toSummary);
}

export async function deleteTournament(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM tournaments WHERE id = $1', [id]);
}
