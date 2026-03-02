'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

let hadKeyboardEvent = false;

const inputTypesAllowlist: Record<string, boolean> = {
  text: true,
  search: true,
  url: true,
  tel: true,
  email: true,
  password: true,
  number: true,
  date: true,
  month: true,
  week: true,
  time: true,
  datetime: true,
  'datetime-local': true,
};

const isValidFocusTarget = (el: Element | null): boolean => {
  if (!el || el.tagName === 'HTML' || el.tagName === 'BODY') {
    return false;
  }
  return true;
};

const focusTriggersKeyboardModality = (el: Element): boolean => {
  const tagName = el.tagName.toLowerCase();

  if (tagName === 'input') {
    const inputType = (el as HTMLInputElement).type;
    return inputTypesAllowlist[inputType] ?? false;
  }

  if (tagName === 'textarea') {
    return true;
  }

  if ((el as HTMLElement).isContentEditable) {
    return true;
  }

  return false;
};

const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.metaKey || e.altKey || e.ctrlKey) {
    return;
  }
  hadKeyboardEvent = true;
};

const handlePointerDown = (): void => {
  hadKeyboardEvent = false;
};

const handleFocus = (e: FocusEvent): void => {
  if (!isValidFocusTarget(e.target as Element)) {
    return;
  }

  const target = e.target as Element;

  if (hadKeyboardEvent || focusTriggersKeyboardModality(target)) {
    target.classList.add('focus-visible');
  }
};

const handleBlur = (e: FocusEvent): void => {
  if (!isValidFocusTarget(e.target as Element)) {
    return;
  }

  const target = e.target as Element;

  if (target.classList.contains('focus-visible')) {
    target.classList.remove('focus-visible');
  }
};

let isListening = false;

const addFocusVisibleListeners = (): void => {
  if (typeof document === 'undefined' || isListening) return;

  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('mousedown', handlePointerDown, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('touchstart', handlePointerDown, true);
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);

  isListening = true;
};

export const useFocusVisible = (): {
  isFocusVisible: boolean;
  focusProps: {
    onFocus: () => void;
    onBlur: () => void;
  };
} => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    addFocusVisibleListeners();
  }, []);

  const onFocus = useCallback(() => {
    setIsFocused(true);
    setIsFocusVisible(hadKeyboardEvent);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
    setIsFocusVisible(false);
  }, []);

  return {
    isFocusVisible: isFocused && isFocusVisible,
    focusProps: {
      onFocus,
      onBlur,
    },
  };
};

export const useFocusWithin = (): {
  isFocusWithin: boolean;
  focusWithinProps: {
    onFocus: (e: React.FocusEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
  };
} => {
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const containerRef = useRef<Element | null>(null);

  const onFocus = useCallback((e: React.FocusEvent) => {
    if (!containerRef.current) {
      containerRef.current = e.currentTarget;
    }
    setIsFocusWithin(true);
  }, []);

  const onBlur = useCallback((e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as Element | null;

    if (containerRef.current && relatedTarget) {
      if (!containerRef.current.contains(relatedTarget)) {
        setIsFocusWithin(false);
      }
    } else {
      setIsFocusWithin(false);
    }
  }, []);

  return {
    isFocusWithin,
    focusWithinProps: {
      onFocus,
      onBlur,
    },
  };
};

export const useAutoFocus = (
  ref: React.RefObject<HTMLElement>,
  options: { enabled?: boolean; delay?: number; selectText?: boolean } = {}
): void => {
  const { enabled = true, delay = 0, selectText = false } = options;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const timer = setTimeout(() => {
      ref.current?.focus();

      if (
        selectText &&
        ref.current &&
        'select' in ref.current &&
        typeof ref.current.select === 'function'
      ) {
        (ref.current as HTMLInputElement).select();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [ref, enabled, delay, selectText]);
};
