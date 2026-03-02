'use client';

import { useCallback, useRef, useState } from 'react';

import type { RovingTabIndexOptions } from './types';

export const useRovingTabIndex = <T extends HTMLElement = HTMLElement>(
  itemCount: number,
  options: RovingTabIndexOptions = {}
): {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  getItemProps: (index: number) => {
    ref: (el: T | null) => void;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
  };
} => {
  const {
    orientation = 'vertical',
    loop = true,
    onSelect,
    initialIndex = 0,
  } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const itemRefs = useRef<Map<number, T | null>>(new Map());

  const focusItem = useCallback((index: number) => {
    const element = itemRefs.current.get(index);
    if (element) {
      element.focus();
      setActiveIndex(index);
    }
  }, []);

  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal =
        orientation === 'horizontal' || orientation === 'both';

      let nextIndex = index;
      let handled = false;

      switch (e.key) {
        case 'ArrowUp':
          if (isVertical) {
            handled = true;
            if (index > 0) {
              nextIndex = index - 1;
            } else if (loop) {
              nextIndex = itemCount - 1;
            }
          }
          break;

        case 'ArrowDown':
          if (isVertical) {
            handled = true;
            if (index < itemCount - 1) {
              nextIndex = index + 1;
            } else if (loop) {
              nextIndex = 0;
            }
          }
          break;

        case 'ArrowLeft':
          if (isHorizontal) {
            handled = true;
            if (index > 0) {
              nextIndex = index - 1;
            } else if (loop) {
              nextIndex = itemCount - 1;
            }
          }
          break;

        case 'ArrowRight':
          if (isHorizontal) {
            handled = true;
            if (index < itemCount - 1) {
              nextIndex = index + 1;
            } else if (loop) {
              nextIndex = 0;
            }
          }
          break;

        case 'Home':
          handled = true;
          nextIndex = 0;
          break;

        case 'End':
          handled = true;
          nextIndex = itemCount - 1;
          break;

        case 'Enter':
        case ' ':
          handled = true;
          onSelect?.(index);
          break;
      }

      if (handled) {
        e.preventDefault();
        if (nextIndex !== index) {
          focusItem(nextIndex);
        }
      }
    },
    [orientation, loop, itemCount, onSelect, focusItem]
  );

  const handleFocus = useCallback(
    (index: number) => () => {
      setActiveIndex(index);
    },
    []
  );

  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: T | null) => {
        if (el) {
          itemRefs.current.set(index, el);
        } else {
          itemRefs.current.delete(index);
        }
      },
      tabIndex: index === activeIndex ? 0 : -1,
      onKeyDown: handleKeyDown(index),
      onFocus: handleFocus(index),
    }),
    [activeIndex, handleKeyDown, handleFocus]
  );

  return {
    activeIndex,
    setActiveIndex: focusItem,
    getItemProps,
  };
};

export type UseArrowNavigationOptions = {
  itemCount: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
};

export const useArrowNavigation = (
  options: UseArrowNavigationOptions
): ((e: React.KeyboardEvent) => void) => {
  const {
    itemCount,
    activeIndex,
    setActiveIndex,
    orientation = 'vertical',
    loop = true,
  } = options;

  return useCallback(
    (e: React.KeyboardEvent) => {
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal =
        orientation === 'horizontal' || orientation === 'both';

      let nextIndex = activeIndex;
      let handled = false;

      switch (e.key) {
        case 'ArrowUp':
          if (isVertical) {
            handled = true;
            nextIndex =
              activeIndex > 0
                ? activeIndex - 1
                : loop
                  ? itemCount - 1
                  : activeIndex;
          }
          break;

        case 'ArrowDown':
          if (isVertical) {
            handled = true;
            nextIndex =
              activeIndex < itemCount - 1
                ? activeIndex + 1
                : loop
                  ? 0
                  : activeIndex;
          }
          break;

        case 'ArrowLeft':
          if (isHorizontal) {
            handled = true;
            nextIndex =
              activeIndex > 0
                ? activeIndex - 1
                : loop
                  ? itemCount - 1
                  : activeIndex;
          }
          break;

        case 'ArrowRight':
          if (isHorizontal) {
            handled = true;
            nextIndex =
              activeIndex < itemCount - 1
                ? activeIndex + 1
                : loop
                  ? 0
                  : activeIndex;
          }
          break;

        case 'Home':
          handled = true;
          nextIndex = 0;
          break;

        case 'End':
          handled = true;
          nextIndex = itemCount - 1;
          break;
      }

      if (handled) {
        e.preventDefault();
        setActiveIndex(nextIndex);
      }
    },
    [activeIndex, itemCount, orientation, loop, setActiveIndex]
  );
};
