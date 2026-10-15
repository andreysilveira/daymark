import React from 'react';
import { Task, Project } from '../../types';
import { TaskItem } from './TaskItem';
import { CheckCircle, Calendar } from 'lucide-react';
import { formatDisplayDate } from '../../utils/date';

export interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (id: string, completed: boolean) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenDetails: (task: Task) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  groupByDate?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onToggleTask,
  onUpdateTitle,
  onDeleteTask,
  onOpenDetails,
  emptyMessage = 'No tasks here yet.',
  emptyIcon,
  groupByDate = false,
}) => {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-text-muted mb-3 border border-border-subtle">
          {emptyIcon || <CheckCircle className="w-6 h-6 text-accent/60" />}
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">{emptyMessage}</p>
        <p className="text-xs text-text-muted max-w-xs">
          Press <kbd className="font-mono text-[11px] px-1 py-0.5 rounded border border-border bg-surface">Ctrl+N</kbd> or use the input above to capture a new task.
        </p>
      </div>
    );
  }

  if (groupByDate) {
    // Group tasks by due date
    const groups = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = task.due_date || 'No Date';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(task);
    }

    return (
      <div className="space-y-6">
        {Array.from(groups.entries()).map(([dateStr, groupTasks]) => (
          <div key={dateStr} className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary px-3 pb-1 border-b border-border-subtle flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {dateStr === 'No Date' ? 'No Due Date' : formatDisplayDate(dateStr)}
              <span className="text-text-muted font-normal ml-auto text-[11px]">
                {groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </h3>
            <div className="space-y-0.5 pt-1">
              {groupTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={task.project_id ? projectMap.get(task.project_id) : undefined}
                  onToggle={onToggleTask}
                  onUpdateTitle={onUpdateTitle}
                  onDelete={onDeleteTask}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          project={task.project_id ? projectMap.get(task.project_id) : undefined}
          onToggle={onToggleTask}
          onUpdateTitle={onUpdateTitle}
          onDelete={onDeleteTask}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
};
