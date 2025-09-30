import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey;
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Global keyboard shortcuts for the app
export const globalShortcuts: KeyboardShortcut[] = [
  {
    key: '1',
    metaKey: true,
    description: 'Navigate to Pods',
    action: () => {}, // Will be overridden
  },
  {
    key: '2',
    metaKey: true,
    description: 'Navigate to Library',
    action: () => {},
  },
  {
    key: '3',
    metaKey: true,
    description: 'Navigate to Terminal',
    action: () => {},
  },
  {
    key: '4',
    metaKey: true,
    description: 'Navigate to Settings',
    action: () => {},
  },
  {
    key: 't',
    metaKey: true,
    description: 'New Terminal Tab',
    action: () => {},
  },
  {
    key: 'w',
    metaKey: true,
    description: 'Close Current Tab',
    action: () => {},
  },
  {
    key: ',',
    metaKey: true,
    description: 'Open Settings',
    action: () => {},
  },
];