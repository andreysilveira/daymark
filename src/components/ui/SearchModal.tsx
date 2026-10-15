import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Task, Project } from '../../types';
import { searchTasks } from '../../services/tasks';
import { formatDisplayDate } from '../../utils/date';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  projects: Project[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onToggleTask,
  projects,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let isMounted = true;
    searchTasks(query).then((res) => {
      if (isMounted) {
        setResults(res);
        setSelectedIndex(0);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectTask(results[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-surface rounded-lg border border-border shadow-popover overflow-hidden z-10 flex flex-col max-h-[70vh]">
        <div className="flex items-center px-4 py-3 border-b border-border bg-surface">
          <Search className="w-4 h-4 text-text-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks by title or description..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-border bg-surface-secondary text-text-muted ml-2">
            ESC
          </kbd>
        </div>

        <div className="overflow-y-auto p-2 divide-y divide-border-subtle">
          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-xs text-text-muted">
              No tasks found matching "{query}"
            </div>
          )}

          {!query.trim() && (
            <div className="p-8 text-center text-xs text-text-muted">
              Type to search any task in Daymark...
            </div>
          )}

          {results.map((task, idx) => {
            const isSelected = idx === selectedIndex;
            const project = task.project_id ? projectMap.get(task.project_id) : undefined;
            return (
              <div
                key={task.id}
                onClick={() => {
                  onSelectTask(task);
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors ${
                  isSelected ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id, task.is_completed === 0);
                    }}
                    className="text-text-muted hover:text-accent transition-colors shrink-0"
                  >
                    {task.is_completed === 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-sm truncate ${
                        task.is_completed === 1
                          ? 'line-through text-text-muted'
                          : 'text-text-primary'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3 text-xs">
                  {project && (
                    <span className="flex items-center gap-1 text-text-secondary bg-surface-secondary px-1.5 py-0.5 rounded border border-border-subtle">
                      {project.color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                      <span className="truncate max-w-[90px]">{project.name}</span>
                    </span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1 text-text-secondary bg-surface-secondary px-1.5 py-0.5 rounded border border-border-subtle">
                      <Calendar className="w-3 h-3 text-text-muted" />
                      <span>{formatDisplayDate(task.due_date)}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
