import React from 'react';
import { TaskList } from '../components/tasks/TaskList';
import { TaskQuickAdd } from '../components/tasks/TaskQuickAdd';
import { Task, Project, CreateTaskInput } from '../types';
import { getLocalDateString } from '../utils/date';
import { Sun } from 'lucide-react';

export interface TodayViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (id: string, completed: boolean) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenDetails: (task: Task) => void;
  onAddTask: (input: CreateTaskInput) => Promise<any>;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onUpdateTitle,
  onDeleteTask,
  onOpenDetails,
  onAddTask,
}) => {
  const todayStr = getLocalDateString();

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <TaskQuickAdd
        onAdd={onAddTask}
        defaultDueDate={todayStr}
        projects={projects}
      />

      <TaskList
        tasks={tasks}
        projects={projects}
        onToggleTask={onToggleTask}
        onUpdateTitle={onUpdateTitle}
        onDeleteTask={onDeleteTask}
        onOpenDetails={onOpenDetails}
        emptyMessage="You're all caught up for today!"
        emptyIcon={<Sun className="w-6 h-6 text-accent" />}
      />
    </div>
  );
};
