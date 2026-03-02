'use client';

import { useCallback, useRef, useState } from 'react';

import { defaultQueryCache } from '../query/cache';

import type { UsePrefetchOptions, UsePrefetchReturn } from './types';
import type { CacheEntry, QueryCache } from '../query/types';

const createPrefetchState = <TData>(): CacheEntry<TData>['state'] => ({
  data: undefined,
  error: null,
  status: 'idle',
  dataUpdatedAt: null,
  errorUpdatedAt: null,
  isStale: true,
  fetchCount: 0,
});

export const usePrefetch = <TData>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000,
  enabled = true,
}: UsePrefetchOptions<TData> & {
  cache?: QueryCache;
}): UsePrefetchReturn & {
  onMouseEnter: () => void;
  onFocus: () => void;
} => {
  const cache = defaultQueryCache;
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const prefetchingRef = useRef(false);
  const prefetchedRef = useRef(false);

  const prefetch = useCallback(async () => {
    if (!enabled || prefetchingRef.current || prefetchedRef.current) {
      return;
    }

    const cached = cache.get<TData>(queryKey);
    const now = Date.now();

    if (cached?.dataUpdatedAt && now - cached.dataUpdatedAt < staleTime) {
      setIsPrefetched(true);
      prefetchedRef.current = true;
      return;
    }

    prefetchingRef.current = true;
    setIsPrefetching(true);

    try {
      const data = await queryFn();

      const entry: CacheEntry<TData> = {
        data,
        dataUpdatedAt: Date.now(),
        state: {
          ...createPrefetchState<TData>(),
          data,
          status: 'success',
          dataUpdatedAt: Date.now(),
        },
        subscribers: cached?.subscribers ?? new Set(),
      };

      cache.set(queryKey, entry);
      setIsPrefetched(true);
      prefetchedRef.current = true;
    } catch {
      // Silently fail prefetch - actual query will handle errors
    } finally {
      prefetchingRef.current = false;
      setIsPrefetching(false);
    }
  }, [enabled, queryKey, queryFn, staleTime, cache]);

  const onMouseEnter = useCallback(() => {
    prefetch();
  }, [prefetch]);

  const onFocus = useCallback(() => {
    prefetch();
  }, [prefetch]);

  return {
    prefetch,
    isPrefetching,
    isPrefetched,
    onMouseEnter,
    onFocus,
  };
};

export const createPrefetchHandler = <TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: { staleTime?: number; cache?: QueryCache }
): (() => Promise<void>) => {
  const { staleTime = 5 * 60 * 1000, cache = defaultQueryCache } =
    options ?? {};
  let prefetching = false;

  return async () => {
    if (prefetching) return;

    const cached = cache.get<TData>(queryKey);
    const now = Date.now();

    if (cached?.dataUpdatedAt && now - cached.dataUpdatedAt < staleTime) {
      return;
    }

    prefetching = true;

    try {
      const data = await queryFn();

      const entry: CacheEntry<TData> = {
        data,
        dataUpdatedAt: Date.now(),
        state: {
          ...createPrefetchState<TData>(),
          data,
          status: 'success',
          dataUpdatedAt: Date.now(),
        },
        subscribers: cached?.subscribers ?? new Set(),
      };

      cache.set(queryKey, entry);
    } catch {
      // Silently fail
    } finally {
      prefetching = false;
    }
  };
};
