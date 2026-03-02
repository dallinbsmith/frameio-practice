import type { ReactNode } from 'react';

export type ContextMenuItem =
  | {
      type: 'item';
      id: string;
      label: string;
      icon?: ReactNode;
      shortcut?: string[];
      disabled?: boolean;
      danger?: boolean;
      action: () => void;
    }
  | {
      type: 'separator';
    }
  | {
      type: 'label';
      label: string;
    };

export type ContextMenuPosition = {
  x: number;
  y: number;
};

export type ContextMenuProps = {
  items: ContextMenuItem[];
  position: ContextMenuPosition | null;
  onClose: () => void;
};

export type UseContextMenuReturn = {
  isOpen: boolean;
  position: ContextMenuPosition | null;
  open: (e: React.MouseEvent) => void;
  close: () => void;
  contextMenuProps: {
    position: ContextMenuPosition | null;
    onClose: () => void;
  };
};
