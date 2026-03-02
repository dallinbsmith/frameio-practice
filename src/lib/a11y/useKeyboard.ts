'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { KeyboardNavigationOptions } from './types';

export const useKeyboardNavigation = (
  options: KeyboardNavigationOptions
): ((e: React.KeyboardEvent) => void) => {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onSpace,
    onEscape,
    onHome,
    onEnd,
    onTab,
    preventDefault = true,
  } = options;

  return useCallback(
    (e: React.KeyboardEvent) => {
      let handled = false;

      switch (e.key) {
        case 'ArrowUp':
          if (onArrowUp) {
            onArrowUp();
            handled = true;
          }
          break;

        case 'ArrowDown':
          if (onArrowDown) {
            onArrowDown();
            handled = true;
          }
          break;

        case 'ArrowLeft':
          if (onArrowLeft) {
            onArrowLeft();
            handled = true;
          }
          break;

        case 'ArrowRight':
          if (onArrowRight) {
            onArrowRight();
            handled = true;
          }
          break;

        case 'Enter':
          if (onEnter) {
            onEnter();
            handled = true;
          }
          break;

        case ' ':
          if (onSpace) {
            onSpace();
            handled = true;
          }
          break;

        case 'Escape':
          if (onEscape) {
            onEscape();
            handled = true;
          }
          break;

        case 'Home':
          if (onHome) {
            onHome();
            handled = true;
          }
          break;

        case 'End':
          if (onEnd) {
            onEnd();
            handled = true;
          }
          break;

        case 'Tab':
          if (onTab) {
            onTab(e);
          }
          break;
      }

      if (handled && preventDefault) {
        e.preventDefault();
      }
    },
    [
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onEnter,
      onSpace,
      onEscape,
      onHome,
      onEnd,
      onTab,
      preventDefault,
    ]
  );
};

export const useEscapeKey = (
  callback: () => void,
  options: { disabled?: boolean } = {}
): void => {
  const { disabled = false } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        callbackRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled]);
};

export const useHotkey = (
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    disabled?: boolean;
    preventDefault?: boolean;
  } = {}
): void => {
  const {
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    disabled = false,
    preventDefault = true,
  } = options;

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrl ? e.ctrlKey : !e.ctrlKey;
      const matchesShift = shift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = alt ? e.altKey : !e.altKey;
      const matchesMeta = meta ? e.metaKey : !e.metaKey;

      if (
        matchesKey &&
        matchesCtrl &&
        matchesShift &&
        matchesAlt &&
        matchesMeta
      ) {
        if (preventDefault) {
          e.preventDefault();
        }
        callbackRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrl, shift, alt, meta, disabled, preventDefault]);
};

export const useTypeahead = (
  items: string[],
  onMatch: (index: number) => void,
  options: { timeout?: number; disabled?: boolean } = {}
): void => {
  const { timeout = 500, disabled = false } = options;

  const searchRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      searchRef.current += e.key.toLowerCase();

      const matchIndex = items.findIndex((item) =>
        item.toLowerCase().startsWith(searchRef.current)
      );

      if (matchIndex !== -1) {
        onMatch(matchIndex);
      }

      timeoutRef.current = setTimeout(() => {
        searchRef.current = '';
      }, timeout);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [items, onMatch, timeout, disabled]);
};
