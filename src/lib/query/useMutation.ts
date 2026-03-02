'use client';

import { useCallback, useRef, useState } from 'react';

import { defaultQueryCache } from './cache';

import type { QueryCache, QueryKey } from './types';

type MutationStatus = 'idle' | 'loading' | 'success' | 'error';

type MutationState<TData> = {
  data: TData | undefined;
  error: Error | null;
  status: MutationStatus;
  variables: unknown | undefined;
};

type MutationOptions<TData, TVariables, TContext> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?:
    | ((variables: TVariables) => Promise<TContext | void> | TContext | void)
    | undefined;
  onSuccess?:
    | ((
        data: TData,
        variables: TVariables,
        context: TContext | undefined
      ) => Promise<void> | void)
    | undefined;
  onError?:
    | ((
        error: Error,
        variables: TVariables,
        context: TContext | undefined
      ) => Promise<void> | void)
    | undefined;
  onSettled?:
    | ((
        data: TData | undefined,
        error: Error | null,
        variables: TVariables,
        context: TContext | undefined
      ) => Promise<void> | void)
    | undefined;
  retry?: number | boolean | undefined;
  retryDelay?: number | ((attemptIndex: number) => number) | undefined;
};

type MutationResult<TData, TVariables> = {
  data: TData | undefined;
  error: Error | null;
  status: MutationStatus;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  variables: unknown | undefined;
  mutate: (
    variables: TVariables,
    options?: {
      onSuccess?: (data: TData) => void;
      onError?: (error: Error) => void;
      onSettled?: (data: TData | undefined, error: Error | null) => void;
    }
  ) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
};

const defaultRetryDelay = (attemptIndex: number): number => {
  return Math.min(1000 * 2 ** attemptIndex, 30000);
};

export const useMutation = <TData, TVariables, TContext = unknown>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
  retry = 0,
  retryDelay = defaultRetryDelay,
}: MutationOptions<TData, TVariables, TContext>): MutationResult<
  TData,
  TVariables
> => {
  const [state, setState] = useState<MutationState<TData>>({
    data: undefined,
    error: null,
    status: 'idle',
    variables: undefined,
  });

  const mountedRef = useRef(true);
  const contextRef = useRef<TContext | undefined>(undefined);

  const reset = useCallback(() => {
    setState({
      data: undefined,
      error: null,
      status: 'idle',
      variables: undefined,
    });
    contextRef.current = undefined;
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState((prev) => ({
        ...prev,
        status: 'loading',
        variables,
        error: null,
      }));

      try {
        const context = await onMutate?.(variables);
        contextRef.current = context as TContext | undefined;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            status: 'error',
            error,
          }));
        }
        throw error;
      }

      const maxRetries = typeof retry === 'boolean' ? (retry ? 3 : 0) : retry;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const data = await mutationFn(variables);

          if (mountedRef.current) {
            setState({
              data,
              error: null,
              status: 'success',
              variables,
            });
          }

          await onSuccess?.(data, variables, contextRef.current);
          await onSettled?.(data, null, variables, contextRef.current);

          return data;
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
        setState({
          data: undefined,
          error: lastError,
          status: 'error',
          variables,
        });
      }

      await onError?.(lastError!, variables, contextRef.current);
      await onSettled?.(undefined, lastError, variables, contextRef.current);

      throw lastError;
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled, retry, retryDelay]
  );

  const mutate = useCallback(
    (
      variables: TVariables,
      options?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: Error) => void;
        onSettled?: (data: TData | undefined, error: Error | null) => void;
      }
    ): void => {
      mutateAsync(variables)
        .then((data) => {
          options?.onSuccess?.(data);
          options?.onSettled?.(data, null);
        })
        .catch((error: Error) => {
          options?.onError?.(error);
          options?.onSettled?.(undefined, error);
        });
    },
    [mutateAsync]
  );

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    variables: state.variables,
    mutate,
    mutateAsync,
    reset,
  };
};

export const useOptimisticMutation = <TData, TVariables, TQueryData>({
  queryKey,
  mutationFn,
  updateCache,
  rollbackCache,
  cache = defaultQueryCache,
  ...options
}: Omit<
  MutationOptions<TData, TVariables, { previousData: TQueryData | undefined }>,
  'onMutate'
> & {
  queryKey: QueryKey;
  updateCache: (
    previousData: TQueryData | undefined,
    variables: TVariables
  ) => TQueryData;
  rollbackCache?: (
    previousData: TQueryData | undefined,
    variables: TVariables,
    error: Error
  ) => TQueryData | undefined;
  cache?: QueryCache;
}): MutationResult<TData, TVariables> => {
  return useMutation<
    TData,
    TVariables,
    { previousData: TQueryData | undefined }
  >({
    mutationFn,
    onMutate: async (variables) => {
      const entry = cache.get<TQueryData>(queryKey);
      const previousData = entry?.data;

      const optimisticData = updateCache(previousData, variables);

      if (entry) {
        cache.set(queryKey, {
          ...entry,
          data: optimisticData,
          state: {
            ...entry.state,
            data: optimisticData,
          },
        });
        entry.subscribers.forEach((callback) => callback());
      }

      return { previousData };
    },
    onError: async (error, variables, context) => {
      if (context?.previousData !== undefined || rollbackCache) {
        const entry = cache.get<TQueryData>(queryKey);
        if (entry) {
          const rollbackData = rollbackCache
            ? rollbackCache(context?.previousData, variables, error)
            : context?.previousData;

          cache.set(queryKey, {
            ...entry,
            data: rollbackData,
            state: {
              ...entry.state,
              data: rollbackData,
            },
          });
          entry.subscribers.forEach((callback) => callback());
        }
      }

      await options.onError?.(error, variables, context);
    },
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    retry: options.retry,
    retryDelay: options.retryDelay,
  });
};
