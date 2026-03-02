export type KeyboardShortcut = {
  id: string;
  key: string;
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
  description: string;
  category?: string;
  action: () => void;
  enabled?: boolean;
  global?: boolean;
};

export type KeyboardShortcutsContextValue = {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  enableShortcut: (id: string) => void;
  disableShortcut: (id: string) => void;
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
};

export type ShortcutGroup = {
  category: string;
  shortcuts: KeyboardShortcut[];
};
