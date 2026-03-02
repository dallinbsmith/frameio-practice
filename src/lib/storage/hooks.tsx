'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { getStorage, isStorageAvailable } from './adapters';
import { getCookie, removeCookie, setCookie } from './cookies';
import { createStorageSync, getTabId, onStorageChange } from './sync';
import { createStorageKey } from './typed-storage';

import type { CookieOptions, StorageOptions, StorageType } from './types';

export const useLocalStorage = <T,>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const storageKey = useMemo(
    () =>
      createStorageKey<T>(key, initialValue, {
        ...options,
        storage: 'local',
      }),
    [key, initialValue, options]
  );

  const [value, setValueState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    return storageKey.get();
  });

  useEffect(() => {
    const unsubscribe = onStorageChange(
      options.prefix ? `${options.prefix}:${key}` : key,
      () => {
        setValueState(storageKey.get());
      }
    );

    return unsubscribe;
  }, [key, options.prefix, storageKey]);

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      setValueState(valueToStore);
      storageKey.set(valueToStore);
    },
    [storageKey, value]
  );

  const removeValue = useCallback(() => {
    setValueState(initialValue);
    storageKey.remove();
  }, [initialValue, storageKey]);

  return [value, setValue, removeValue];
};

export const useSessionStorage = <T,>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const storageKey = useMemo(
    () =>
      createStorageKey<T>(key, initialValue, {
        ...options,
        storage: 'session',
      }),
    [key, initialValue, options]
  );

  const [value, setValueState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    return storageKey.get();
  });

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      setValueState(valueToStore);
      storageKey.set(valueToStore);
    },
    [storageKey, value]
  );

  const removeValue = useCallback(() => {
    setValueState(initialValue);
    storageKey.remove();
  }, [initialValue, storageKey]);

  return [value, setValue, removeValue];
};

export const useCookie = <T = string,>(
  name: string,
  initialValue: T,
  options: CookieOptions = {}
): [T, (value: T) => void, () => void] => {
  const [value, setValueState] = useState<T>(() => {
    if (typeof document === 'undefined') return initialValue;

    const cookieValue = getCookie(name);
    if (cookieValue === null) return initialValue;

    try {
      return JSON.parse(cookieValue) as T;
    } catch {
      return cookieValue as unknown as T;
    }
  });

  const setValue = useCallback(
    (newValue: T) => {
      setValueState(newValue);

      const valueToStore =
        typeof newValue === 'string' ? newValue : JSON.stringify(newValue);

      setCookie(name, valueToStore, options);
    },
    [name, options]
  );

  const removeValue = useCallback(() => {
    setValueState(initialValue);
    removeCookie(name, options);
  }, [initialValue, name, options]);

  return [value, setValue, removeValue];
};

export const useStorageState = <T,>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'local'
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const storageKey = useMemo(
    () =>
      createStorageKey<T>(key, initialValue, {
        storage: storageType,
      }),
    [key, initialValue, storageType]
  );

  const [value, setValueState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    return storageKey.get();
  });

  useEffect(() => {
    if (storageType === 'memory') return;

    const unsubscribe = onStorageChange(key, () => {
      setValueState(storageKey.get());
    });

    return unsubscribe;
  }, [key, storageKey, storageType]);

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      setValueState(valueToStore);
      storageKey.set(valueToStore);
    },
    [storageKey, value]
  );

  const removeValue = useCallback(() => {
    setValueState(initialValue);
    storageKey.remove();
  }, [initialValue, storageKey]);

  return [value, setValue, removeValue];
};

