'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  FocusableElement,
  FocusTrapOptions,
  FocusTrapReturn,
} from './types';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary:first-of-type',
].join(',');

const getFocusableElements = (container: HTMLElement): FocusableElement[] => {
  const elements =
    container.querySelectorAll<FocusableElement>(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter((el) => {
    return (
      el.offsetParent !== null &&
      !el.hasAttribute('inert') &&
      getComputedStyle(el).visibility !== 'hidden'
    );
  });
};

const getFirstFocusable = (container: HTMLElement): FocusableElement | null => {
  const elements = getFocusableElements(container);
  return elements[0] ?? null;
};

const getLastFocusable = (container: HTMLElement): FocusableElement | null => {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] ?? null;
};

export const useFocusTrap = (
  options: FocusTrapOptions = {}
): FocusTrapReturn => {
  const {
    initialFocus = 'first',
    returnFocus = true,
    escapeDeactivates = true,
    clickOutsideDeactivates = false,
    onEscape,
    onClickOutside,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<Element | null>(null);
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    previousActiveElementRef.current = document.activeElement;
    setIsActive(true);
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);

    if (
      returnFocus &&
      previousActiveElementRef.current instanceof HTMLElement
    ) {
      previousActiveElementRef.current.focus();
    }
  }, [returnFocus]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    if (initialFocus === 'first') {
      const first = getFirstFocusable(container);
      first?.focus();
    } else if (initialFocus === 'container') {
      container.focus();
    } else if (
      initialFocus &&
      'current' in initialFocus &&
      initialFocus.current
    ) {
      initialFocus.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && escapeDeactivates) {
        e.preventDefault();
        onEscape?.();
        deactivate();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!clickOutsideDeactivates) return;
      if (!container.contains(e.target as Node)) {
        onClickOutside?.();
        deactivate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    isActive,
    initialFocus,
    escapeDeactivates,
    clickOutsideDeactivates,
    onEscape,
    onClickOutside,
    deactivate,
  ]);

  return {
    containerRef,
    activate,
    deactivate,
    isActive,
  };
};

export const useFocusReturn = (): {
  saveFocus: () => void;
  restoreFocus: () => void;
} => {
  const previousElementRef = useRef<Element | null>(null);

  const saveFocus = useCallback(() => {
    previousElementRef.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousElementRef.current instanceof HTMLElement) {
      previousElementRef.current.focus();
    }
  }, []);

  return { saveFocus, restoreFocus };
};

export const useFocusOnMount = (
  ref: React.RefObject<HTMLElement>,
  options: { disabled?: boolean; delay?: number } = {}
): void => {
  const { disabled = false, delay = 0 } = options;

  useEffect(() => {
    if (disabled || !ref.current) return;

    const timer = setTimeout(() => {
      ref.current?.focus();
    }, delay);

    return () => clearTimeout(timer);
  }, [ref, disabled, delay]);
};

export { getFocusableElements, getFirstFocusable, getLastFocusable };
