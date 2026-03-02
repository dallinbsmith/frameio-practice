'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createInitialState, defaultQueryCache, hashKey } from './cache';

import type {
  CacheEntry,
  QueryCache,
  QueryOptions,
  QueryResult,
  QueryState,
} from './types';

const inFlightRequests = new Map<string, Promise<unknown>>();

const defaultRetryDelay = (attemptIndex: number): number => {
  return Math.min(1000 * 2 ** attemptIndex, 30000);
};

type UseQueryOptions<TData> = QueryOptions<TData> & {
  cache?: QueryCache;
};

export const useQuery = <TData>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 0,
  cacheTime = 5 * 60 * 1000,
  refetchOnMount = true,
  refetchOnWindowFocus = true,
  refetchInterval = false,
  retry = 3,
  retryDelay = defaultRetryDelay,
  onSuccess,
  onError,
  onSettled,
  placeholderData,
  initialData,
  select,
  cache = defaultQueryCache,
}: UseQueryOptions<TData>): QueryResult<TData> => {
  const keyHash = useMemo(() => hashKey(queryKey), [queryKey]);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const getInitialState = useCallback((): QueryState<TData> => {
    const cached = cache.get<TData>(queryKey);
    if (cached?.state) {
      return cached.state;
    }

    const initial =
      typeof initialData === 'function'
        ? (initialData as () => TData)()
        : initialData;

    if (initial !== undefined) {
      return {
        data: initial,
        error: null,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: null,
        isStale: true,
        fetchCount: 0,
      };
    }

    const placeholder =
      typeof placeholderData === 'function'
        ? (placeholderData as () => TData)()
        : placeholderData;

    if (placeholder !== undefined) {
      return {
        ...createInitialState<TData>(),
        data: placeholder,
      };
    }

    return createInitialState<TData>();
  }, [cache, queryKey, initialData, placeholderData]);

  const [state, setState] = useState<QueryState<TData>>(getInitialState);
  const [isFetching, setIsFetching] = useState(false);

  const updateState = useCallback((updates: Partial<QueryState<TData>>) => {
    if (!mountedRef.current) return;
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const executeQuery = useCallback(async (): Promise<TData | undefined> => {
    if (fetchingRef.current) {
      const existing = inFlightRequests.get(keyHash);
      if (existing) {
        return existing as Promise<TData>;
      }
    }

    fetchingRef.current = true;
    setIsFetching(true);

    const maxRetries = typeof retry === 'boolean' ? (retry ? 3 : 0) : retry;
    let lastError: Error | null = null;

    const fetchPromise = (async () => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const data = await queryFn();
          const selectedData = select ? select(data) : data;

          if (mountedRef.current) {
            const newState: QueryState<TData> = {
              data: selectedData,
              error: null,
              status: 'success',
              dataUpdatedAt: Date.now(),
              errorUpdatedAt: null,
              isStale: false,
              fetchCount: state.fetchCount + 1,
            };

            updateState(newState);

            const entry: CacheEntry<TData> = {
              data: selectedData,
              dataUpdatedAt: Date.now(),
              state: newState,
              subscribers: cache.get<TData>(queryKey)?.subscribers ?? new Set(),
            };
            cache.set(queryKey, entry);

            onSuccess?.(selectedData);
            onSettled?.(selectedData, null);
          }

          return selectedData;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          if (attempt < maxRetries) {
            const delay =
              typeof retryDelay === 'function'
                ? retryDelay(attempt)
                : retryDelay;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (mountedRef.current && lastError) {
        updateState({
          error: lastError,
          status: 'error',
          errorUpdatedAt: Date.now(),
          fetchCount: state.fetchCount + 1,
        });

        onError?.(lastError);
        onSettled?.(state.data, lastError);
      }

      return undefined;
    })();

    inFlightRequests.set(keyHash, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setIsFetching(false);
      }
      inFlightRequests.delete(keyHash);
    }
  }, [
    keyHash,
    queryFn,
    queryKey,
    retry,
    retryDelay,
    select,
    state.fetchCount,
    state.data,
    updateState,
    cache,
    onSuccess,
    onError,
    onSettled,
  ]);

  const refetch = useCallback(async (): Promise<void> => {
    await executeQuery();
  }, [executeQuery]);

  const remove = useCallback((): void => {
    cache.delete(queryKey);
    setState(createInitialState<TData>());
  }, [cache, queryKey]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const cached = cache.get<TData>(queryKey);
    const now = Date.now();
    const isStale =
      !cached?.dataUpdatedAt || now - cached.dataUpdatedAt > staleTime;

    if (refetchOnMount === 'always' || (refetchOnMount && isStale)) {
      if (state.status === 'idle' || isStale) {
        updateState({ status: 'loading' });
        executeQuery();
      }
    } else if (cached?.state) {
      setState(cached.state);
    }
  }, [
    enabled,
    queryKey,
    staleTime,
    refetchOnMount,
    cache,
    executeQuery,
    updateState,
    state.status,
  ]);

  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = (): void => {
      const cached = cache.get<TData>(queryKey);
      const now = Date.now();
      const isStale =
        !cached?.dataUpdatedAt || now - cached.dataUpdatedAt > staleTime;

      if (isStale) {
        executeQuery();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, refetchOnWindowFocus, queryKey, staleTime, cache, executeQuery]);

  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const interval = setInterval(() => {
      executeQuery();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [enabled, refetchInterval, executeQuery]);

  useEffect(() => {
    const unsubscribe = cache.subscribe(queryKey, () => {
      const entry = cache.get<TData>(queryKey);
      if (entry?.state) {
        setState(entry.state);
      }
    });

    return unsubscribe;
  }, [cache, queryKey]);

  useEffect(() => {
    return () => {
      const entry = cache.get<TData>(queryKey);
      if (entry && entry.subscribers.size === 0) {
        entry.gcTimeout = setTimeout(() => {
          cache.delete(queryKey);
        }, cacheTime);
      }
    };
  }, [cache, queryKey, cacheTime]);

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    isLoading: state.status === 'loading' && !state.data,
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    isFetching,
    isStale: state.isStale,
    refetch,
    remove,
  };
};
