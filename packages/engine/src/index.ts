/**
 * Swiss Duelist — motor puro (sin UI, sin BD).
 *
 * Emparejamientos suizos, desempates oficiales (KTS) y reglas de doble loss.
 * La lógica real llega en la Fase 1; esto es el esqueleto para verificar el setup.
 */

export const VERSION = '0.1.0';

/** Resultado de una partida. Sin récord de juegos: un 2-0 y un 2-1 valen lo mismo. */
export type MatchOutcome = 'P1_WIN' | 'P2_WIN' | 'DOUBLE_LOSS' | 'BYE';

export interface Player {
  id: string;
  name: string;
}

/**
 * Desempates oficiales (Konami Tournament Software), en orden:
 * Puntos → OMW% (match-win de oponentes) → OOMW% (match-win de los oponentes de tus oponentes).
 * Nota: NO existe "game-win percentage" en Yu-Gi-Oh (eso es de Magic).
 */
export type Tiebreaker = 'POINTS' | 'OMW' | 'OOMW';

export const TIEBREAKERS: Tiebreaker[] = ['POINTS', 'OMW', 'OOMW'];
