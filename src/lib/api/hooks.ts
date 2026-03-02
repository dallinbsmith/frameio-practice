'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ApiError, RequestConfig } from './types';

type UseApiState<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isValidating: boolean;
};

type UseApiOptions<T> = {
  initialData?: T;
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
};

type UseApiReturn<T> = UseApiState<T> & {
  refetch: () => Promise<void>;
  mutate: (data: T | ((prev: T | null) => T)) => void;
};

export const useApi = <T>(
  fetcher: (config?: RequestConfig) => Promise<{ data: T }>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
  const {
    initialData = null,
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    error: null,
    isLoading: enabled && !initialData,
    isValidating: false,
  });

  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(
    async (isRevalidation = false) => {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        isLoading: !isRevalidation && !prev.data,
        isValidating: isRevalidation,
        error: null,
      }));

      try {
        const response = await fetcherRef.current();

        if (!mountedRef.current) return;

        setState({
          data: response.data,
          error: null,
          isLoading: false,
          isValidating: false,
        });

        onSuccess?.(response.data);
      } catch (error) {
        if (!mountedRef.current) return;

        const apiError = error as ApiError;
        setState((prev) => ({
          ...prev,
          error: apiError,
          isLoading: false,
          isValidating: false,
        }));

        onError?.(apiError);
      }
    },
    [onSuccess, onError]
  );

  const refetch = useCallback(async () => {
    await execute(true);
  }, [execute]);

  const mutate = useCallback((data: T | ((prev: T | null) => T)) => {
    setState((prev) => ({
      ...prev,
      data:
        typeof data === 'function'
          ? (data as (prev: T | null) => T)(prev.data)
          : data,
    }));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      execute(!!state.data);
    }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const intervalId = setInterval(() => {
      execute(true);
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, execute]);

  return {
    ...state,
    refetch,
    mutate,
  };
};

type MutationState<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
};

type UseMutationOptions<T, V> = {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: ApiError, variables: V) => void;
  onSettled?: (data: T | null, error: ApiError | null, variables: V) => void;
};

type UseMutationReturn<T, V> = MutationState<T> & {
  mutate: (variables: V) => Promise<T | null>;
  reset: () => void;
};

export const useMutation = <T, V = void>(
  mutationFn: (variables: V) => Promise<{ data: T }>,
  options: UseMutationOptions<T, V> = {}
): UseMutationReturn<T, V> => {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<MutationState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const mutationFnRef = useRef(mutationFn);
  mutationFnRef.current = mutationFn;

  const mutate = useCallback(
    async (variables: V): Promise<T | null> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const response = await mutationFnRef.current(variables);
        setState({ data: response.data, error: null, isLoading: false });
        onSuccess?.(response.data, variables);
        onSettled?.(response.data, null, variables);
        return response.data;
      } catch (error) {
        const apiError = error as ApiError;
        setState({ data: null, error: apiError, isLoading: false });
        onError?.(apiError, variables);
        onSettled?.(null, apiError, variables);
        return null;
      }
    },
    [onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};
