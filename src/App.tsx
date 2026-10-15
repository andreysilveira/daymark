import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TodayView } from './views/TodayView';
import { UpcomingView } from './views/UpcomingView';
import { InboxView } from './views/InboxView';
import { CompletedView } from './views/CompletedView';
import { ProjectView } from './views/ProjectView';
import { SettingsView } from './views/SettingsView';
import { SearchModal } from './components/ui/SearchModal';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { ProjectModal } from './components/projects/ProjectModal';
import { useTheme } from './hooks/useTheme';
import { useTasks } from './hooks/useTasks';
import { useProjects } from './hooks/useProjects';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ActiveView, Task, Project, CreateProjectInput, UpdateProjectInput } from './types';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const {
    isLoading: tasksLoading,
    error: tasksError,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    todayTasks,
    upcomingTasks,
    inboxTasks,
    completedTasks,
    getTasksForProject,
    counts,
  } = useTasks();

  const {
    projects,
    activeProjects,
    addProject,
    editProject,
    toggleArchive,
    removeProject,
  } = useProjects();

  const [activeView, setActiveView] = useState<ActiveView>({ type: 'today' });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  // Keyboard shortcut handlers
  const handleNewTask = useCallback(() => {
    // Focus quick-add input if in task views
    const input = document.querySelector('input[placeholder*="What needs to be done"], input[placeholder*="Add a task"]') as HTMLInputElement;
    if (input) {
      input.focus();
    } else {
      if (activeView.type === 'settings' || activeView.type === 'completed') {
        setActiveView({ type: 'inbox' });
        setTimeout(() => {
          const inp = document.querySelector('input[placeholder*="What needs to be done"], input[placeholder*="Add a task"]') as HTMLInputElement;
          inp?.focus();
        }, 50);
      }
    }
  }, [activeView]);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleEscape = useCallback(() => {
    if (isSearchOpen) setIsSearchOpen(false);
    else if (selectedTaskForDetails) setSelectedTaskForDetails(null);
    else if (isProjectModalOpen) setIsProjectModalOpen(false);
  }, [isSearchOpen, selectedTaskForDetails, isProjectModalOpen]);

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onOpenSearch: handleOpenSearch,
    onEscape: handleEscape,
  });

  const handleOpenCreateProject = () => {
    setSelectedProjectForEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setSelectedProjectForEdit(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (input: CreateProjectInput | UpdateProjectInput) => {
    if (selectedProjectForEdit) {
      await editProject(selectedProjectForEdit.id, input);
    } else {
      const created = await addProject(input as CreateProjectInput);
      setActiveView({ type: 'project', projectId: created.id });
    }
  };

  const handleDeleteProject = async (id: string) => {
    await removeProject(id);
    if (activeView.type === 'project' && activeView.projectId === id) {
      setActiveView({ type: 'today' });
    }
  };

  const handleInlineTitleUpdate = async (id: string, newTitle: string) => {
    await updateTask(id, { title: newTitle });
  };

  // Render view content
  const renderContent = () => {
    switch (activeView.type) {
      case 'today':
        return (
          <TodayView
            tasks={todayTasks}
            projects={activeProjects}
            onToggleTask={toggleTask}
            onUpdateTitle={handleInlineTitleUpdate}
            onDeleteTask={deleteTask}
            onOpenDetails={setSelectedTaskForDetails}
            onAddTask={addTask}
          />
        );
      case 'upcoming':
        return (
          <UpcomingView
            tasks={upcomingTasks}
            projects={activeProjects}
            onToggleTask={toggleTask}
            onUpdateTitle={handleInlineTitleUpdate}
            onDeleteTask={deleteTask}
            onOpenDetails={setSelectedTaskForDetails}
            onAddTask={addTask}
          />
        );
      case 'inbox':
        return (
          <InboxView
            tasks={inboxTasks}
            projects={activeProjects}
            onToggleTask={toggleTask}
            onUpdateTitle={handleInlineTitleUpdate}
            onDeleteTask={deleteTask}
            onOpenDetails={setSelectedTaskForDetails}
            onAddTask={addTask}
          />
        );
      case 'completed':
        return (
          <CompletedView
            tasks={completedTasks}
            projects={activeProjects}
            onToggleTask={toggleTask}
            onUpdateTitle={handleInlineTitleUpdate}
            onDeleteTask={deleteTask}
            onOpenDetails={setSelectedTaskForDetails}
          />
        );
      case 'project': {
        const proj = projects.find((p) => p.id === activeView.projectId);
        if (!proj) {
          return (
            <div className="p-8 text-center text-text-muted">
              Project not found or was removed.
            </div>
          );
        }
        return (
          <ProjectView
            project={proj}
            tasks={getTasksForProject(proj.id)}
            projects={activeProjects}
            onToggleTask={toggleTask}
            onUpdateTitle={handleInlineTitleUpdate}
            onDeleteTask={deleteTask}
            onOpenDetails={setSelectedTaskForDetails}
            onAddTask={addTask}
            onEditProject={handleOpenEditProject}
          />
        );
      }
      case 'settings':
        return (
          <SettingsView
            theme={theme}
            resolvedTheme={resolvedTheme}
            onThemeChange={setTheme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary antialiased">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        projects={activeProjects}
        onOpenCreateProject={handleOpenCreateProject}
        onOpenEditProject={handleOpenEditProject}
        counts={counts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          activeView={activeView}
          projects={activeProjects}
          onOpenSearch={handleOpenSearch}
          onNewTask={handleNewTask}
        />

        {tasksError && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-md bg-danger-subtle text-danger text-xs flex items-center gap-2 border border-danger/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{tasksError}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-6">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-20 text-xs text-text-muted">
              Loading tasks...
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Local Quick Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={setSelectedTaskForDetails}
        onToggleTask={toggleTask}
        projects={projects}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        task={selectedTaskForDetails}
        isOpen={!!selectedTaskForDetails}
        onClose={() => setSelectedTaskForDetails(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
        projects={activeProjects}
      />

      {/* Project Create / Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProjectForEdit}
        onSave={handleSaveProject}
        onArchive={toggleArchive}
        onDelete={handleDeleteProject}
      />
    </div>
  );
};

export default App;
