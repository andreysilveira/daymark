import React from 'react';
import { TaskList } from '../components/tasks/TaskList';
import { TaskQuickAdd } from '../components/tasks/TaskQuickAdd';
import { Task, Project, CreateTaskInput } from '../types';
import { Folder, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export interface ProjectViewProps {
  project: Project;
  tasks: Task[];
  projects: Project[];
  onToggleTask: (id: string, completed: boolean) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenDetails: (task: Task) => void;
  onAddTask: (input: CreateTaskInput) => Promise<any>;
  onEditProject: (project: Project) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({
  project,
  tasks,
  projects,
  onToggleTask,
  onUpdateTitle,
  onDeleteTask,
  onOpenDetails,
  onAddTask,
  onEditProject,
}) => {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Project Banner */}
      <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border shadow-subtle">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0"
            style={{ backgroundColor: project.color || '#10b981' }}
          />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{project.name}</h3>
            {project.is_archived === 1 && (
              <span className="text-xs text-amber-500 font-medium">Archived project</span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditProject(project)}
          icon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit Project
        </Button>
      </div>

      <TaskQuickAdd
        onAdd={onAddTask}
        defaultProjectId={project.id}
        projects={projects}
      />

      <TaskList
        tasks={tasks}
        projects={projects}
        onToggleTask={onToggleTask}
        onUpdateTitle={onUpdateTitle}
        onDeleteTask={onDeleteTask}
        onOpenDetails={onOpenDetails}
        emptyMessage={`No tasks in project ${project.name} yet.`}
        emptyIcon={<Folder className="w-6 h-6 text-accent" />}
      />
    </div>
  );
};
