import React from 'react';
import {
  Calendar,
  CalendarDays,
  Inbox,
  CheckCircle2,
  Plus,
  Settings as SettingsIcon,
  MoreVertical,
  CheckSquare,
} from 'lucide-react';
import { ActiveView, Project } from '../../types';

export interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  projects: Project[];
  onOpenCreateProject: () => void;
  onOpenEditProject: (project: Project) => void;
  counts: {
    today: number;
    upcoming: number;
    inbox: number;
    completed: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  projects,
  onOpenCreateProject,
  onOpenEditProject,
  counts,
}) => {
  const navItems = [
    {
      id: 'today',
      name: 'Today',
      icon: <Calendar className="w-4 h-4 text-accent" />,
      count: counts.today,
    },
    {
      id: 'upcoming',
      name: 'Upcoming',
      icon: <CalendarDays className="w-4 h-4 text-text-secondary" />,
      count: counts.upcoming,
    },
    {
      id: 'inbox',
      name: 'Inbox',
      icon: <Inbox className="w-4 h-4 text-text-secondary" />,
      count: counts.inbox,
    },
    {
      id: 'completed',
      name: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4 text-text-secondary" />,
      count: counts.completed,
    },
  ];

  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col justify-between select-none h-full shrink-0">
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Brand / Title */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-accent-text font-bold text-xs shadow-subtle">
            <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-text-primary">Daymark</h1>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeView.type === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView({ type: item.id as any })}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-surface-active text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full font-normal ${
                      isActive
                        ? 'bg-surface text-text-primary font-semibold'
                        : 'bg-surface-secondary text-text-muted'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div className="space-y-1 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between px-2.5 py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Projects
            </span>
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              title="Create new project"
              aria-label="Create new project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {projects.length === 0 ? (
              <div className="px-2.5 py-1 text-xs text-text-muted italic">
                No active projects
              </div>
            ) : (
              projects.map((project) => {
                const isActive =
                  activeView.type === 'project' && activeView.projectId === project.id;
                return (
                  <div
                    key={project.id}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-surface-active text-text-primary font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                    onClick={() =>
                      onSelectView({ type: 'project', projectId: project.id })
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color || '#10b981' }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditProject(project);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-text-muted hover:text-text-primary transition-opacity"
                      title="Edit project"
                      aria-label="Edit project"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer (Settings) */}
      <div className="p-3 border-t border-border">
        <button
          type="button"
          onClick={() => onSelectView({ type: 'settings' })}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
            activeView.type === 'settings'
              ? 'bg-surface-active text-text-primary font-medium'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
