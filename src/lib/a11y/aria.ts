'use client';

import { useCallback, useId, useMemo, useState } from 'react';

let idCounter = 0;

export const generateId = (prefix = 'a11y'): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

export const useGeneratedId = (prefix = 'a11y'): string => {
  const reactId = useId();
  return `${prefix}-${reactId.replace(/:/g, '')}`;
};

export const useAriaIds = (
  prefix: string
): {
  labelId: string;
  descriptionId: string;
  errorId: string;
  getAriaProps: (options?: {
    hasDescription?: boolean;
    hasError?: boolean;
    errorMessage?: string;
  }) => {
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
  };
} => {
  const baseId = useGeneratedId(prefix);

  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const getAriaProps = useCallback(
    (options?: {
      hasDescription?: boolean;
      hasError?: boolean;
      errorMessage?: string;
    }) => {
      const props: {
        'aria-labelledby'?: string;
        'aria-describedby'?: string;
        'aria-errormessage'?: string;
        'aria-invalid'?: boolean;
      } = {};

      props['aria-labelledby'] = labelId;

      const describedBy: string[] = [];
      if (options?.hasDescription) {
        describedBy.push(descriptionId);
      }
      if (describedBy.length > 0) {
        props['aria-describedby'] = describedBy.join(' ');
      }

      if (options?.hasError) {
        props['aria-errormessage'] = errorId;
        props['aria-invalid'] = true;
      }

      return props;
    },
    [labelId, descriptionId, errorId]
  );

  return {
    labelId,
    descriptionId,
    errorId,
    getAriaProps,
  };
};

export const useAriaExpanded = (
  initialExpanded = false
): {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  toggle: () => void;
  triggerProps: {
    'aria-expanded': boolean;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  contentProps: {
    hidden: boolean;
  };
} => {
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  const triggerProps = useMemo(
    () => ({
      'aria-expanded': expanded,
      onClick: toggle,
      onKeyDown: handleKeyDown,
    }),
    [expanded, toggle, handleKeyDown]
  );

  const contentProps = useMemo(
    () => ({
      hidden: !expanded,
    }),
    [expanded]
  );

  return {
    expanded,
    setExpanded,
    toggle,
    triggerProps,
    contentProps,
  };
};

export const useAriaSelected = <T>(
  _items: T[],
  options: {
    initialSelected?: number;
    multiSelect?: boolean;
    onChange?: (selected: number | number[]) => void;
  } = {}
): {
  selectedIndex: number | number[];
  isSelected: (index: number) => boolean;
  select: (index: number) => void;
  toggle: (index: number) => void;
  clear: () => void;
  getItemProps: (index: number) => {
    'aria-selected': boolean;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
} => {
  const { initialSelected = -1, multiSelect = false, onChange } = options;

  const [selected, setSelected] = useState<number | number[]>(
    multiSelect ? [] : initialSelected
  );

  const isSelected = useCallback(
    (index: number): boolean => {
      if (multiSelect && Array.isArray(selected)) {
        return selected.includes(index);
      }
      return selected === index;
    },
    [selected, multiSelect]
  );

  const select = useCallback(
    (index: number) => {
      if (multiSelect) {
        setSelected((prev) => {
          const newSelected = Array.isArray(prev)
            ? prev.includes(index)
              ? prev
              : [...prev, index]
            : [index];
          onChange?.(newSelected);
          return newSelected;
        });
      } else {
        setSelected(index);
        onChange?.(index);
      }
    },
    [multiSelect, onChange]
  );

  const toggle = useCallback(
    (index: number) => {
      if (multiSelect) {
        setSelected((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const newSelected = prevArray.includes(index)
            ? prevArray.filter((i) => i !== index)
            : [...prevArray, index];
          onChange?.(newSelected);
          return newSelected;
        });
      } else {
        setSelected((prev) => {
          const newSelected = prev === index ? -1 : index;
          onChange?.(newSelected);
          return newSelected;
        });
      }
    },
    [multiSelect, onChange]
  );

  const clear = useCallback(() => {
    const newSelected = multiSelect ? [] : -1;
    setSelected(newSelected);
    onChange?.(newSelected);
  }, [multiSelect, onChange]);

  const getItemProps = useCallback(
    (index: number) => ({
      'aria-selected': isSelected(index),
      onClick: () => (multiSelect ? toggle(index) : select(index)),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          multiSelect ? toggle(index) : select(index);
        }
      },
    }),
    [isSelected, select, toggle, multiSelect]
  );

  return {
    selectedIndex: selected,
    isSelected,
    select,
    toggle,
    clear,
    getItemProps,
  };
};

export const combineAriaDescribedBy = (
  ...ids: (string | undefined | null)[]
): string | undefined => {
  const filtered = ids.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ') : undefined;
};
