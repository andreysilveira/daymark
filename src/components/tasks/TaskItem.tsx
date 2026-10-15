import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { Task, Project } from '../../types';
import { formatDisplayDate, isOverdue, isToday } from '../../utils/date';

export interface TaskItemProps {
  task: Task;
  project?: Project;
  onToggle: (id: string, completed: boolean) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (task: Task) => void;
  isSelected?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  project,
  onToggle,
  onUpdateTitle,
  onDelete,
  onOpenDetails,
  isSelected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditTitle(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTitle(task.id, trimmed);
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && !isEditing) {
      e.preventDefault();
      onToggle(task.id, task.is_completed === 0);
    } else if (e.key === 'Enter' && !isEditing) {
      e.preventDefault();
      setIsEditing(true);
    }
  };

  const isCompleted = task.is_completed === 1;
  const overdue = !isCompleted && task.due_date && isOverdue(task.due_date);
  const dueToday = !isCompleted && task.due_date && isToday(task.due_date);

  return (
    <div
      ref={rowRef}
      tabIndex={0}
      onKeyDown={handleRowKeyDown}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-md transition-all duration-150 border border-transparent hover:border-border hover:bg-surface-hover/70 outline-none focus-visible:ring-1 focus-visible:ring-accent ${
        isSelected ? 'bg-surface-hover border-border' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Custom minimalist circular checkbox */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onToggle(task.id, !isCompleted)}
          aria-label={isCompleted ? 'Mark task as incomplete' : 'Mark task as completed'}
          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer ${
            isCompleted
              ? 'bg-accent border-accent text-accent-text'
              : 'border-border-strong hover:border-accent bg-surface'
          }`}
        >
          {isCompleted && (
            <svg
              className="w-2.5 h-2.5 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Task Title / Inline Edit */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface border border-accent rounded px-1.5 py-0.5 text-sm text-text-primary outline-none ring-1 ring-accent"
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditing(true)}
              onClick={() => onOpenDetails(task)}
              className={`text-sm cursor-pointer select-text block truncate transition-all duration-150 ${
                isCompleted ? 'line-through text-text-muted' : 'text-text-primary'
              }`}
              title="Click for details, double-click to edit inline"
            >
              {task.title}
            </span>
          )}
        </div>
      </div>

      {/* Metadata & Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Project pill */}
        {project && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-surface-secondary text-text-secondary border border-border-subtle">
            {project.color && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
            )}
            <span className="max-w-[100px] truncate">{project.name}</span>
          </span>
        )}

        {/* Due date pill */}
        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${
              overdue
                ? 'bg-danger-subtle text-danger border-danger/20'
                : dueToday
                ? 'bg-accent-subtle text-accent border-accent/20'
                : 'bg-surface-secondary text-text-secondary border-border-subtle'
            }`}
          >
            {overdue ? (
              <AlertCircle className="w-3 h-3 text-danger shrink-0" />
            ) : (
              <Calendar className="w-3 h-3 shrink-0 text-text-muted" />
            )}
            <span>{formatDisplayDate(task.due_date)}</span>
          </span>
        )}

        {/* Hover Action Buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={() => onOpenDetails(task)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            title="Task details"
            aria-label="View task details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 rounded text-text-muted hover:text-danger hover:bg-surface transition-colors cursor-pointer"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
