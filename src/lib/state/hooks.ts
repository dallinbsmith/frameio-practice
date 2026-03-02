'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import type { EqualityFn, Selector, StoreApi } from './types';

const useStore = <T, U = T>(
  api: StoreApi<T>,
  selector: Selector<T, U> = ((state: T) => state) as unknown as Selector<T, U>,
  equalityFn: EqualityFn<U> = Object.is
): U => {
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);

  useEffect(() => {
    selectorRef.current = selector;
    equalityFnRef.current = equalityFn;
  });

  const getSnapshot = useCallback(() => {
    return selectorRef.current(api.getState());
  }, [api]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      let currentSlice = selectorRef.current(api.getState());

      return api.subscribe((state) => {
        const nextSlice = selectorRef.current(state);
        if (!equalityFnRef.current(currentSlice, nextSlice)) {
          currentSlice = nextSlice;
          onStoreChange();
        }
      });
    },
    [api]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

const useStoreWithEqualityFn = <T, U>(
  api: StoreApi<T>,
  selector: Selector<T, U>,
  equalityFn: EqualityFn<U>
): U => {
  return useStore(api, selector, equalityFn);
};

const createSelectorHook = <T>(api: StoreApi<T>) => {
  return <U>(
    selector: Selector<T, U>,
    equalityFn: EqualityFn<U> = Object.is
  ): U => {
    return useStore(api, selector, equalityFn);
  };
};

const shallow = <T>(a: T, b: T): boolean => {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !Object.is(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
};

const useShallowStore = <T, U>(
  api: StoreApi<T>,
  selector: Selector<T, U>
): U => {
  return useStore(api, selector, shallow);
};

const createStoreSelectors = <T>(api: StoreApi<T>) => {
  type SelectorFns<S> = {
    [K in keyof S]: (state: S) => S[K];
  };

  const selectors = {} as SelectorFns<T>;

  for (const key of Object.keys(api.getState() as object) as Array<keyof T>) {
    selectors[key] = (state: T) => state[key];
  }

  return selectors;
};

const useStoreSubscription = <T>(
  api: StoreApi<T>,
  callback: (state: T, prevState: T) => void,
  deps: unknown[] = []
): void => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    return api.subscribe((state, prevState) => {
      callbackRef.current(state, prevState);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, ...deps]);
};

const useDerivedState = <T, U>(
  api: StoreApi<T>,
  derive: (state: T) => U
): U => {
  const deriveRef = useRef(derive);
  deriveRef.current = derive;

  const stableDerive = useCallback((state: T) => deriveRef.current(state), []);
  return useStore(api, stableDerive);
};

const useStoreActions = <
  T,
  A extends Record<string, (...args: unknown[]) => void>,
>(
  api: StoreApi<T>,
  actionsCreator: (
    set: StoreApi<T>['setState'],
    get: StoreApi<T>['getState']
  ) => A
): A => {
  return useMemo(
    () => actionsCreator(api.setState, api.getState),
    [api, actionsCreator]
  );
};

type UseSyncedStateOptions = {
  storage?: 'local' | 'session' | undefined;
  serialize?: ((value: unknown) => string) | undefined;
  deserialize?: ((value: string) => unknown) | undefined;
};

const useSyncedState = <T>(
  key: string,
  initialValue: T,
  options: UseSyncedStateOptions = {}
): [T, (value: T | ((prev: T) => T)) => void] => {
  const {
    storage = 'local',
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const storageApi = storage === 'local' ? localStorage : sessionStorage;

  const getStoredValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = storageApi.getItem(key);
      return item !== null ? (deserialize(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue, storageApi, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;

        try {
          storageApi.setItem(key, serialize(nextValue));
        } catch {
          // Storage might be full or disabled
        }

        return nextValue;
      });
    },
    [key, storageApi, serialize]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue) as T);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [storedValue, setValue];
};

const useDebounceStore = <T, U>(
  api: StoreApi<T>,
  selector: Selector<T, U>,
  delay: number
): U => {
  const [debouncedValue, setDebouncedValue] = useState(() =>
    selector(api.getState())
  );

  useEffect(() => {
    const unsubscribe = api.subscribe((state) => {
      const value = selector(state);
      const timeoutId = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(timeoutId);
    });

    return unsubscribe;
  }, [api, selector, delay]);

  return debouncedValue;
};

const useThrottleStore = <T, U>(
  api: StoreApi<T>,
  selector: Selector<T, U>,
  interval: number
): U => {
  const [throttledValue, setThrottledValue] = useState(() =>
    selector(api.getState())
  );
  const lastUpdateRef = useRef(0);
  const pendingRef = useRef<U | null>(null);

  useEffect(() => {
    const unsubscribe = api.subscribe((state) => {
      const value = selector(state);
      const now = Date.now();

      if (now - lastUpdateRef.current >= interval) {
        lastUpdateRef.current = now;
        setThrottledValue(value);
        pendingRef.current = null;
      } else {
        pendingRef.current = value;
      }
    });

    const flushInterval = setInterval(() => {
      if (pendingRef.current !== null) {
        setThrottledValue(pendingRef.current);
        pendingRef.current = null;
        lastUpdateRef.current = Date.now();
      }
    }, interval);

    return () => {
      unsubscribe();
      clearInterval(flushInterval);
    };
  }, [api, selector, interval]);

  return throttledValue;
};

export {
  createSelectorHook,
  createStoreSelectors,
  shallow,
  useDebounceStore,
  useDerivedState,
  useShallowStore,
  useStore,
  useStoreActions,
  useStoreSubscription,
  useStoreWithEqualityFn,
  useSyncedState,
  useThrottleStore,
};
