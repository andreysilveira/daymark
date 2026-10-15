import { IDatabase, QueryResult } from './types';
import { Task, Project, Setting } from '../types';

export class InMemoryDatabase implements IDatabase {
  public tasks: Map<string, Task> = new Map();
  public projects: Map<string, Project> = new Map();
  public settings: Map<string, Setting> = new Map();
  public migrations: { id: number; name: string; applied_at: string }[] = [];
  private foreignKeysEnabled = true;

  async execute(query: string, bindValues: any[] = []): Promise<QueryResult> {
    const q = query.trim().replace(/\s+/g, ' ');

    if (/^PRAGMA foreign_keys\s*=\s*ON/i.test(q)) {
      this.foreignKeysEnabled = true;
      return { rowsAffected: 0 };
    }

    if (/^CREATE TABLE/i.test(q) || /^CREATE INDEX/i.test(q)) {
      return { rowsAffected: 0 };
    }

    // Insert into _migrations
    if (/^INSERT INTO _migrations/i.test(q)) {
      const [id, name, applied_at] = bindValues;
      this.migrations.push({ id, name, applied_at });
      return { rowsAffected: 1 };
    }

    // Insert into settings (with upsert)
    if (/^INSERT INTO settings/i.test(q)) {
      const [key, value] = bindValues;
      this.settings.set(key, { key, value });
      return { rowsAffected: 1 };
    }

    // Insert into projects
    if (/^INSERT INTO projects/i.test(q)) {
      const [id, name, color, is_archived, created_at, updated_at] = bindValues;
      const project: Project = {
        id,
        name,
        color: color ?? null,
        is_archived: is_archived ?? 0,
        created_at,
        updated_at,
      };
      this.projects.set(id, project);
      return { rowsAffected: 1 };
    }

    // Update projects
    if (/^UPDATE projects SET/i.test(q)) {
      const id = bindValues[bindValues.length - 1];
      const existing = this.projects.get(id);
      if (existing) {
        if (q.includes('name = ?')) {
          existing.name = bindValues[0];
          existing.color = bindValues[1] ?? null;
          existing.is_archived = bindValues[2];
          existing.updated_at = bindValues[3];
        } else if (q.includes('is_archived = ?')) {
          existing.is_archived = bindValues[0];
          existing.updated_at = bindValues[1];
        }
        this.projects.set(id, { ...existing });
        return { rowsAffected: 1 };
      }
      return { rowsAffected: 0 };
    }

    // Delete from projects
    if (/^DELETE FROM projects WHERE id = \?/i.test(q)) {
      const [id] = bindValues;
      const deleted = this.projects.delete(id);
      if (deleted && this.foreignKeysEnabled) {
        // ON DELETE SET NULL for tasks
        for (const [taskId, task] of this.tasks.entries()) {
          if (task.project_id === id) {
            task.project_id = null;
            task.updated_at = new Date().toISOString();
            this.tasks.set(taskId, { ...task });
          }
        }
      }
      return { rowsAffected: deleted ? 1 : 0 };
    }

    // Insert into tasks
    if (/^INSERT INTO tasks/i.test(q)) {
      const [
        id,
        title,
        description,
        project_id,
        due_date,
        is_completed,
        completed_at,
        created_at,
        updated_at,
      ] = bindValues;

      // Foreign key check
      if (this.foreignKeysEnabled && project_id) {
        if (!this.projects.has(project_id)) {
          throw new Error('FOREIGN KEY constraint failed: project does not exist');
        }
      }

      const task: Task = {
        id,
        title,
        description: description ?? null,
        project_id: project_id ?? null,
        due_date: due_date ?? null,
        is_completed: is_completed ?? 0,
        completed_at: completed_at ?? null,
        created_at,
        updated_at,
      };
      this.tasks.set(id, task);
      return { rowsAffected: 1 };
    }

    // Update tasks
    if (/^UPDATE tasks SET/i.test(q)) {
      const id = bindValues[bindValues.length - 1];
      const existing = this.tasks.get(id);
      if (existing) {
        if (q.includes('title = ?') && q.includes('description = ?')) {
          const [
            title,
            description,
            project_id,
            due_date,
            is_completed,
            completed_at,
            updated_at,
          ] = bindValues;

          if (this.foreignKeysEnabled && project_id && !this.projects.has(project_id)) {
            throw new Error('FOREIGN KEY constraint failed: project does not exist');
          }

          existing.title = title;
          existing.description = description ?? null;
          existing.project_id = project_id ?? null;
          existing.due_date = due_date ?? null;
          existing.is_completed = is_completed;
          existing.completed_at = completed_at ?? null;
          existing.updated_at = updated_at;
        } else if (q.includes('is_completed = ?')) {
          const [is_completed, completed_at, updated_at] = bindValues;
          existing.is_completed = is_completed;
          existing.completed_at = completed_at ?? null;
          existing.updated_at = updated_at;
        } else if (q.includes('title = ?')) {
          const [title, updated_at] = bindValues;
          existing.title = title;
          existing.updated_at = updated_at;
        }
        this.tasks.set(id, { ...existing });
        return { rowsAffected: 1 };
      }
      return { rowsAffected: 0 };
    }

    // Delete task
    if (/^DELETE FROM tasks WHERE id = \?/i.test(q)) {
      const [id] = bindValues;
      const deleted = this.tasks.delete(id);
      return { rowsAffected: deleted ? 1 : 0 };
    }

    return { rowsAffected: 0 };
  }

  async select<T = any>(query: string, bindValues: any[] = []): Promise<T> {
    const q = query.trim().replace(/\s+/g, ' ');

    if (/SELECT id, name FROM _migrations/i.test(q)) {
      return [...this.migrations] as unknown as T;
    }

    if (/SELECT (value|\*) FROM settings WHERE key = \?/i.test(q)) {
      const [key] = bindValues;
      const s = this.settings.get(key);
      return (s ? [s] : []) as unknown as T;
    }

    if (/SELECT \* FROM settings/i.test(q)) {
      return Array.from(this.settings.values()) as unknown as T;
    }

    if (/SELECT \* FROM projects WHERE id = \?/i.test(q)) {
      const [id] = bindValues;
      const p = this.projects.get(id);
      return (p ? [p] : []) as unknown as T;
    }

    if (/SELECT \* FROM projects/i.test(q)) {
      let list = Array.from(this.projects.values());
      if (/WHERE is_archived = 0/i.test(q)) {
        list = list.filter((p) => p.is_archived === 0);
      }
      list.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return list as unknown as T;
    }

    if (/SELECT \* FROM tasks WHERE id = \?/i.test(q)) {
      const [id] = bindValues;
      const t = this.tasks.get(id);
      return (t ? [t] : []) as unknown as T;
    }

    if (/SELECT \* FROM tasks/i.test(q)) {
      let list = Array.from(this.tasks.values());

      // Filter by project_id
      if (/WHERE project_id = \?/i.test(q)) {
        const [projectId] = bindValues;
        list = list.filter((t) => t.project_id === projectId);
      }

      // Filter by completed status
      if (q.includes('is_completed = 1')) {
        list = list.filter((t) => t.is_completed === 1);
        list.sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''));
      } else if (q.includes('is_completed = 0')) {
        list = list.filter((t) => t.is_completed === 0);
        list.sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'));
      }

      return list as unknown as T;
    }

    return [] as unknown as T;
  }

  async close(): Promise<void> {
    // No-op for in-memory
  }

  clear(): void {
    this.tasks.clear();
    this.projects.clear();
    this.settings.clear();
    this.migrations = [];
  }
}
