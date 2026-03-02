import { getStorage } from './adapters';

import type {
  StorageAdapter,
  StorageItem,
  StorageOptions,
  StorageSubscriber,
  StorageType,
} from './types';

const DEFAULT_VERSION = 1;

const defaultSerialize = <T>(value: T): string => JSON.stringify(value);

const defaultDeserialize = <T>(value: string): T => JSON.parse(value) as T;

export const createTypedStorage = <T>(options: StorageOptions = {}) => {
  const {
    prefix = '',
    ttl,
    version = DEFAULT_VERSION,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
  } = options;

  const subscribers = new Map<string, Set<StorageSubscriber<T>>>();

  const getFullKey = (key: string): string => {
    return prefix ? `${prefix}:${key}` : key;
  };

  const wrapValue = (value: T): StorageItem<T> => ({
    value,
    timestamp: Date.now(),
    expiry: ttl ? Date.now() + ttl : null,
    version,
  });

  const unwrapValue = (raw: string): T | null => {
    try {
      const item = deserialize<StorageItem<T>>(raw);

      if (item.expiry && Date.now() > item.expiry) {
        return null;
      }

      if (item.version !== version) {
        return null;
      }

      return item.value;
    } catch {
      return null;
    }
  };

  const notifySubscribers = (
    key: string,
    oldValue: T | null,
    newValue: T | null,
    storageArea: StorageType
  ) => {
    const keySubscribers = subscribers.get(key);
    if (keySubscribers) {
      const event = { key, oldValue, newValue, storageArea };
      keySubscribers.forEach((callback) => callback(event));
    }
  };

  return {
    get: (
      key: string,
      storage: StorageAdapter,
      storageType: StorageType = 'local'
    ): T | null => {
      const fullKey = getFullKey(key);
      const raw = storage.getItem(fullKey);

      if (!raw) return null;

      const value = unwrapValue(raw);

      if (value === null) {
        storage.removeItem(fullKey);
        notifySubscribers(key, null, null, storageType);
      }

      return value;
    },

    set: (
      key: string,
      value: T,
      storage: StorageAdapter,
      storageType: StorageType = 'local'
    ): void => {
      const fullKey = getFullKey(key);
      const oldRaw = storage.getItem(fullKey);
      const oldValue = oldRaw ? unwrapValue(oldRaw) : null;

      const wrapped = wrapValue(value);
      storage.setItem(fullKey, serialize(wrapped));

      notifySubscribers(key, oldValue, value, storageType);
    },

    remove: (
      key: string,
      storage: StorageAdapter,
      storageType: StorageType = 'local'
    ): void => {
      const fullKey = getFullKey(key);
      const oldRaw = storage.getItem(fullKey);
      const oldValue = oldRaw ? unwrapValue(oldRaw) : null;

      storage.removeItem(fullKey);

      notifySubscribers(key, oldValue, null, storageType);
    },

    has: (key: string, storage: StorageAdapter): boolean => {
      const fullKey = getFullKey(key);
      const raw = storage.getItem(fullKey);
      if (!raw) return false;
      return unwrapValue(raw) !== null;
    },

    subscribe: (key: string, callback: StorageSubscriber<T>): (() => void) => {
      if (!subscribers.has(key)) {
        subscribers.set(key, new Set());
      }
      subscribers.get(key)!.add(callback);

      return () => {
        const keySubscribers = subscribers.get(key);
        if (keySubscribers) {
          keySubscribers.delete(callback);
          if (keySubscribers.size === 0) {
            subscribers.delete(key);
          }
        }
      };
    },

    getMetadata: (
      key: string,
      storage: StorageAdapter
    ): Omit<StorageItem<T>, 'value'> | null => {
      const fullKey = getFullKey(key);
      const raw = storage.getItem(fullKey);

      if (!raw) return null;

      try {
        const item = deserialize<StorageItem<T>>(raw);
        return {
          timestamp: item.timestamp,
          expiry: item.expiry,
          version: item.version,
        };
      } catch {
        return null;
      }
    },
  };
};

