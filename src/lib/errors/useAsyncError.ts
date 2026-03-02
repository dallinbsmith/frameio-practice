'use client';

import { useCallback, useState } from 'react';

export const useAsyncError = (): ((error: Error) => void) => {
  const [, setError] = useState<Error>();

  return useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

export const useThrowError = (): {
  throwError: (error: Error) => void;
  clearError: () => void;
  error: Error | null;
} => {
  const [error, setError] = useState<Error | null>(null);

  const throwError = useCallback((err: Error) => {
    setError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return { throwError, clearError, error };
};

type AsyncState<T> =
  | { status: 'idle'; data: undefined; error: undefined }
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error };

export const useAsyncState = <T>(): {
  state: AsyncState<T>;
  setLoading: () => void;
  setSuccess: (data: T) => void;
  setError: (error: Error) => void;
  reset: () => void;
} => {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: undefined,
    error: undefined,
  });

  const setLoading = useCallback(() => {
    setState({ status: 'loading', data: undefined, error: undefined });
  }, []);

  const setSuccess = useCallback((data: T) => {
    setState({ status: 'success', data, error: undefined });
  }, []);

  const setError = useCallback((error: Error) => {
    setState({ status: 'error', data: undefined, error });
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: undefined, error: undefined });
  }, []);

  return { state, setLoading, setSuccess, setError, reset };
};

type UseAsyncCallbackOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  throwOnError?: boolean;
};

export const useAsyncCallback = <T, Args extends unknown[]>(
  callback: (...args: Args) => Promise<T>,
  options: UseAsyncCallbackOptions<T> = {}
): {
  execute: (...args: Args) => Promise<T | undefined>;
  isLoading: boolean;
  error: Error | null;
  data: T | undefined;
  reset: () => void;
} => {
  const { onSuccess, onError, throwOnError = false } = options;
  const throwError = useAsyncError();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | undefined>(undefined);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await callback(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error(String(err));
        setError(normalizedError);
        onError?.(normalizedError);

        if (throwOnError) {
          throwError(normalizedError);
        }

        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [callback, onSuccess, onError, throwOnError, throwError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(undefined);
  }, []);

  return { execute, isLoading, error, data, reset };
};
