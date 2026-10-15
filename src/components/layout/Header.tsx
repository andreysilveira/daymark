import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ActiveView, Project } from '../../types';

export interface HeaderProps {
  activeView: ActiveView;
  projects: Project[];
  onOpenSearch: () => void;
  onNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  projects,
  onOpenSearch,
  onNewTask,
}) => {
  const getHeaderInfo = () => {
    switch (activeView.type) {
      case 'today': {
        const todayDate = new Date();
        const formatted = todayDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });
        return {
          title: 'Today',
          subtitle: formatted,
        };
      }
      case 'upcoming':
        return {
          title: 'Upcoming',
          subtitle: 'Scheduled tasks grouped chronologically',
        };
      case 'inbox':
        return {
          title: 'Inbox',
          subtitle: 'Tasks without a scheduled due date',
        };
      case 'completed':
        return {
          title: 'Completed',
          subtitle: 'Log of your finished tasks',
        };
      case 'project': {
        const proj = projects.find((p) => p.id === activeView.projectId);
        return {
          title: proj ? proj.name : 'Project',
          subtitle: proj?.is_archived === 1 ? 'Archived project' : 'Project tasks',
          color: proj?.color,
        };
      }
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Preferences and application information',
        };
      default:
        return { title: 'Daymark', subtitle: '' };
    }
  };

  const info = getHeaderInfo();

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        {'color' in info && info.color && (
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: info.color }}
          />
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-primary leading-tight truncate">
            {info.title}
          </h2>
          {info.subtitle && (
            <p className="text-xs text-text-muted leading-tight truncate">{info.subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Search trigger button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1 text-xs text-text-muted hover:text-text-primary bg-surface hover:bg-surface-hover border border-border rounded-md shadow-subtle transition-colors cursor-pointer"
          title="Search tasks (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="font-mono text-[10px] px-1 py-0.2 rounded border border-border-subtle bg-surface-secondary text-text-muted">
            Ctrl+K
          </kbd>
        </button>

        {/* New Task button */}
        {activeView.type !== 'settings' && (
          <Button
            size="sm"
            variant="primary"
            onClick={onNewTask}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">New Task</span>
          </Button>
        )}
      </div>
    </header>
  );
};
