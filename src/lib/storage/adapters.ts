import type { StorageAdapter } from './types';

const createMemoryStorage = (): StorageAdapter => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
};

let memoryStorageInstance: StorageAdapter | null = null;

export const getMemoryStorage = (): StorageAdapter => {
  if (!memoryStorageInstance) {
    memoryStorageInstance = createMemoryStorage();
  }
  return memoryStorageInstance;
};

export const isStorageAvailable = (
  type: 'localStorage' | 'sessionStorage'
): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const getLocalStorage = (): StorageAdapter => {
  if (isStorageAvailable('localStorage')) {
    return window.localStorage;
  }
  return getMemoryStorage();
};

export const getSessionStorage = (): StorageAdapter => {
  if (isStorageAvailable('sessionStorage')) {
    return window.sessionStorage;
  }
  return getMemoryStorage();
};

export const getStorage = (
  type: 'local' | 'session' | 'memory'
): StorageAdapter => {
  switch (type) {
    case 'local':
      return getLocalStorage();
    case 'session':
      return getSessionStorage();
    case 'memory':
      return getMemoryStorage();
    default:
      return getMemoryStorage();
  }
};

export const createNamespacedStorage = (
  storage: StorageAdapter,
  prefix: string,
  separator = ':'
): StorageAdapter => {
  const prefixKey = (key: string) => `${prefix}${separator}${key}`;
  const unprefixKey = (key: string) => {
    const fullPrefix = `${prefix}${separator}`;
    return key.startsWith(fullPrefix) ? key.slice(fullPrefix.length) : key;
  };

  const getNamespacedKeys = (): string[] => {
    const keys: string[] = [];
    const fullPrefix = `${prefix}${separator}`;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(fullPrefix)) {
        keys.push(key);
      }
    }
    return keys;
  };

  return {
    getItem: (key: string) => storage.getItem(prefixKey(key)),
    setItem: (key: string, value: string) => {
      storage.setItem(prefixKey(key), value);
    },
    removeItem: (key: string) => {
      storage.removeItem(prefixKey(key));
    },
    clear: () => {
      const keys = getNamespacedKeys();
      keys.forEach((key) => storage.removeItem(key));
    },
    key: (index: number) => {
      const keys = getNamespacedKeys();
      const key = keys[index];
      return key ? unprefixKey(key) : null;
    },
    get length() {
      return getNamespacedKeys().length;
    },
  };
};

export const createExpiringStorage = (
  storage: StorageAdapter,
  defaultTtl?: number
): StorageAdapter & { cleanExpired: () => void } => {
  type WrappedValue = {
    value: string;
    expiry: number | null;
  };

  const wrap = (value: string, ttl?: number): string => {
    const wrapped: WrappedValue = {
      value,
      expiry: ttl
        ? Date.now() + ttl
        : defaultTtl
          ? Date.now() + defaultTtl
          : null,
    };
    return JSON.stringify(wrapped);
  };

  const unwrap = (wrapped: string): string | null => {
    try {
      const parsed = JSON.parse(wrapped) as WrappedValue;
      if (parsed.expiry && Date.now() > parsed.expiry) {
        return null;
      }
      return parsed.value;
    } catch {
      return wrapped;
    }
  };

  const cleanExpired = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const raw = storage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as WrappedValue;
            if (parsed.expiry && Date.now() > parsed.expiry) {
              keysToRemove.push(key);
            }
          } catch {
            // Not a wrapped value, skip
          }
        }
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
  };

  return {
    getItem: (key: string) => {
      const raw = storage.getItem(key);
      if (!raw) return null;
      const value = unwrap(raw);
      if (value === null) {
        storage.removeItem(key);
      }
      return value;
    },
    setItem: (key: string, value: string) => {
      storage.setItem(key, wrap(value));
    },
    removeItem: (key: string) => {
      storage.removeItem(key);
    },
    clear: () => {
      storage.clear();
    },
    key: (index: number) => storage.key(index),
    get length() {
      return storage.length;
    },
    cleanExpired,
  };
};

export const getStorageSize = (storage: StorageAdapter): number => {
  let size = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      if (value) {
        size += key.length + value.length;
      }
    }
  }
  return size * 2;
};

export const getStorageKeys = (storage: StorageAdapter): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
};

export const exportStorage = (
  storage: StorageAdapter
): Record<string, string> => {
  const data: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      if (value !== null) {
        data[key] = value;
      }
    }
  }
  return data;
};

export const importStorage = (
  storage: StorageAdapter,
  data: Record<string, string>,
  overwrite = false
): void => {
  if (overwrite) {
    storage.clear();
  }
  for (const [key, value] of Object.entries(data)) {
    storage.setItem(key, value);
  }
};
