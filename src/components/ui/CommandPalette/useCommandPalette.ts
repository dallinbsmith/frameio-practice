'use client';

import { useCallback, useEffect, useState } from 'react';

type UseCommandPaletteOptions = {
  shortcut?: string;
  enabled?: boolean;
};

export const useCommandPalette = (options: UseCommandPaletteOptions = {}) => {
  const { shortcut = 'k', enabled = true } = options;
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, enabled, toggle]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
