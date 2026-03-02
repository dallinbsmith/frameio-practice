'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { KeyboardShortcut, KeyboardShortcutsContextValue } from './types';
import type { ReactNode } from 'react';

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextValue | undefined
>(undefined);

const isMac = () =>
  typeof navigator !== 'undefined' &&
  navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean => {
  const { key, modifiers = {} } = shortcut;

  const keyMatch = event.key.toLowerCase() === key.toLowerCase();

  const mac = isMac();
  const ctrlMatch = modifiers.ctrl
    ? mac
      ? event.metaKey
      : event.ctrlKey
    : !event.ctrlKey || mac;
  const metaMatch = modifiers.meta
    ? event.metaKey
    : !event.metaKey || (mac && !!modifiers.ctrl);
  const altMatch = modifiers.alt ? event.altKey : !event.altKey;
  const shiftMatch = modifiers.shift ? event.shiftKey : !event.shiftKey;

  return keyMatch && ctrlMatch && metaMatch && altMatch && shiftMatch;
};

type KeyboardShortcutsProviderProps = {
  children: ReactNode;
};

export const KeyboardShortcutsProvider = ({
  children,
}: KeyboardShortcutsProviderProps) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => {
      const exists = prev.some((s) => s.id === shortcut.id);
      if (exists) {
        return prev.map((s) => (s.id === shortcut.id ? shortcut : s));
      }
      return [...prev, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const enableShortcut = useCallback((id: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: true } : s))
    );
  }, []);

  const disableShortcut = useCallback((id: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: false } : s))
    );
  }, []);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        if (!shortcut.global && isInput) continue;

        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  useEffect(() => {
    registerShortcut({
      id: 'help',
      key: '?',
      modifiers: { shift: true },
      description: 'Show keyboard shortcuts',
      category: 'General',
      action: () => setIsHelpOpen((prev) => !prev),
      global: true,
    });

    return () => unregisterShortcut('help');
  }, [registerShortcut, unregisterShortcut]);

  const value = useMemo(
    () => ({
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      enableShortcut,
      disableShortcut,
      isHelpOpen,
      openHelp,
      closeHelp,
    }),
    [
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      enableShortcut,
      disableShortcut,
      isHelpOpen,
      openHelp,
      closeHelp,
    ]
  );

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = (): KeyboardShortcutsContextValue => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error(
      'useKeyboardShortcuts must be used within a KeyboardShortcutsProvider'
    );
  }
  return context;
};

export const useRegisterShortcut = (shortcut: KeyboardShortcut) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(shortcut);
    return () => unregisterShortcut(shortcut.id);
  }, [shortcut, registerShortcut, unregisterShortcut]);
};
