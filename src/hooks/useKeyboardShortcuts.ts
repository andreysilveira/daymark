import { useEffect } from 'react';

export interface ShortcutHandlers {
  onNewTask?: () => void;
  onOpenSearch?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + N -> Create new task
      if (modifier && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handlers.onNewTask?.();
        return;
      }

      // Ctrl/Cmd + K -> Open search
      if (modifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onOpenSearch?.();
        return;
      }

      // Escape -> Close modal / cancel active operation
      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      // Space -> Toggle task completion only when NOT inside an input/textarea
      if (e.key === ' ' && !isInput) {
        if (handlers.onSpace) {
          e.preventDefault();
          handlers.onSpace();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
