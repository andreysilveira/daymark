import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDatabase } from '../src/database/inMemoryDb';
import { setDatabaseInstance, getDatabase } from '../src/database/db';
import { runMigrations } from '../src/database/migrations';
import * as taskService from '../src/services/tasks';
import * as projectService from '../src/services/projects';
import * as settingsService from '../src/services/settings';

describe('Services & Database Integration', () => {
  let mockDb: InMemoryDatabase;

  beforeEach(async () => {
    mockDb = new InMemoryDatabase();
    await runMigrations(mockDb);
    setDatabaseInstance(mockDb);
  });

  describe('Migrations', () => {
    it('applies migrations tracking record', async () => {
      const migrations = await mockDb.select('SELECT id, name FROM _migrations;');
      expect(migrations.length).toBeGreaterThan(0);
      expect(migrations[0].name).toBe('initial_schema');
    });
  });

  describe('Tasks Service', () => {
    it('creates a task with valid title and stores calendar due date', async () => {
      const task = await taskService.createTask({
        title: 'Complete Daymark desktop app',
        description: 'Implement with Tauri 2, React, Tailwind, and SQLite',
        due_date: '2026-10-15',
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Complete Daymark desktop app');
      expect(task.description).toBe('Implement with Tauri 2, React, Tailwind, and SQLite');
      expect(task.due_date).toBe('2026-10-15');
      expect(task.is_completed).toBe(0);
      expect(task.completed_at).toBeNull();
      expect(task.created_at).toBeDefined();
    });

    it('rejects empty or whitespace-only task title', async () => {
      await expect(taskService.createTask({ title: '   ' })).rejects.toThrow(
        'Task title cannot be empty.'
      );
    });

    it('updates task properties including description and due date', async () => {
      const task = await taskService.createTask({ title: 'Initial task' });
      const updated = await taskService.updateTask(task.id, {
        title: 'Updated task title',
        description: 'New detailed notes',
        due_date: '2026-10-20',
      });

      expect(updated.title).toBe('Updated task title');
      expect(updated.description).toBe('New detailed notes');
      expect(updated.due_date).toBe('2026-10-20');
    });

    it('toggles task completion and updates completed_at', async () => {
      const task = await taskService.createTask({ title: 'Finish testing' });
      expect(task.is_completed).toBe(0);
      expect(task.completed_at).toBeNull();

      // Mark completed
      const completed = await taskService.toggleTaskCompletion(task.id, true);
      expect(completed.is_completed).toBe(1);
      expect(completed.completed_at).toBeDefined();
      expect(completed.completed_at).not.toBeNull();

      // Reopen task
      const reopened = await taskService.toggleTaskCompletion(task.id, false);
      expect(reopened.is_completed).toBe(0);
      expect(reopened.completed_at).toBeNull();
    });

    it('deletes a task', async () => {
      const task = await taskService.createTask({ title: 'Task to delete' });
      await taskService.deleteTask(task.id);

      const found = await taskService.getTaskById(task.id);
      expect(found).toBeNull();
    });

    it('searches tasks by title and description case-insensitively', async () => {
      await taskService.createTask({
        title: 'Buy whole milk',
        description: 'From the grocery store downtown',
      });
      await taskService.createTask({
        title: 'Write report',
        description: 'Covering Q3 financial performance',
      });

      const milkSearch = await taskService.searchTasks('milk');
      expect(milkSearch.length).toBe(1);
      expect(milkSearch[0].title).toBe('Buy whole milk');

      const grocerySearch = await taskService.searchTasks('GROCERY');
      expect(grocerySearch.length).toBe(1);
      expect(grocerySearch[0].title).toBe('Buy whole milk');

      const emptySearch = await taskService.searchTasks('nonexistent keyword');
      expect(emptySearch.length).toBe(0);
    });
  });

  describe('Projects Service', () => {
    it('creates a project with color', async () => {
      const proj = await projectService.createProject({
        name: 'Work Projects',
        color: '#6366f1',
      });

      expect(proj.id).toBeDefined();
      expect(proj.name).toBe('Work Projects');
      expect(proj.color).toBe('#6366f1');
      expect(proj.is_archived).toBe(0);
    });

    it('archives and unarchives a project', async () => {
      const proj = await projectService.createProject({ name: 'Archive Test' });
      expect(proj.is_archived).toBe(0);

      const archived = await projectService.archiveProject(proj.id, true);
      expect(archived.is_archived).toBe(1);

      const activeProjects = await projectService.getActiveProjects();
      expect(activeProjects.some((p) => p.id === proj.id)).toBe(false);

      const restored = await projectService.archiveProject(proj.id, false);
      expect(restored.is_archived).toBe(0);

      const activeAgain = await projectService.getActiveProjects();
      expect(activeAgain.some((p) => p.id === proj.id)).toBe(true);
    });

    it('preserves tasks when a project is deleted (ON DELETE SET NULL)', async () => {
      const proj = await projectService.createProject({ name: 'Temporary Project' });
      const task = await taskService.createTask({
        title: 'Project specific task',
        project_id: proj.id,
      });

      expect(task.project_id).toBe(proj.id);

      // Delete the project
      await projectService.deleteProject(proj.id);

      // Verify project is deleted
      const projFound = await projectService.getProjectById(proj.id);
      expect(projFound).toBeNull();

      // Verify task still exists and its project_id was set to null
      const taskAfter = await taskService.getTaskById(task.id);
      expect(taskAfter).not.toBeNull();
      expect(taskAfter!.project_id).toBeNull();
      expect(taskAfter!.title).toBe('Project specific task');
    });
  });

  describe('Settings Service & Theme Persistence', () => {
    it('persists and retrieves theme settings', async () => {
      expect(await settingsService.getThemeSetting()).toBe('system');

      await settingsService.setThemeSetting('dark');
      expect(await settingsService.getThemeSetting()).toBe('dark');

      await settingsService.setThemeSetting('light');
      expect(await settingsService.getThemeSetting()).toBe('light');

      await settingsService.setThemeSetting('system');
      expect(await settingsService.getThemeSetting()).toBe('system');
    });
  });
});