export const createStorageKey = <T>(
  key: string,
  defaultValue: T,
  options: StorageOptions & { storage?: StorageType } = {}
) => {
  const { storage: storageType = 'local', ...storageOptions } = options;
  const typedStorage = createTypedStorage<T>(storageOptions);

  return {
    get: (): T => {
      const storage = getStorage(storageType);
      return typedStorage.get(key, storage, storageType) ?? defaultValue;
    },

    set: (value: T): void => {
      const storage = getStorage(storageType);
      typedStorage.set(key, value, storage, storageType);
    },

    remove: (): void => {
      const storage = getStorage(storageType);
      typedStorage.remove(key, storage, storageType);
    },

    has: (): boolean => {
      const storage = getStorage(storageType);
      return typedStorage.has(key, storage);
    },

    subscribe: (callback: StorageSubscriber<T>): (() => void) => {
      return typedStorage.subscribe(key, callback);
    },

    getWithDefault: (fallback: T): T => {
      const storage = getStorage(storageType);
      return typedStorage.get(key, storage, storageType) ?? fallback;
    },

    update: (updater: (current: T) => T): void => {
      const storage = getStorage(storageType);
      const current =
        typedStorage.get(key, storage, storageType) ?? defaultValue;
      const updated = updater(current);
      typedStorage.set(key, updated, storage, storageType);
    },
  };
};

export const createStorageMap = <T extends Record<string, unknown>>(
  config: {
    [K in keyof T]: {
      defaultValue: T[K];
      ttl?: number;
    };
  },
  options: StorageOptions & { storage?: StorageType } = {}
) => {
  const { storage: storageType = 'local', ...storageOptions } = options;
  const keys = Object.keys(config) as Array<keyof T>;

  const storageKeys = {} as {
    [K in keyof T]: ReturnType<typeof createStorageKey<T[K]>>;
  };

  for (const key of keys) {
    const keyConfig = config[key];
    storageKeys[key] = createStorageKey<T[typeof key]>(
      String(key),
      keyConfig.defaultValue,
      {
        ...storageOptions,
        storage: storageType,
        ttl: keyConfig.ttl ?? storageOptions.ttl,
      }
    );
  }

  return {
    keys: storageKeys,

    getAll: (): T => {
      const result = {} as T;
      for (const key of keys) {
        result[key] = storageKeys[key].get();
      }
      return result;
    },

    setAll: (values: Partial<T>): void => {
      for (const [key, value] of Object.entries(values)) {
        if (key in storageKeys) {
          (
            storageKeys[key as keyof T] as ReturnType<typeof createStorageKey>
          ).set(value);
        }
      }
    },

    clearAll: (): void => {
      for (const key of keys) {
        storageKeys[key].remove();
      }
    },

    hasAll: (): boolean => {
      return keys.every((key) => storageKeys[key].has());
    },

    hasAny: (): boolean => {
      return keys.some((key) => storageKeys[key].has());
    },
  };
};

export const migrateStorageValue = <T>(
  key: string,
  storage: StorageAdapter,
  migrations: Array<{
    fromVersion: number;
    toVersion: number;
    migrate: (value: unknown) => unknown;
  }>,
  currentVersion: number
): T | null => {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const item = JSON.parse(raw) as StorageItem<unknown>;
    let { value } = item;
    let { version } = item;

    const sortedMigrations = [...migrations].sort(
      (a, b) => a.fromVersion - b.fromVersion
    );

    for (const migration of sortedMigrations) {
      if (version === migration.fromVersion) {
        value = migration.migrate(value);
        version = migration.toVersion;
      }
    }

    if (version === currentVersion) {
      const newItem: StorageItem<unknown> = {
        ...item,
        value,
        version: currentVersion,
      };
      storage.setItem(key, JSON.stringify(newItem));
      return value as T;
    }

    return null;
  } catch {
    return null;
  }
};
