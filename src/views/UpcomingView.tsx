import React from 'react';
import { TaskList } from '../components/tasks/TaskList';
import { TaskQuickAdd } from '../components/tasks/TaskQuickAdd';
import { Task, Project, CreateTaskInput } from '../types';
import { getLocalDateString } from '../utils/date';
import { CalendarDays } from 'lucide-react';

export interface UpcomingViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (id: string, completed: boolean) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenDetails: (task: Task) => void;
  onAddTask: (input: CreateTaskInput) => Promise<any>;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onUpdateTitle,
  onDeleteTask,
  onOpenDetails,
  onAddTask,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <TaskQuickAdd
        onAdd={onAddTask}
        defaultDueDate={tomorrowStr}
        projects={projects}
      />

      <TaskList
        tasks={tasks}
        projects={projects}
        onToggleTask={onToggleTask}
        onUpdateTitle={onUpdateTitle}
        onDeleteTask={onDeleteTask}
        onOpenDetails={onOpenDetails}
        emptyMessage="No upcoming tasks scheduled."
        emptyIcon={<CalendarDays className="w-6 h-6 text-accent" />}
        groupByDate={true}
      />
    </div>
  );
};
