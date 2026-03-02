'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createInitialState, defaultQueryCache } from './cache';

import type {
  CacheEntry,
  InfiniteData,
  InfiniteQueryOptions,
  InfiniteQueryResult,
  QueryCache,
  QueryState,
} from './types';

type UseInfiniteQueryOptions<TData, TPageParam> = InfiniteQueryOptions<
  TData,
  TPageParam
> & {
  cache?: QueryCache;
};

export const useInfiniteQuery = <TData, TPageParam = number>({
  queryKey,
  queryFn,
  getNextPageParam,
  getPreviousPageParam,
  initialPageParam,
  enabled = true,
  staleTime = 0,
  refetchOnMount = true,
  retry = 3,
  onSuccess,
  onError,
  onSettled,
  cache = defaultQueryCache,
}: UseInfiniteQueryOptions<TData, TPageParam>): InfiniteQueryResult<TData> => {
  const mountedRef = useRef(true);

  type InfiniteState = QueryState<InfiniteData<TData>>;

  const [state, setState] = useState<InfiniteState>(() => {
    const cached = cache.get<InfiniteData<TData>>(queryKey);
    if (cached?.state) {
      return cached.state;
    }
    return createInitialState<InfiniteData<TData>>();
  });

  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isFetchingPreviousPage, setIsFetchingPreviousPage] = useState(false);

  const updateState = useCallback((updates: Partial<InfiniteState>) => {
    if (!mountedRef.current) return;
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const fetchPage = useCallback(
    async (
      pageParam: TPageParam,
      _direction: 'next' | 'previous' | 'initial'
    ): Promise<TData | undefined> => {
      const maxRetries = typeof retry === 'boolean' ? (retry ? 3 : 0) : retry;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const page = await queryFn({ pageParam });
          return page;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.min(1000 * 2 ** attempt, 30000))
            );
          }
        }
      }

      if (lastError) {
        throw lastError;
      }
      return undefined;
    },
    [queryFn, retry]
  );

  const fetchInitialPage = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    setIsFetching(true);
    updateState({ status: 'loading' });

    try {
      const firstPage = await fetchPage(initialPageParam, 'initial');
      if (!firstPage || !mountedRef.current) return;

      const data: InfiniteData<TData> = {
        pages: [firstPage],
        pageParams: [initialPageParam],
      };

      const newState: InfiniteState = {
        data,
        error: null,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: null,
        isStale: false,
        fetchCount: state.fetchCount + 1,
      };

      updateState(newState);

      const entry: CacheEntry<InfiniteData<TData>> = {
        data,
        dataUpdatedAt: Date.now(),
        state: newState,
        subscribers:
          cache.get<InfiniteData<TData>>(queryKey)?.subscribers ?? new Set(),
      };
      cache.set(queryKey, entry);

      onSuccess?.(data);
      onSettled?.(data, null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        updateState({
          error,
          status: 'error',
          errorUpdatedAt: Date.now(),
        });
        onError?.(error);
        onSettled?.(state.data, error);
      }
    } finally {
      if (mountedRef.current) {
        setIsFetching(false);
      }
    }
  }, [
    initialPageParam,
    fetchPage,
    state.fetchCount,
    state.data,
    updateState,
    cache,
    queryKey,
    onSuccess,
    onError,
    onSettled,
  ]);

  const fetchNextPage = useCallback(async (): Promise<void> => {
    if (!state.data || isFetchingNextPage || !mountedRef.current) return;
    if (state.data.pages.length === 0) return;

    const lastPage = state.data.pages[state.data.pages.length - 1] as TData;
    const nextPageParam = getNextPageParam(lastPage, state.data.pages);

    if (nextPageParam === undefined) return;

    setIsFetchingNextPage(true);
    setIsFetching(true);

    try {
      const nextPage = await fetchPage(nextPageParam, 'next');
      if (!nextPage || !mountedRef.current) return;

      const newData: InfiniteData<TData> = {
        pages: [...state.data.pages, nextPage],
        pageParams: [...state.data.pageParams, nextPageParam],
      };

      const newState: InfiniteState = {
        data: newData,
        error: null,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: null,
        isStale: false,
        fetchCount: state.fetchCount + 1,
      };

      updateState(newState);

      const entry: CacheEntry<InfiniteData<TData>> = {
        data: newData,
        dataUpdatedAt: Date.now(),
        state: newState,
        subscribers:
          cache.get<InfiniteData<TData>>(queryKey)?.subscribers ?? new Set(),
      };
      cache.set(queryKey, entry);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        updateState({
          error,
          status: 'error',
          errorUpdatedAt: Date.now(),
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsFetchingNextPage(false);
        setIsFetching(false);
      }
    }
  }, [
    state.data,
    state.fetchCount,
    isFetchingNextPage,
    getNextPageParam,
    fetchPage,
    updateState,
    cache,
    queryKey,
  ]);

  const fetchPreviousPage = useCallback(async (): Promise<void> => {
    if (
      !state.data ||
      !getPreviousPageParam ||
      isFetchingPreviousPage ||
      !mountedRef.current
    )
      return;
    if (state.data.pages.length === 0) return;

    const firstPage = state.data.pages[0] as TData;
    const prevPageParam = getPreviousPageParam(firstPage, state.data.pages);

    if (prevPageParam === undefined) return;

    setIsFetchingPreviousPage(true);
    setIsFetching(true);

    try {
      const prevPage = await fetchPage(prevPageParam, 'previous');
      if (!prevPage || !mountedRef.current) return;

      const newData: InfiniteData<TData> = {
        pages: [prevPage, ...state.data.pages],
        pageParams: [prevPageParam, ...state.data.pageParams],
      };

      const newState: InfiniteState = {
        data: newData,
        error: null,
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: null,
        isStale: false,
        fetchCount: state.fetchCount + 1,
      };

      updateState(newState);

      const entry: CacheEntry<InfiniteData<TData>> = {
        data: newData,
        dataUpdatedAt: Date.now(),
        state: newState,
        subscribers:
          cache.get<InfiniteData<TData>>(queryKey)?.subscribers ?? new Set(),
      };
      cache.set(queryKey, entry);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        updateState({
          error,
          status: 'error',
          errorUpdatedAt: Date.now(),
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsFetchingPreviousPage(false);
        setIsFetching(false);
      }
    }
  }, [
    state.data,
    state.fetchCount,
    isFetchingPreviousPage,
    getPreviousPageParam,
    fetchPage,
    updateState,
    cache,
    queryKey,
  ]);

  const refetch = useCallback(async (): Promise<void> => {
    await fetchInitialPage();
  }, [fetchInitialPage]);

  const remove = useCallback((): void => {
    cache.delete(queryKey);
    setState(createInitialState<InfiniteData<TData>>());
  }, [cache, queryKey]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const cached = cache.get<InfiniteData<TData>>(queryKey);
    const now = Date.now();
    const isStale =
      !cached?.dataUpdatedAt || now - cached.dataUpdatedAt > staleTime;

    if (refetchOnMount === 'always' || (refetchOnMount && isStale)) {
      if (state.status === 'idle' || isStale) {
        fetchInitialPage();
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
    fetchInitialPage,
    state.status,
  ]);

  const hasNextPage = useMemo(() => {
    if (!state.data || state.data.pages.length === 0) return false;
    const lastPage = state.data.pages[state.data.pages.length - 1] as TData;
    return getNextPageParam(lastPage, state.data.pages) !== undefined;
  }, [state.data, getNextPageParam]);

  const hasPreviousPage = useMemo(() => {
    if (!state.data || !getPreviousPageParam || state.data.pages.length === 0)
      return false;
    const firstPage = state.data.pages[0] as TData;
    return getPreviousPageParam(firstPage, state.data.pages) !== undefined;
  }, [state.data, getPreviousPageParam]);

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    isLoading: state.status === 'loading' && !state.data,
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    isFetching,
    isStale: state.isStale,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    refetch,
    remove,
  };
};
