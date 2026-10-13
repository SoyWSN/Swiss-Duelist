/**
 * Número de rondas suizas según la cantidad de jugadores.
 * Tabla de la política KDE v2.5 (eventos Tier 1-2).
 */
export function roundsForPlayerCount(playerCount: number): number {
  if (playerCount < 4) return 1;
  if (playerCount <= 8) return 3;
  if (playerCount <= 16) return 4;
  if (playerCount <= 32) return 5;
  if (playerCount <= 64) return 6;
  if (playerCount <= 128) return 7;
  if (playerCount <= 256) return 8;
  if (playerCount <= 512) return 9;
  if (playerCount <= 1024) return 10;
  if (playerCount <= 2048) return 11;
  return 12;
}
