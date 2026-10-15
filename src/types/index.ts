export type ThemeMode = 'light' | 'dark' | 'system';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  due_date: string | null; // YYYY-MM-DD
  is_completed: number; // 0 or 1
  completed_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface Project {
  id: string;
  name: string;
  color: string | null;
  is_archived: number; // 0 or 1
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface Setting {
  key: string;
  value: string;
}

export type ViewType = 'today' | 'upcoming' | 'inbox' | 'completed' | 'project' | 'settings';

export interface ActiveView {
  type: ViewType;
  projectId?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  project_id?: string | null;
  due_date?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  project_id?: string | null;
  due_date?: string | null;
  is_completed?: number;
  completed_at?: string | null;
}

export interface CreateProjectInput {
  name: string;
  color?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string | null;
  is_archived?: number;
}
