import { getDatabase } from '../database/db';
import { Project, CreateProjectInput, UpdateProjectInput } from '../types';
import { getNowIsoString } from '../utils/date';

export function validateProjectName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Project name cannot be empty.');
  }
  return trimmed;
}

export async function getActiveProjects(): Promise<Project[]> {
  const db = await getDatabase();
  return db.select<Project[]>('SELECT * FROM projects WHERE is_archived = 0 ORDER BY created_at ASC;');
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDatabase();
  return db.select<Project[]>('SELECT * FROM projects ORDER BY created_at ASC;');
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = await getDatabase();
  const rows = await db.select<Project[]>('SELECT * FROM projects WHERE id = ?;', [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const name = validateProjectName(input.name);
  const now = getNowIsoString();
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `proj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const project: Project = {
    id,
    name,
    color: input.color || null,
    is_archived: 0,
    created_at: now,
    updated_at: now,
  };

  const db = await getDatabase();
  await db.execute(
    'INSERT INTO projects (id, name, color, is_archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
    [
      project.id,
      project.name,
      project.color,
      project.is_archived,
      project.created_at,
      project.updated_at,
    ]
  );

  return project;
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) {
    throw new Error(`Project with id ${id} not found.`);
  }

  const name = input.name !== undefined ? validateProjectName(input.name) : existing.name;
  const color = input.color !== undefined ? input.color : existing.color;
  const is_archived = input.is_archived !== undefined ? input.is_archived : existing.is_archived;
  const now = getNowIsoString();

  const db = await getDatabase();
  await db.execute(
    'UPDATE projects SET name = ?, color = ?, is_archived = ?, updated_at = ? WHERE id = ?;',
    [name, color, is_archived, now, id]
  );

  return {
    ...existing,
    name,
    color,
    is_archived,
    updated_at: now,
  };
}

export async function archiveProject(id: string, archive: boolean = true): Promise<Project> {
  return updateProject(id, { is_archived: archive ? 1 : 0 });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  // Safe delete: SQLite foreign keys with ON DELETE SET NULL ensure tasks are preserved
  await db.execute('DELETE FROM projects WHERE id = ?;', [id]);
}
