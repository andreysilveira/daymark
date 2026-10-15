import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Project, CreateTaskInput } from '../../types';
import { getLocalDateString } from '../../utils/date';

export interface TaskQuickAddProps {
  onAdd: (input: CreateTaskInput) => Promise<any>;
  defaultProjectId?: string | null;
  defaultDueDate?: string | null;
  projects: Project[];
  autoFocus?: boolean;
}

export const TaskQuickAdd: React.FC<TaskQuickAddProps> = ({
  onAdd,
  defaultProjectId = null,
  defaultDueDate = null,
  projects,
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(defaultDueDate);
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  useEffect(() => {
    setDueDate(defaultDueDate);
  }, [defaultDueDate]);

  useEffect(() => {
    if (autoFocus || isOpen) {
      inputRef.current?.focus();
    }
  }, [autoFocus, isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAdd({
        title: trimmed,
        due_date: dueDate,
        project_id: projectId,
      });
      setTitle('');
      // Keep defaults for next task creation
      setDueDate(defaultDueDate);
      setProjectId(defaultProjectId);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (!title) {
        setIsOpen(false);
      } else {
        setTitle('');
      }
    }
  };

  if (!isOpen && !autoFocus) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-muted hover:text-text-primary rounded-md border border-dashed border-border hover:border-border-strong hover:bg-surface-hover/50 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4 text-accent" />
        <span>Add a task...</span>
        <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-surface text-text-muted">
          Ctrl+N
        </kbd>
      </button>
    );
  }

  const todayStr = getLocalDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrowDate);

  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-subtle transition-all duration-150">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done? Press Enter to save..."
          disabled={isSubmitting}
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        {title && (
          <button
            type="button"
            onClick={() => setTitle('')}
            className="p-1 text-text-muted hover:text-text-primary rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-border-subtle text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Date Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDueDate(dueDate === todayStr ? null : todayStr)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                dueDate === todayStr
                  ? 'bg-accent text-accent-text font-medium'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDueDate(dueDate === tomorrowStr ? null : tomorrowStr)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                dueDate === tomorrowStr
                  ? 'bg-accent text-accent-text font-medium'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Tomorrow
            </button>
            <div className="relative flex items-center">
              <input
                type="date"
                value={dueDate || ''}
                onChange={(e) => setDueDate(e.target.value || null)}
                className="text-xs bg-surface-secondary text-text-secondary border border-border-subtle rounded px-2 py-1 outline-none"
              />
            </div>
          </div>

          {/* Project selector */}
          {projects.length > 0 && (
            <select
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value || null)}
              className="text-xs bg-surface-secondary text-text-secondary border border-border-subtle rounded px-2 py-1 outline-none cursor-pointer"
            >
              <option value="">No Project (Inbox)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setIsOpen(false);
            }}
            className="px-2.5 py-1 text-text-secondary hover:text-text-primary rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!title.trim() || isSubmitting}
            className="px-3 py-1 bg-accent text-accent-text font-medium rounded hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};
