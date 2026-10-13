/**
 * Esquema de la base de datos.
 *
 * Diseño: una sola tabla `tournaments` con columnas de resumen (para listar rápido)
 * más una columna `data` que guarda `players` y `matches` en JSON.
 *
 * Esto hace que guardar sea UNA escritura atómica (un solo UPSERT), ideal para el
 * autosave durante un torneo: no puede quedar un estado a medias si se corta la luz.
 */
export const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS tournaments (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    status        TEXT NOT NULL,
    current_round INTEGER NOT NULL,
    total_rounds  INTEGER NOT NULL,
    player_count  INTEGER NOT NULL,
    created_at    TEXT NOT NULL,
    finished_at   TEXT,
    data          TEXT NOT NULL
  )`,
];
