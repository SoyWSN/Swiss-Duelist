/**
 * Modelo de dominio de Swiss Duelist.
 *
 * Sin récord de juegos: un 2-0 y un 2-1 valen exactamente lo mismo (KDE v2.5).
 * Un partido solo tiene un `outcome` (quién ganó, o doble loss, o bye).
 */

export type MatchOutcome = 'P1_WIN' | 'P2_WIN' | 'DOUBLE_LOSS' | 'BYE';

export interface Player {
  id: string;
  name: string;
  /** Si se retiró, deja de emparejarse pero sus resultados siguen contando para el OMW de sus rivales. */
  dropped?: boolean;
}

export interface Match {
  id: string;
  round: number;
  table: number;
  player1Id: string | null;
  player2Id: string | null;
  /** `null` = todavía sin reportar. */
  outcome: MatchOutcome | null;
}

export interface Tournament {
  id: string;
  name: string;
  players: Player[];
  matches: Match[];
  /** Ronda actual (1-based). */
  currentRound: number;
  totalRounds: number;
}
