'use client';

import { useCallback, useState } from 'react';

import type { ContextMenuPosition, UseContextMenuReturn } from './types';

export const useContextMenu = (): UseContextMenuReturn => {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const close = useCallback(() => {
    setPosition(null);
  }, []);

  return {
    isOpen: position !== null,
    position,
    open,
    close,
    contextMenuProps: {
      position,
      onClose: close,
    },
  };
};