export const useSyncedStorage = <T,>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T) => void, { isLeader: boolean; tabId: string }] => {
  const [value, setValueState] = useState<T>(initialValue);
  const [isLeader, setIsLeader] = useState(false);
  const syncRef = useRef<ReturnType<typeof createStorageSync<T>> | null>(null);

  const storageKey = useMemo(
    () =>
      createStorageKey<T>(key, initialValue, {
        ...options,
        storage: 'local',
      }),
    [key, initialValue, options]
  );

  useEffect(() => {
    setValueState(storageKey.get());

    syncRef.current = createStorageSync<T>(
      options.prefix ? `${options.prefix}:${key}` : key
    );

    const unsubscribe = syncRef.current.subscribe((newValue, source) => {
      if (source === 'remote' && newValue !== null) {
        setValueState(newValue);
      }
    });

    const checkLeader = () => {
      const leaderKey = `__leader__${key}`;
      const storage = getStorage('local');
      const existing = storage.getItem(leaderKey);
      const now = Date.now();

      if (!existing || now - Number(existing) > 5000) {
        storage.setItem(leaderKey, String(now));
        setIsLeader(true);
      }
    };

    checkLeader();
    const leaderInterval = setInterval(checkLeader, 2000);

    return () => {
      unsubscribe();
      clearInterval(leaderInterval);
      syncRef.current?.destroy();
    };
  }, [key, options.prefix, storageKey]);

  const setValue = useCallback(
    (newValue: T) => {
      setValueState(newValue);
      storageKey.set(newValue);
      syncRef.current?.notifyLocal(newValue);
    },
    [storageKey]
  );

  return [value, setValue, { isLeader, tabId: getTabId() }];
};

export const useStorageAvailable = (
  type: 'localStorage' | 'sessionStorage' = 'localStorage'
): boolean => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(isStorageAvailable(type));
  }, [type]);

  return available;
};

export const useStorageSize = (
  type: StorageType = 'local'
): { size: number; itemCount: number } => {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined')
      return JSON.stringify({ size: 0, itemCount: 0 });

    const storage = getStorage(type);
    let size = 0;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key);
        if (value) {
          size += (key.length + value.length) * 2;
        }
      }
    }

    return JSON.stringify({ size, itemCount: storage.length });
  }, [type]);

  const getServerSnapshot = useCallback(
    () => JSON.stringify({ size: 0, itemCount: 0 }),
    []
  );

  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof window === 'undefined') return () => {};

    window.addEventListener('storage', onStoreChange);
    return () => window.removeEventListener('storage', onStoreChange);
  }, []);

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return useMemo(
    () => JSON.parse(snapshot) as { size: number; itemCount: number },
    [snapshot]
  );
};

export const useStorageKeys = (
  type: StorageType = 'local',
  prefix?: string
): string[] => {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const storage = getStorage(type);
    const allKeys: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        if (!prefix || key.startsWith(prefix)) {
          allKeys.push(prefix ? key.slice(prefix.length + 1) : key);
        }
      }
    }

    setKeys(allKeys);
  }, [type, prefix]);

  useEffect(() => {
    const handleStorage = () => {
      const storage = getStorage(type);
      const allKeys: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          if (!prefix || key.startsWith(prefix)) {
            allKeys.push(prefix ? key.slice(prefix.length + 1) : key);
          }
        }
      }

      setKeys(allKeys);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [type, prefix]);

  return keys;
};

export const usePersistentState = <T,>(
  key: string,
  initialValue: T,
  options: {
    storage?: StorageType | undefined;
    onError?: ((error: Error) => void) | undefined;
  } = {}
): [
  T,
  (value: T | ((prev: T) => T)) => void,
  { loading: boolean; error: Error | null },
] => {
  const { storage = 'local', onError } = options;
  const [value, setValue] = useStorageState(key, initialValue, storage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setLoading(false);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      onError?.(err);
    }
  }, [onError]);

  const safeSetValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        setValue(newValue);
        setError(null);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        onError?.(err);
      }
    },
    [setValue, onError]
  );

  return [value, safeSetValue, { loading, error }];
};

export const useStorageEvent = <T,>(
  key: string,
  callback: (newValue: T | null, oldValue: T | null) => void
): void => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        const newValue = event.newValue
          ? (JSON.parse(event.newValue) as T)
          : null;
        const oldValue = event.oldValue
          ? (JSON.parse(event.oldValue) as T)
          : null;
        callbackRef.current(newValue, oldValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);
};

export const useClearStorage = (
  type: StorageType = 'local',
  prefix?: string
): (() => void) => {
  return useCallback(() => {
    const storage = getStorage(type);

    if (prefix) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => storage.removeItem(key));
    } else {
      storage.clear();
    }
  }, [type, prefix]);
};
