import { getDatabase } from '../database/db';
import { ThemeMode } from '../types';

export const THEME_KEY = 'theme_preference';

export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  try {
    const db = await getDatabase();
    const rows = await db.select<{ key: string; value: string }[]>(
      'SELECT value FROM settings WHERE key = ?;',
      [key]
    );
    if (rows.length > 0 && rows[0].value !== undefined) {
      return rows[0].value;
    }
  } catch (err) {
    console.error(`Error reading setting ${key}:`, err);
  }
  return defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [key, value]
  );
}

export async function getThemeSetting(): Promise<ThemeMode> {
  const val = await getSetting(THEME_KEY, 'system');
  if (val === 'light' || val === 'dark' || val === 'system') {
    return val;
  }
  return 'system';
}

export async function setThemeSetting(theme: ThemeMode): Promise<void> {
  await setSetting(THEME_KEY, theme);
}
