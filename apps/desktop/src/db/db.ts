import Database from '@tauri-apps/plugin-sql';
import { SCHEMA } from './schema';

const DB_URL = 'sqlite:swiss-duelist.db';

let dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load(DB_URL);
  }
  return dbPromise;
}

/** Crea las tablas si no existen. Llamar una vez al iniciar la app. */
export async function initDb(): Promise<void> {
  const db = await getDb();
  for (const sql of SCHEMA) {
    await db.execute(sql);
  }
}
