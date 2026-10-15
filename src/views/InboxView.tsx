import React from 'react';
import { TaskList } from '../components/tasks/TaskList';
import { TaskQuickAdd } from '../components/tasks/TaskQuickAdd';
import { Task, Project, CreateTaskInput } from '../types';
import { Inbox } from 'lucide-react';

export interface InboxViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (id: string, completed: boolean) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenDetails: (task: Task) => void;
  onAddTask: (input: CreateTaskInput) => Promise<any>;
}

export const InboxView: React.FC<InboxViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onUpdateTitle,
  onDeleteTask,
  onOpenDetails,
  onAddTask,
}) => {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <TaskQuickAdd
        onAdd={onAddTask}
        defaultDueDate={null}
        projects={projects}
      />

      <TaskList
        tasks={tasks}
        projects={projects}
        onToggleTask={onToggleTask}
        onUpdateTitle={onUpdateTitle}
        onDeleteTask={onDeleteTask}
        onOpenDetails={onOpenDetails}
        emptyMessage="Your inbox is empty."
        emptyIcon={<Inbox className="w-6 h-6 text-accent" />}
      />
    </div>
  );
};
