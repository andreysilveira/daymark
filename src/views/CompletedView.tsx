import React from 'react';
import { TaskList } from '../components/tasks/TaskList';
import { Task, Project } from '../types';
import { CheckCircle2 } from 'lucide-react';

export interface CompletedViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (id: string, completed: boolean) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenDetails: (task: Task) => void;
}

export const CompletedView: React.FC<CompletedViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onUpdateTitle,
  onDeleteTask,
  onOpenDetails,
}) => {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between px-3 py-2 bg-surface rounded-md border border-border-subtle text-xs text-text-secondary">
        <span>
          {tasks.length} completed {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
        <span className="text-text-muted">Click any circle to reopen a task</span>
      </div>

      <TaskList
        tasks={tasks}
        projects={projects}
        onToggleTask={onToggleTask}
        onUpdateTitle={onUpdateTitle}
        onDeleteTask={onDeleteTask}
        onOpenDetails={onOpenDetails}
        emptyMessage="No completed tasks yet."
        emptyIcon={<CheckCircle2 className="w-6 h-6 text-accent" />}
      />
    </div>
  );
};
