import type { ReactNode } from 'react';

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string[];
  keywords?: string[];
  action: () => void;
  disabled?: boolean;
  group?: string;
};

export type CommandGroup = {
  id: string;
  label: string;
  items: CommandItem[];
};

export type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  recentIds?: string[];
  maxRecentItems?: number;
};
