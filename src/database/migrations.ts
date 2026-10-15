import { IDatabase } from './types';

export interface Migration {
  id: number;
  name: string;
  up: (db: IDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    id: 1,
    name: 'initial_schema',
    up: async (db: IDatabase) => {
      // Enable foreign keys
      await db.execute('PRAGMA foreign_keys = ON;');

      // Create migrations table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS _migrations (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL
        );
      `);

      // Create projects table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT,
          is_archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // Create tasks table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          project_id TEXT,
          due_date TEXT,
          is_completed INTEGER NOT NULL DEFAULT 0,
          completed_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
        );
      `);

      // Create settings table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      // Indices for efficient filtering and sorting
      await db.execute('CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);');
    },
  },
];

export async function runMigrations(db: IDatabase): Promise<void> {
  // Ensure foreign keys are enabled on every connection
  await db.execute('PRAGMA foreign_keys = ON;');

  // Ensure migrations tracking table exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = await db.select<{ id: number; name: string }[]>(
    'SELECT id, name FROM _migrations ORDER BY id ASC;'
  );
  const appliedIds = new Set(appliedRows.map((r) => r.id));

  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      await migration.up(db);
      await db.execute(
        'INSERT INTO _migrations (id, name, applied_at) VALUES (?, ?, ?);',
        [migration.id, migration.name, new Date().toISOString()]
      );
    }
  }
}
