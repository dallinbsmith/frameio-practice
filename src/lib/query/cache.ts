'use client';

import type { CacheEntry, QueryCache, QueryKey, QueryState } from './types';

const hashKey = (key: QueryKey): string => {
  return JSON.stringify(key, (_, value) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce(
          (sorted, k) => {
            sorted[k] = value[k];
            return sorted;
          },
          {} as Record<string, unknown>
        );
    }
    return value;
  });
};

const createInitialState = <TData>(): QueryState<TData> => ({
  data: undefined,
  error: null,
  status: 'idle',
  dataUpdatedAt: null,
  errorUpdatedAt: null,
  isStale: true,
  fetchCount: 0,
});

export const createQueryCache = (
  defaultCacheTime = 5 * 60 * 1000
): QueryCache => {
  const cache = new Map<string, CacheEntry<unknown>>();

  const get = <TData>(key: QueryKey): CacheEntry<TData> | undefined => {
    const hash = hashKey(key);
    return cache.get(hash) as CacheEntry<TData> | undefined;
  };

  const set = <TData>(key: QueryKey, entry: CacheEntry<TData>): void => {
    const hash = hashKey(key);
    const existing = cache.get(hash);

    if (existing?.gcTimeout) {
      clearTimeout(existing.gcTimeout);
    }

    cache.set(hash, entry as CacheEntry<unknown>);
  };

  const deleteEntry = (key: QueryKey): void => {
    const hash = hashKey(key);
    const entry = cache.get(hash);

    if (entry?.gcTimeout) {
      clearTimeout(entry.gcTimeout);
    }

    cache.delete(hash);
  };

  const clear = (): void => {
    cache.forEach((entry) => {
      if (entry.gcTimeout) {
        clearTimeout(entry.gcTimeout);
      }
    });
    cache.clear();
  };

  const invalidate = (predicate?: (key: QueryKey) => boolean): void => {
    cache.forEach((entry, hash) => {
      const key = JSON.parse(hash) as QueryKey;
      if (!predicate || predicate(key)) {
        entry.state.isStale = true;
        entry.subscribers.forEach((callback) => callback());
      }
    });
  };

  const subscribe = (key: QueryKey, callback: () => void): (() => void) => {
    const hash = hashKey(key);
    let entry = cache.get(hash);

    if (!entry) {
      entry = {
        data: undefined,
        dataUpdatedAt: 0,
        state: createInitialState(),
        subscribers: new Set(),
      };
      cache.set(hash, entry);
    }

    entry.subscribers.add(callback);

    return () => {
      entry?.subscribers.delete(callback);

      if (entry && entry.subscribers.size === 0) {
        entry.gcTimeout = setTimeout(() => {
          cache.delete(hash);
        }, defaultCacheTime);
      }
    };
  };

  const getAll = (): Map<string, CacheEntry<unknown>> => {
    return new Map(cache);
  };

  return {
    get,
    set,
    delete: deleteEntry,
    clear,
    invalidate,
    subscribe,
    getAll,
  };
};

export const getInFlightRequest = <TData>(
  inFlightRequests: Map<string, Promise<unknown>>,
  key: QueryKey
): Promise<TData> | undefined => {
  const hash = hashKey(key);
  return inFlightRequests.get(hash) as Promise<TData> | undefined;
};

export const setInFlightRequest = <TData>(
  inFlightRequests: Map<string, Promise<unknown>>,
  key: QueryKey,
  promise: Promise<TData>
): void => {
  const hash = hashKey(key);
  inFlightRequests.set(hash, promise);
  promise.finally(() => {
    inFlightRequests.delete(hash);
  });
};

export const defaultQueryCache = createQueryCache();

export { hashKey, createInitialState };
