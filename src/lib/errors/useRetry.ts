'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { isRetryableError, normalizeError } from './errors';

import type { RetryState, UseRetryOptions, UseRetryReturn } from './types';

const DEFAULT_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};

const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number => {
  const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
  const jitter = delay * 0.1 * Math.random();
  return Math.min(delay + jitter, maxDelay);
};

export const useRetry = <T>(
  fn: () => Promise<T>,
  options: UseRetryOptions<T> = {}
): UseRetryReturn<T> => {
  const {
    maxAttempts = DEFAULT_CONFIG.maxAttempts,
    initialDelay = DEFAULT_CONFIG.initialDelay,
    maxDelay = DEFAULT_CONFIG.maxDelay,
    backoffFactor = DEFAULT_CONFIG.backoffFactor,
    retryCondition = isRetryableError,
    onRetry,
    onSuccess,
    onError,
    onGiveUp,
  } = options;

  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
    nextRetryIn: null,
  });
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setState({
      attempt: 0,
      isRetrying: false,
      lastError: null,
      nextRetryIn: null,
    });
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setState((prev) => ({
      ...prev,
      isRetrying: false,
      nextRetryIn: null,
    }));
    setIsLoading(false);
  }, []);

  const executeAttempt = useCallback(
    async (attempt: number): Promise<T | undefined> => {
      if (!mountedRef.current) return undefined;

      try {
        const result = await fn();

        if (!mountedRef.current) return undefined;

        setData(result);
        setError(null);
        setState({
          attempt,
          isRetrying: false,
          lastError: null,
          nextRetryIn: null,
        });
        setIsLoading(false);
        onSuccess?.(result);
        return result;
      } catch (err) {
        if (!mountedRef.current) return undefined;

        const normalizedError = normalizeError(err);
        setError(normalizedError);

        setState((prev) => ({
          ...prev,
          attempt,
          lastError: normalizedError,
        }));

        onError?.(normalizedError);

        const shouldRetry =
          attempt < maxAttempts && retryCondition(normalizedError, attempt);

        if (shouldRetry) {
          const delay = calculateDelay(
            attempt,
            initialDelay,
            maxDelay,
            backoffFactor
          );

          setState((prev) => ({
            ...prev,
            isRetrying: true,
            nextRetryIn: delay,
          }));

          onRetry?.(normalizedError, attempt);

          return new Promise((resolve) => {
            timeoutRef.current = setTimeout(async () => {
              if (!mountedRef.current) {
                resolve(undefined);
                return;
              }
              const result = await executeAttempt(attempt + 1);
              resolve(result);
            }, delay);
          });
        } else {
          setState((prev) => ({
            ...prev,
            isRetrying: false,
            nextRetryIn: null,
          }));
          setIsLoading(false);
          onGiveUp?.(normalizedError, attempt);
          return undefined;
        }
      }
    },
    [
      fn,
      maxAttempts,
      initialDelay,
      maxDelay,
      backoffFactor,
      retryCondition,
      onRetry,
      onSuccess,
      onError,
      onGiveUp,
    ]
  );

  const execute = useCallback(async (): Promise<T | undefined> => {
    reset();
    setIsLoading(true);
    abortControllerRef.current = new AbortController();
    return executeAttempt(1);
  }, [reset, executeAttempt]);

  return {
    execute,
    reset,
    cancel,
    state,
    data,
    error,
    isLoading,
  };
};

export const retryAsync = async <T>(
  fn: () => Promise<T>,
  options: Omit<UseRetryOptions<T>, 'onSuccess' | 'onError' | 'onGiveUp'> = {}
): Promise<T> => {
  const {
    maxAttempts = DEFAULT_CONFIG.maxAttempts,
    initialDelay = DEFAULT_CONFIG.initialDelay,
    maxDelay = DEFAULT_CONFIG.maxDelay,
    backoffFactor = DEFAULT_CONFIG.backoffFactor,
    retryCondition = isRetryableError,
    onRetry,
  } = options;

  let attempt = 1;
  let lastError: Error | null = null;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      lastError = normalizeError(err);

      const shouldRetry =
        attempt < maxAttempts && retryCondition(lastError, attempt);

      if (!shouldRetry) {
        throw lastError;
      }

      onRetry?.(lastError, attempt);

      const delay = calculateDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffFactor
      );
      await new Promise((resolve) => setTimeout(resolve, delay));

      attempt++;
    }
  }

  throw lastError ?? new Error('Retry failed');
};
