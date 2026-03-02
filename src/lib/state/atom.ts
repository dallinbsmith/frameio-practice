'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import type {
  Atom,
  AtomConfig,
  AtomStore,
  ComputedAtom,
  Unsubscribe,
} from './types';

const atomRegistry = new Map<
  string,
  { value: unknown; listeners: Set<() => void> }
>();

const atom = <T>(config: AtomConfig<T>): Atom<T> => {
  return {
    key: config.key,
    default: config.default,
  };
};

const atomWithDefault = <T>(key: string, defaultValue: T): Atom<T> => {
  return atom({ key, default: defaultValue });
};

const atomWithStorage = <T>(
  key: string,
  defaultValue: T,
  storage: 'local' | 'session' = 'local'
): Atom<T> => {
  if (typeof window !== 'undefined') {
    const storageApi = storage === 'local' ? localStorage : sessionStorage;
    const stored = storageApi.getItem(key);
    if (stored) {
      try {
        return atom({ key, default: JSON.parse(stored) as T, persist: true });
      } catch {
        // Ignore parse errors
      }
    }
  }
  return atom({ key, default: defaultValue, persist: true });
};

const getAtomEntry = <T>(atomDef: Atom<T>) => {
  let entry = atomRegistry.get(atomDef.key);
  if (!entry) {
    const defaultValue =
      typeof atomDef.default === 'function'
        ? (atomDef.default as () => T)()
        : atomDef.default;
    entry = { value: defaultValue, listeners: new Set() };
    atomRegistry.set(atomDef.key, entry);
  }
  return entry as { value: T; listeners: Set<() => void> };
};

const getAtom = <T>(atomDef: Atom<T>): T => {
  return getAtomEntry(atomDef).value;
};

const setAtom = <T>(atomDef: Atom<T>, value: T | ((prev: T) => T)): void => {
  const entry = getAtomEntry(atomDef);
  const nextValue =
    typeof value === 'function'
      ? (value as (prev: T) => T)(entry.value)
      : value;

  if (!Object.is(entry.value, nextValue)) {
    entry.value = nextValue;
    entry.listeners.forEach((listener) => listener());
  }
};

const subscribeAtom = <T>(
  atomDef: Atom<T>,
  listener: () => void
): Unsubscribe => {
  const entry = getAtomEntry(atomDef);
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
  };
};

const resetAtom = <T>(atomDef: Atom<T>): void => {
  const defaultValue =
    typeof atomDef.default === 'function'
      ? (atomDef.default as () => T)()
      : atomDef.default;
  setAtom(atomDef, defaultValue);
};

const useAtom = <T>(
  atomDef: Atom<T>
): [T, (value: T | ((prev: T) => T)) => void] => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeAtom(atomDef, onStoreChange),
    [atomDef]
  );

  const getSnapshot = useCallback(() => getAtom(atomDef), [atomDef]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setAtom(atomDef, newValue);
    },
    [atomDef]
  );

  return [value, setValue];
};

const useAtomValue = <T>(atomDef: Atom<T>): T => {
  const [value] = useAtom(atomDef);
  return value;
};

const useSetAtom = <T>(
  atomDef: Atom<T>
): ((value: T | ((prev: T) => T)) => void) => {
  return useCallback(
    (value: T | ((prev: T) => T)) => {
      setAtom(atomDef, value);
    },
    [atomDef]
  );
};

const useResetAtom = <T>(atomDef: Atom<T>): (() => void) => {
  return useCallback(() => {
    resetAtom(atomDef);
  }, [atomDef]);
};

const computed = <T>(
  config: Omit<ComputedAtom<T>, 'key'> & { key: string }
): ComputedAtom<T> => {
  return {
    key: config.key,
    get: config.get,
  };
};

const useComputedAtom = <T>(computedAtom: ComputedAtom<T>): T => {
  const [value, setValue] = useState<T>(() => {
    return computedAtom.get((atomDef) => getAtom(atomDef));
  });

  useEffect(() => {
    const dependencies = new Set<Atom<unknown>>();
    const unsubscribes: Unsubscribe[] = [];

    const trackingGet = <U>(atomDef: Atom<U>): U => {
      if (!dependencies.has(atomDef as Atom<unknown>)) {
        dependencies.add(atomDef as Atom<unknown>);
        unsubscribes.push(
          subscribeAtom(atomDef, () => {
            const newValue = computedAtom.get((a) => getAtom(a));
            setValue(newValue);
          })
        );
      }
      return getAtom(atomDef);
    };

    const initialValue = computedAtom.get(trackingGet);
    setValue(initialValue);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [computedAtom]);

  return value;
};

type AtomFamily<T, P> = (param: P) => Atom<T>;

const atomFamily = <T, P>(
  keyFn: (param: P) => string,
  defaultFn: (param: P) => T
): AtomFamily<T, P> => {
  const atoms = new Map<string, Atom<T>>();

  return (param: P) => {
    const key = keyFn(param);
    let atomDef = atoms.get(key);

    if (!atomDef) {
      atomDef = atom({ key, default: () => defaultFn(param) });
      atoms.set(key, atomDef);
    }

    return atomDef;
  };
};

const createAtomStore = (): AtomStore => {
  return {
    get: getAtom,
    set: setAtom,
    subscribe: (atomDef, listener) => {
      return subscribeAtom(atomDef, () => {
        listener(getAtom(atomDef));
      });
    },
    reset: resetAtom,
  };
};

const atomEffect = <T>(
  atomDef: Atom<T>,
  effect: (value: T) => void | (() => void)
): Unsubscribe => {
  let cleanup: (() => void) | void;

  const runEffect = () => {
    if (cleanup) {
      cleanup();
    }
    cleanup = effect(getAtom(atomDef));
  };

  runEffect();

  return subscribeAtom(atomDef, runEffect);
};

const useAtomEffect = <T>(
  atomDef: Atom<T>,
  effect: (value: T) => void | (() => void)
): void => {
  useEffect(() => {
    return atomEffect(atomDef, effect);
  }, [atomDef, effect]);
};

const atomWithReducer = <T, A>(
  key: string,
  initialValue: T,
  reducer: (state: T, action: A) => T
): [Atom<T>, (action: A) => void] => {
  const atomDef = atom({ key, default: initialValue });

  const dispatch = (action: A) => {
    setAtom(atomDef, (state) => reducer(state, action));
  };

  return [atomDef, dispatch];
};

const useAtomReducer = <T, A>(
  atomDef: Atom<T>,
  reducer: (state: T, action: A) => T
): [T, (action: A) => void] => {
  const [value, setValue] = useAtom(atomDef);

  const dispatch = useCallback(
    (action: A) => {
      setValue((state) => reducer(state, action));
    },
    [setValue, reducer]
  );

  return [value, dispatch];
};

const clearAtomRegistry = (): void => {
  atomRegistry.clear();
};

export {
  atom,
  atomEffect,
  atomFamily,
  atomRegistry,
  atomWithDefault,
  atomWithReducer,
  atomWithStorage,
  clearAtomRegistry,
  computed,
  createAtomStore,
  getAtom,
  resetAtom,
  setAtom,
  subscribeAtom,
  useAtom,
  useAtomEffect,
  useAtomReducer,
  useAtomValue,
  useComputedAtom,
  useResetAtom,
  useSetAtom,
};

export type { AtomFamily };
