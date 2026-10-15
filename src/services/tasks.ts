import { getDatabase } from '../database/db';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { getNowIsoString } from '../utils/date';

export function validateTaskTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('Task title cannot be empty.');
  }
  return trimmed;
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return db.select<Task[]>('SELECT * FROM tasks ORDER BY created_at DESC;');
}

export async function getIncompleteTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return db.select<Task[]>('SELECT * FROM tasks WHERE is_completed = 0;');
}

export async function getCompletedTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return db.select<Task[]>('SELECT * FROM tasks WHERE is_completed = 1 ORDER BY completed_at DESC;');
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const db = await getDatabase();
  return db.select<Task[]>('SELECT * FROM tasks WHERE project_id = ?;', [projectId]);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = await getDatabase();
  const rows = await db.select<Task[]>('SELECT * FROM tasks WHERE id = ?;', [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const title = validateTaskTitle(input.title);
  const now = getNowIsoString();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const task: Task = {
    id,
    title,
    description: input.description?.trim() || null,
    project_id: input.project_id || null,
    due_date: input.due_date || null,
    is_completed: 0,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  const db = await getDatabase();
  await db.execute(
    `INSERT INTO tasks (
      id, title, description, project_id, due_date, is_completed, completed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      task.id,
      task.title,
      task.description,
      task.project_id,
      task.due_date,
      task.is_completed,
      task.completed_at,
      task.created_at,
      task.updated_at,
    ]
  );

  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const existing = await getTaskById(id);
  if (!existing) {
    throw new Error(`Task with id ${id} not found.`);
  }

  const title = input.title !== undefined ? validateTaskTitle(input.title) : existing.title;
  const description =
    input.description !== undefined ? (input.description?.trim() ? input.description.trim() : null) : existing.description;
  const project_id = input.project_id !== undefined ? input.project_id : existing.project_id;
  const due_date = input.due_date !== undefined ? input.due_date : existing.due_date;
  
  let is_completed = existing.is_completed;
  let completed_at = existing.completed_at;

  if (input.is_completed !== undefined) {
    is_completed = input.is_completed;
    if (is_completed === 1) {
      completed_at = input.completed_at || getNowIsoString();
    } else {
      completed_at = null;
    }
  }

  const now = getNowIsoString();

  const db = await getDatabase();
  await db.execute(
    `UPDATE tasks SET
      title = ?,
      description = ?,
      project_id = ?,
      due_date = ?,
      is_completed = ?,
      completed_at = ?,
      updated_at = ?
    WHERE id = ?;`,
    [
      title,
      description,
      project_id,
      due_date,
      is_completed,
      completed_at,
      now,
      id,
    ]
  );

  return {
    ...existing,
    title,
    description,
    project_id,
    due_date,
    is_completed,
    completed_at,
    updated_at: now,
  };
}

export async function toggleTaskCompletion(id: string, isCompleted: boolean): Promise<Task> {
  const now = getNowIsoString();
  const completed_at = isCompleted ? now : null;
  const is_completed = isCompleted ? 1 : 0;

  const db = await getDatabase();
  await db.execute(
    `UPDATE tasks SET is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?;`,
    [is_completed, completed_at, now, id]
  );

  const updated = await getTaskById(id);
  if (!updated) {
    throw new Error(`Task ${id} not found after toggle.`);
  }
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute('DELETE FROM tasks WHERE id = ?;', [id]);
}

export async function searchTasks(query: string): Promise<Task[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const db = await getDatabase();
  const allTasks = await db.select<Task[]>('SELECT * FROM tasks;');
  return allTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(trimmed) ||
      (t.description && t.description.toLowerCase().includes(trimmed))
  );
}
