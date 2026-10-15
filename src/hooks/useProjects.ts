import { useState, useEffect, useCallback } from 'react';
import { Project, CreateProjectInput, UpdateProjectInput } from '../types';
import * as projectService from '../services/projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const all = await projectService.getAllProjects();
      setProjects(all);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setError(err?.message || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const activeProjects = projects.filter((p) => p.is_archived === 0);
  const archivedProjects = projects.filter((p) => p.is_archived === 1);

  const addProject = async (input: CreateProjectInput): Promise<Project> => {
    setError(null);
    try {
      const created = await projectService.createProject(input);
      setProjects((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      setError(err?.message || 'Failed to create project.');
      throw err;
    }
  };

  const editProject = async (id: string, input: UpdateProjectInput): Promise<Project> => {
    setError(null);
    try {
      const updated = await projectService.updateProject(id, input);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update project.');
      throw err;
    }
  };

  const toggleArchive = async (id: string, archive: boolean): Promise<Project> => {
    setError(null);
    try {
      const updated = await projectService.archiveProject(id, archive);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle archive state.');
      throw err;
    }
  };

  const removeProject = async (id: string): Promise<void> => {
    setError(null);
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await projectService.deleteProject(id);
    } catch (err: any) {
      await refreshProjects();
      setError(err?.message || 'Failed to delete project.');
      throw err;
    }
  };

  return {
    projects,
    activeProjects,
    archivedProjects,
    isLoading,
    error,
    refreshProjects,
    addProject,
    editProject,
    toggleArchive,
    removeProject,
  };
}
