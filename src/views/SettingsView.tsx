import React from 'react';
import { ThemeMode } from '../types';
import { Sun, Moon, Laptop, Keyboard, Database, ShieldCheck } from 'lucide-react';

export interface SettingsViewProps {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  onThemeChange: (theme: ThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  resolvedTheme,
  onThemeChange,
}) => {
  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      desc: 'Clean, soft neutral background for bright spaces',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      desc: 'Layered graphite surfaces easy on the eyes',
    },
    {
      id: 'system',
      label: 'System',
      icon: <Laptop className="w-4 h-4 text-accent" />,
      desc: 'Matches your operating system color scheme automatically',
    },
  ];

  const shortcuts = [
    { key: 'Ctrl/Cmd + N', action: 'Create a new task' },
    { key: 'Ctrl/Cmd + K', action: 'Open quick search' },
    { key: 'Enter', action: 'Confirm task creation or save inline title edit' },
    { key: 'Escape', action: 'Close dialogs or cancel active operation' },
    { key: 'Space', action: 'Toggle task completion when task row has focus' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      {/* Theme Settings */}
      <section className="bg-surface rounded-lg border border-border p-4 shadow-subtle space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Appearance</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Choose your preferred theme. Your choice is automatically persisted in SQLite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onThemeChange(opt.id)}
                className={`flex flex-col items-start p-3 rounded-md border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent-subtle/30 ring-1 ring-accent'
                    : 'border-border bg-surface hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {opt.icon}
                  <span className="text-sm font-medium text-text-primary">{opt.label}</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">{opt.desc}</p>
                {opt.id === 'system' && isSelected && (
                  <span className="text-[10px] text-accent mt-2 font-medium">
                    Active: {resolvedTheme} mode
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Keyboard Shortcuts Reference */}
      <section className="bg-surface rounded-lg border border-border p-4 shadow-subtle space-y-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h3>
        </div>
        <p className="text-xs text-text-secondary">
          Daymark is designed for speed and keyboard accessibility.
        </p>

        <div className="divide-y divide-border-subtle pt-1 text-xs">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-text-primary">{sc.action}</span>
              <kbd className="font-mono text-[11px] px-2 py-0.5 rounded border border-border bg-surface-secondary text-text-secondary font-medium">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      {/* Storage & Privacy */}
      <section className="bg-surface rounded-lg border border-border p-4 shadow-subtle space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Local Storage & Privacy</h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Daymark stores all tasks, projects, and settings directly on your machine in an offline
          SQLite database managed by Tauri 2. No telemetry, cloud sync, or external servers are
          used.
        </p>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-secondary p-2.5 rounded border border-border-subtle">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span>Local-first SQLite database (`daymark.db`) in application data directory</span>
        </div>
      </section>

      {/* About */}
      <section className="text-center pt-2">
        <p className="text-xs text-text-muted">Daymark Desktop v0.1.0 • Built with Tauri 2 & React</p>
      </section>
    </div>
  );
};
