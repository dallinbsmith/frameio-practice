export type StorageType = 'local' | 'session' | 'memory';

export type StorageOptions = {
  prefix?: string | undefined;
  ttl?: number | undefined;
  version?: number | undefined;
  serialize?: (<T>(value: T) => string) | undefined;
  deserialize?: (<T>(value: string) => T) | undefined;
};

export type StorageItem<T> = {
  value: T;
  timestamp: number;
  expiry: number | null;
  version: number;
};

export type StorageEvent<T> = {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  storageArea: StorageType;
};

export type StorageSubscriber<T> = (event: StorageEvent<T>) => void;

export type CookieOptions = {
  path?: string | undefined;
  domain?: string | undefined;
  expires?: Date | number | undefined;
  maxAge?: number | undefined;
  secure?: boolean | undefined;
  sameSite?: 'strict' | 'lax' | 'none' | undefined;
  httpOnly?: boolean | undefined;
  partitioned?: boolean | undefined;
};

export type CookieAttributes = {
  name: string;
  value: string;
  path?: string | undefined;
  domain?: string | undefined;
  expires?: Date | undefined;
  secure?: boolean | undefined;
  sameSite?: 'strict' | 'lax' | 'none' | undefined;
};

export type StorageAdapter = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  readonly length: number;
};

export type TypedStorageConfig<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    defaultValue: T[K];
    ttl?: number | undefined;
    version?: number | undefined;
    migrate?: ((oldValue: unknown, oldVersion: number) => T[K]) | undefined;
  };
};

export type StorageSchema<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K];
};

export type StorageNamespace = {
  prefix: string;
  separator: string;
};

export type StorageMigration<T> = {
  version: number;
  migrate: (oldValue: unknown) => T;
};

export type StorageStats = {
  itemCount: number;
  totalSize: number;
  oldestItem: string | null;
  newestItem: string | null;
};

export type QuotaInfo = {
  usage: number;
  quota: number;
  percentUsed: number;
};

export type IndexedDBConfig = {
  name: string;
  version: number;
  stores: IndexedDBStoreConfig[];
};

export type IndexedDBStoreConfig = {
  name: string;
  keyPath?: string | undefined;
  autoIncrement?: boolean | undefined;
  indexes?: IndexedDBIndexConfig[] | undefined;
};

export type IndexedDBIndexConfig = {
  name: string;
  keyPath: string | string[];
  unique?: boolean | undefined;
  multiEntry?: boolean | undefined;
};

export type IndexedDBTransaction = {
  store: string;
  mode: 'readonly' | 'readwrite';
};

export type BroadcastMessage<T = unknown> = {
  type: string;
  payload: T;
  timestamp: number;
  tabId: string;
};

export type SyncOptions = {
  debounceMs?: number | undefined;
  conflictResolution?: 'latest' | 'merge' | 'local' | 'remote' | undefined;
};

export type EncryptionOptions = {
  algorithm?: 'AES-GCM' | 'AES-CBC' | undefined;
  key: CryptoKey | string;
};

export type CompressionOptions = {
  algorithm?: 'gzip' | 'deflate' | undefined;
  threshold?: number | undefined;
};
