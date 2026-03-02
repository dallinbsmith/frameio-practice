'use client';

import { useCallback, useMemo, useState } from 'react';

import type {
  FieldArrayActions,
  FieldArrayItem,
  FieldArrayState,
} from './types';

type UseFieldArrayConfig<T> = {
  initialValues?: T[];
  minItems?: number;
  maxItems?: number;
  generateId?: () => string;
};

type UseFieldArrayReturn<T> = FieldArrayState<T> &
  FieldArrayActions<T> & {
    canAdd: boolean;
    canRemove: boolean;
    isEmpty: boolean;
    errors: Map<string, string>;
    setError: (id: string, error: string | null) => void;
    clearErrors: () => void;
  };

const defaultGenerateId = (): string =>
  `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useFieldArray = <T>({
  initialValues = [],
  minItems = 0,
  maxItems = Infinity,
  generateId = defaultGenerateId,
}: UseFieldArrayConfig<T> = {}): UseFieldArrayReturn<T> => {
  const [fields, setFields] = useState<FieldArrayItem<T>[]>(() =>
    initialValues.map((value) => ({
      id: generateId(),
      value,
    }))
  );

  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const length = fields.length;
  const canAdd = length < maxItems;
  const canRemove = length > minItems;
  const isEmpty = length === 0;

  const append = useCallback(
    (value: T) => {
      if (!canAdd) return;
      setFields((prev) => [...prev, { id: generateId(), value }]);
    },
    [canAdd, generateId]
  );

  const prepend = useCallback(
    (value: T) => {
      if (!canAdd) return;
      setFields((prev) => [{ id: generateId(), value }, ...prev]);
    },
    [canAdd, generateId]
  );

  const insert = useCallback(
    (index: number, value: T) => {
      if (!canAdd) return;
      setFields((prev) => {
        const newFields = [...prev];
        newFields.splice(index, 0, { id: generateId(), value });
        return newFields;
      });
    },
    [canAdd, generateId]
  );

  const remove = useCallback(
    (index: number) => {
      if (!canRemove) return;
      setFields((prev) => {
        const removedId = prev[index]?.id;
        const newFields = prev.filter((_, i) => i !== index);
        if (removedId) {
          setErrors((prevErrors) => {
            const newErrors = new Map(prevErrors);
            newErrors.delete(removedId);
            return newErrors;
          });
        }
        return newFields;
      });
    },
    [canRemove]
  );

  const move = useCallback((from: number, to: number) => {
    setFields((prev) => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length) {
        return prev;
      }
      const newFields = [...prev];
      const removed = newFields.splice(from, 1);
      const item = removed[0];
      if (item) {
        newFields.splice(to, 0, item);
      }
      return newFields;
    });
  }, []);

  const swap = useCallback((indexA: number, indexB: number) => {
    setFields((prev) => {
      if (
        indexA < 0 ||
        indexA >= prev.length ||
        indexB < 0 ||
        indexB >= prev.length
      ) {
        return prev;
      }
      const newFields = [...prev];
      const itemA = newFields[indexA];
      const itemB = newFields[indexB];
      if (itemA && itemB) {
        newFields[indexA] = itemB;
        newFields[indexB] = itemA;
      }
      return newFields;
    });
  }, []);

  const replace = useCallback((index: number, value: T) => {
    setFields((prev) => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      const existing = prev[index];
      if (!existing) {
        return prev;
      }
      const newFields = [...prev];
      newFields[index] = { ...existing, value };
      return newFields;
    });
  }, []);

  const clear = useCallback(() => {
    const itemsToKeep = minItems;
    setFields((prev) => prev.slice(0, itemsToKeep));
    setErrors(new Map());
  }, [minItems]);

  const setError = useCallback((id: string, error: string | null) => {
    setErrors((prev) => {
      const newErrors = new Map(prev);
      if (error === null) {
        newErrors.delete(id);
      } else {
        newErrors.set(id, error);
      }
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors(new Map());
  }, []);

  const state = useMemo(
    () => ({
      fields,
      length,
      canAdd,
      canRemove,
      isEmpty,
      errors,
    }),
    [fields, length, canAdd, canRemove, isEmpty, errors]
  );

  return {
    ...state,
    append,
    prepend,
    insert,
    remove,
    move,
    swap,
    replace,
    clear,
    setError,
    clearErrors,
  };
};
