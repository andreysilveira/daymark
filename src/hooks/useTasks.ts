import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import * as taskService from '../services/tasks';
import { isToday, isOverdue, isUpcoming, getLocalDateString } from '../utils/date';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const all = await taskService.getAllTasks();
      setTasks(all);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setError(err?.message || 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addTask = async (input: CreateTaskInput): Promise<Task> => {
    setError(null);
    try {
      const created = await taskService.createTask(input);
      setTasks((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      setError(err?.message || 'Failed to create task.');
      throw err;
    }
  };

  const updateTask = async (id: string, input: UpdateTaskInput): Promise<Task> => {
    setError(null);
    try {
      const updated = await taskService.updateTask(id, input);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update task.');
      throw err;
    }
  };

  const toggleTask = async (id: string, completed: boolean): Promise<Task> => {
    setError(null);
    try {
      // Immediate local state update for snappy feel
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                is_completed: completed ? 1 : 0,
                completed_at: completed ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              }
            : t
        )
      );

      const updated = await taskService.toggleTaskCompletion(id, completed);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      // Revert if persistence failed
      await refreshTasks();
      setError(err?.message || 'Failed to update task completion.');
      throw err;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    setError(null);
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await taskService.deleteTask(id);
    } catch (err: any) {
      await refreshTasks();
      setError(err?.message || 'Failed to delete task.');
      throw err;
    }
  };

  // Views categorization
  const todayDateStr = getLocalDateString();

  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.is_completed === 0 && t.due_date && (isToday(t.due_date) || isOverdue(t.due_date)))
      .sort((a, b) => {
        // Overdue first, then by date, then by created_at
        if (a.due_date && b.due_date) {
          const comp = a.due_date.localeCompare(b.due_date);
          if (comp !== 0) return comp;
        }
        return a.created_at.localeCompare(b.created_at);
      });
  }, [tasks, todayDateStr]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.is_completed === 0 && t.due_date && isUpcoming(t.due_date))
      .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
  }, [tasks, todayDateStr]);

  const inboxTasks = useMemo(() => {
    return tasks
      .filter((t) => t.is_completed === 0 && !t.due_date)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.is_completed === 1)
      .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''));
  }, [tasks]);

  const getTasksForProject = useCallback(
    (projectId: string) => {
      return tasks
        .filter((t) => t.project_id === projectId)
        .sort((a, b) => {
          if (a.is_completed !== b.is_completed) {
            return a.is_completed - b.is_completed;
          }
          return (a.due_date || '9999').localeCompare(b.due_date || '9999');
        });
    },
    [tasks]
  );

  return {
    tasks,
    isLoading,
    error,
    refreshTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    todayTasks,
    upcomingTasks,
    inboxTasks,
    completedTasks,
    getTasksForProject,
    counts: {
      today: todayTasks.length,
      upcoming: upcomingTasks.length,
      inbox: inboxTasks.length,
      completed: completedTasks.length,
    },
  };
}
