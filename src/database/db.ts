import { IDatabase, QueryResult } from './types';
import { runMigrations } from './migrations';
import { InMemoryDatabase } from './inMemoryDb';

let dbInstance: IDatabase | null = null;
let initPromise: Promise<IDatabase> | null = null;

// Allow tests to inject an isolated in-memory database
export function setDatabaseInstance(db: IDatabase | null): void {
  dbInstance = db;
  initPromise = null;
}

export async function getDatabase(): Promise<IDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Check if running inside Tauri environment
      const isTauri =
        typeof window !== 'undefined' &&
        ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

      if (isTauri) {
        // Dynamically import Tauri SQL plugin
        const DatabaseModule = await import('@tauri-apps/plugin-sql');
        const Database = DatabaseModule.default || DatabaseModule;
        const nativeDb = await Database.load('sqlite:daymark.db');

        const wrappedDb: IDatabase = {
          execute: async (query: string, bindValues: any[] = []): Promise<QueryResult> => {
            const res = await nativeDb.execute(query, bindValues);
            return {
              rowsAffected: res.rowsAffected,
              lastInsertId: res.lastInsertId,
            };
          },
          select: async <T = any>(query: string, bindValues: any[] = []): Promise<T> => {
            return (await nativeDb.select(query, bindValues)) as T;
          },
          close: async () => {
            await nativeDb.close();
          },
        };

        await runMigrations(wrappedDb);
        dbInstance = wrappedDb;
        return wrappedDb;
      } else {
        // Running in browser dev or vitest environment
        const memDb = new InMemoryDatabase();
        await runMigrations(memDb);
        dbInstance = memDb;
        return memDb;
      }
    } catch (err) {
      console.error('Failed to initialize database:', err);
      // Fallback to in-memory to prevent complete crash
      const fallbackDb = new InMemoryDatabase();
      await runMigrations(fallbackDb);
      dbInstance = fallbackDb;
      return fallbackDb;
    }
  })();

  return initPromise;
}
