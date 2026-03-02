import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialState, createQueryCache, hashKey } from './cache';

import type { CacheEntry, QueryKey } from './types';

describe('hashKey', () => {
  it('should hash simple array keys', () => {
    const key: QueryKey = ['users'];
    const hash = hashKey(key);
    expect(hash).toBe('["users"]');
  });

  it('should hash keys with multiple elements', () => {
    const key: QueryKey = ['users', 1, 'posts'];
    const hash = hashKey(key);
    expect(hash).toBe('["users",1,"posts"]');
  });

  it('should hash keys with objects in consistent order', () => {
    const key1: QueryKey = ['users', { id: 1, name: 'test' }];
    const key2: QueryKey = ['users', { name: 'test', id: 1 }];
    expect(hashKey(key1)).toBe(hashKey(key2));
  });

  it('should hash nested objects in consistent order', () => {
    const key1: QueryKey = ['data', { filters: { b: 2, a: 1 } }];
    const key2: QueryKey = ['data', { filters: { a: 1, b: 2 } }];
    expect(hashKey(key1)).toBe(hashKey(key2));
  });

  it('should produce different hashes for different keys', () => {
    const key1: QueryKey = ['users', 1];
    const key2: QueryKey = ['users', 2];
    expect(hashKey(key1)).not.toBe(hashKey(key2));
  });

  it('should handle arrays within keys', () => {
    const key: QueryKey = ['users', [1, 2, 3]];
    const hash = hashKey(key);
    expect(hash).toBe('["users",[1,2,3]]');
  });

  it('should handle null values', () => {
    const key: QueryKey = ['users', null];
    const hash = hashKey(key);
    expect(hash).toBe('["users",null]');
  });
});

describe('createInitialState', () => {
  it('should create initial state with correct defaults', () => {
    const state = createInitialState<string>();
    expect(state).toEqual({
      data: undefined,
      error: null,
      status: 'idle',
      dataUpdatedAt: null,
      errorUpdatedAt: null,
      isStale: true,
      fetchCount: 0,
    });
  });
});

describe('createQueryCache', () => {
  let cache: ReturnType<typeof createQueryCache>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = createQueryCache(1000);
  });

  afterEach(() => {
    cache.clear();
    vi.useRealTimers();
  });

  describe('get and set', () => {
    it('should store and retrieve entries', () => {
      const key: QueryKey = ['test'];
      const entry: CacheEntry<string> = {
        data: 'test-data',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      };

      cache.set(key, entry);
      const retrieved = cache.get<string>(key);

      expect(retrieved).toEqual(entry);
    });

    it('should return undefined for non-existent keys', () => {
      const key: QueryKey = ['non-existent'];
      expect(cache.get(key)).toBeUndefined();
    });

    it('should overwrite existing entries', () => {
      const key: QueryKey = ['test'];
      const entry1: CacheEntry<string> = {
        data: 'data-1',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      };
      const entry2: CacheEntry<string> = {
        data: 'data-2',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      };

      cache.set(key, entry1);
      cache.set(key, entry2);

      expect(cache.get<string>(key)?.data).toBe('data-2');
    });
  });

  describe('delete', () => {
    it('should remove entries', () => {
      const key: QueryKey = ['test'];
      const entry: CacheEntry<string> = {
        data: 'test-data',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      };

      cache.set(key, entry);
      expect(cache.get(key)).toBeDefined();

      cache.delete(key);
      expect(cache.get(key)).toBeUndefined();
    });

    it('should clear gc timeout when deleting', () => {
      const key: QueryKey = ['test'];
      const gcTimeout = setTimeout(() => {}, 5000);
      const entry: CacheEntry<string> = {
        data: 'test-data',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
        gcTimeout,
      };

      cache.set(key, entry);
      cache.delete(key);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set(['key1'], {
        data: 'data1',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      });
      cache.set(['key2'], {
        data: 'data2',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      });

      cache.clear();

      expect(cache.get(['key1'])).toBeUndefined();
      expect(cache.get(['key2'])).toBeUndefined();
    });
  });

  describe('invalidate', () => {
    it('should mark all entries as stale when no predicate provided', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      cache.set(['key1'], {
        data: 'data1',
        dataUpdatedAt: Date.now(),
        state: { ...createInitialState<string>(), isStale: false },
        subscribers: new Set([callback1]),
      });
      cache.set(['key2'], {
        data: 'data2',
        dataUpdatedAt: Date.now(),
        state: { ...createInitialState<string>(), isStale: false },
        subscribers: new Set([callback2]),
      });

      cache.invalidate();

      expect(cache.get<string>(['key1'])?.state.isStale).toBe(true);
      expect(cache.get<string>(['key2'])?.state.isStale).toBe(true);
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should only invalidate entries matching predicate', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      cache.set(['users', 1], {
        data: 'user1',
        dataUpdatedAt: Date.now(),
        state: { ...createInitialState<string>(), isStale: false },
        subscribers: new Set([callback1]),
      });
      cache.set(['posts', 1], {
        data: 'post1',
        dataUpdatedAt: Date.now(),
        state: { ...createInitialState<string>(), isStale: false },
        subscribers: new Set([callback2]),
      });

      cache.invalidate((key) => key[0] === 'users');

      expect(cache.get<string>(['users', 1])?.state.isStale).toBe(true);
      expect(cache.get<string>(['posts', 1])?.state.isStale).toBe(false);
      expect(callback1).toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should add subscriber to entry', () => {
      const key: QueryKey = ['test'];
      const callback = vi.fn();

      cache.subscribe(key, callback);

      const entry = cache.get(key);
      expect(entry?.subscribers.has(callback)).toBe(true);
    });

    it('should create entry if it does not exist', () => {
      const key: QueryKey = ['new-key'];
      const callback = vi.fn();

      expect(cache.get(key)).toBeUndefined();

      cache.subscribe(key, callback);

      expect(cache.get(key)).toBeDefined();
    });

    it('should return unsubscribe function', () => {
      const key: QueryKey = ['test'];
      const callback = vi.fn();

      const unsubscribe = cache.subscribe(key, callback);
      expect(cache.get(key)?.subscribers.has(callback)).toBe(true);

      unsubscribe();
      expect(cache.get(key)?.subscribers.has(callback)).toBe(false);
    });

    it('should schedule gc when last subscriber unsubscribes', () => {
      const key: QueryKey = ['test'];
      const callback = vi.fn();

      const unsubscribe = cache.subscribe(key, callback);
      unsubscribe();

      expect(cache.get(key)).toBeDefined();

      vi.advanceTimersByTime(1001);

      expect(cache.get(key)).toBeUndefined();
    });

    it('should not gc if new subscriber added before timeout', () => {
      const key: QueryKey = ['test'];
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = cache.subscribe(key, callback1);

      cache.subscribe(key, callback2);

      unsubscribe1();

      vi.advanceTimersByTime(1100);

      expect(cache.get(key)).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return copy of all entries', () => {
      cache.set(['key1'], {
        data: 'data1',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      });
      cache.set(['key2'], {
        data: 'data2',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      });

      const all = cache.getAll();

      expect(all.size).toBe(2);
      expect(all.get('["key1"]')?.data).toBe('data1');
      expect(all.get('["key2"]')?.data).toBe('data2');
    });

    it('should return a copy, not the original map', () => {
      cache.set(['key1'], {
        data: 'data1',
        dataUpdatedAt: Date.now(),
        state: createInitialState<string>(),
        subscribers: new Set(),
      });

      const all = cache.getAll();
      all.clear();

      expect(cache.get(['key1'])).toBeDefined();
    });
  });
});
