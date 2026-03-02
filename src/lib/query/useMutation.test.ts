import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialState } from './cache';
import { createTestCache } from './test-utils';
import { useMutation, useOptimisticMutation } from './useMutation';

import type { CacheEntry, QueryCache } from './types';

describe('useMutation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start in idle state', () => {
      const mutationFn = vi.fn();

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
        })
      );

      expect(result.current.status).toBe('idle');
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });
  });

  describe('mutate', () => {
    it('should execute mutation and return data', async () => {
      const mutationFn = vi.fn((name: string) =>
        Promise.resolve({ id: 1, name })
      );

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
        })
      );

      await act(async () => {
        result.current.mutate('test');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.data).toEqual({ id: 1, name: 'test' });
      expect(mutationFn).toHaveBeenCalledWith('test');
    });

    it('should handle errors', async () => {
      const error = new Error('Mutation failed');
      const mutationFn = vi.fn(() => Promise.reject(error));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          retry: false,
        })
      );

      await act(async () => {
        result.current.mutate(undefined);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe(error);
      expect(result.current.isError).toBe(true);
    });
  });

  describe('mutateAsync', () => {
    it('should return promise that resolves with data', async () => {
      const mutationFn = vi.fn((value: number) =>
        Promise.resolve({ result: value * 2 })
      );

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
        })
      );

      let data;
      await act(async () => {
        data = await result.current.mutateAsync(5);
      });

      expect(data).toEqual({ result: 10 });
    });

    it('should throw error on failure', async () => {
      const error = new Error('Async mutation failed');
      const mutationFn = vi.fn(() => Promise.reject(error));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          retry: false,
        })
      );

      await expect(
        act(async () => {
          await result.current.mutateAsync(undefined);
        })
      ).rejects.toThrow('Async mutation failed');
    });
  });

  describe('reset', () => {
    it('should reset state to idle', async () => {
      const mutationFn = vi.fn(() => Promise.resolve({ success: true }));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
        })
      );

      await act(async () => {
        result.current.mutate(undefined);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });
  });

  describe('callbacks', () => {
    it('should call onMutate before mutation', async () => {
      const onMutate = vi.fn((variables: string) => ({ backup: variables }));
      const mutationFn = vi.fn(() => Promise.resolve('success'));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          onMutate,
        })
      );

      await act(async () => {
        result.current.mutate('test-variable');
      });

      expect(onMutate).toHaveBeenCalledWith('test-variable');
    });

    it('should call onSuccess on successful mutation', async () => {
      const onSuccess = vi.fn();
      const mutationFn = vi.fn(() => Promise.resolve({ id: 1 }));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          onSuccess,
        })
      );

      await act(async () => {
        result.current.mutate('test');
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({ id: 1 }, 'test', undefined);
      });
    });

    it('should call onError on failed mutation', async () => {
      const error = new Error('Failed');
      const onError = vi.fn();
      const mutationFn = vi.fn(() => Promise.reject(error));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          onError,
          retry: false,
        })
      );

      await act(async () => {
        result.current.mutate('test');
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error, 'test', undefined);
      });
    });

    it('should call onSettled on success', async () => {
      const onSettled = vi.fn();
      const mutationFn = vi.fn(() => Promise.resolve('result'));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          onSettled,
        })
      );

      await act(async () => {
        result.current.mutate('test');
      });

      await waitFor(() => {
        expect(onSettled).toHaveBeenCalledWith(
          'result',
          null,
          'test',
          undefined
        );
      });
    });

    it('should call onSettled on error', async () => {
      const error = new Error('Failed');
      const onSettled = vi.fn();
      const mutationFn = vi.fn(() => Promise.reject(error));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          onSettled,
          retry: false,
        })
      );

      await act(async () => {
        result.current.mutate('test');
      });

      await waitFor(() => {
        expect(onSettled).toHaveBeenCalledWith(
          undefined,
          error,
          'test',
          undefined
        );
      });
    });

    it('should pass context from onMutate to callbacks', async () => {
      const context = { timestamp: Date.now() };
      const onMutate = vi.fn(() => context);
      const onSuccess = vi.fn();
      const mutationFn = vi.fn(() => Promise.resolve('result'));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn,
          onMutate,
          onSuccess,
        })
      );

      await act(async () => {
        result.current.mutate('test');
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('result', 'test', context);
      });
    });
  });
});

describe('useOptimisticMutation', () => {
  let cache: QueryCache;

  beforeEach(() => {
    cache = createTestCache();
  });

  afterEach(() => {
    cache.clear();
    vi.restoreAllMocks();
  });

  const setupCacheWithData = <TData>(key: string[], data: TData) => {
    const entry: CacheEntry<TData> = {
      data,
      dataUpdatedAt: Date.now(),
      state: {
        ...createInitialState<TData>(),
        data,
        status: 'success',
      },
      subscribers: new Set(),
    };
    cache.set(key, entry);
  };

  describe('optimistic updates', () => {
    it('should update cache optimistically', async () => {
      const queryKey = ['todos'];
      const initialData = [{ id: 1, text: 'Original', done: false }];
      setupCacheWithData(queryKey, initialData);

      const mutationFn = vi.fn((todo: { id: number; done: boolean }) =>
        Promise.resolve(todo)
      );

      const updateCache = vi.fn(
        (
          prev: typeof initialData | undefined,
          variables: { id: number; done: boolean }
        ) =>
          prev?.map((todo) =>
            todo.id === variables.id ? { ...todo, done: variables.done } : todo
          ) ?? []
      );

      const { result } = renderHook(() =>
        useOptimisticMutation({
          queryKey,
          mutationFn,
          updateCache,
          cache,
        })
      );

      act(() => {
        result.current.mutate({ id: 1, done: true });
      });

      const cachedAfterOptimistic = cache.get<typeof initialData>(queryKey);
      expect(cachedAfterOptimistic?.data?.[0].done).toBe(true);

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
    });

    it('should rollback on error', async () => {
      const queryKey = ['todos'];
      const initialData = [{ id: 1, text: 'Original', done: false }];
      setupCacheWithData(queryKey, initialData);

      const error = new Error('Failed');
      const mutationFn = vi.fn(() => Promise.reject(error));

      const updateCache = vi.fn(
        (
          prev: typeof initialData | undefined,
          variables: { id: number; done: boolean }
        ) =>
          prev?.map((todo) =>
            todo.id === variables.id ? { ...todo, done: variables.done } : todo
          ) ?? []
      );

      const { result } = renderHook(() =>
        useOptimisticMutation({
          queryKey,
          mutationFn,
          updateCache,
          retry: false,
          cache,
        })
      );

      await act(async () => {
        result.current.mutate({ id: 1, done: true });
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      const cachedAfterError = cache.get<typeof initialData>(queryKey);
      expect(cachedAfterError?.data?.[0].done).toBe(false);
    });

    it('should use custom rollbackCache function', async () => {
      const queryKey = ['todos'];
      const initialData = [{ id: 1, text: 'Original', done: false }];
      setupCacheWithData(queryKey, initialData);

      const error = new Error('Failed');
      const mutationFn = vi.fn(() => Promise.reject(error));

      const updateCache = vi.fn(
        (prev: typeof initialData | undefined) =>
          prev?.map((todo) => ({ ...todo, done: true })) ?? []
      );

      const rollbackCache = vi.fn(() => [
        { id: 1, text: 'Rolled Back', done: false },
      ]);

      const { result } = renderHook(() =>
        useOptimisticMutation({
          queryKey,
          mutationFn,
          updateCache,
          rollbackCache,
          retry: false,
          cache,
        })
      );

      await act(async () => {
        result.current.mutate({ id: 1, done: true });
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      const cachedAfterError = cache.get<typeof initialData>(queryKey);
      expect(cachedAfterError?.data?.[0].text).toBe('Rolled Back');
    });
  });

  describe('subscriber notification', () => {
    it('should notify subscribers on optimistic update', async () => {
      const queryKey = ['data'];
      const subscriber = vi.fn();

      const entry: CacheEntry<string> = {
        data: 'initial',
        dataUpdatedAt: Date.now(),
        state: {
          ...createInitialState<string>(),
          data: 'initial',
          status: 'success',
        },
        subscribers: new Set([subscriber]),
      };
      cache.set(queryKey, entry);

      const mutationFn = vi.fn(() => Promise.resolve('updated'));
      const updateCache = vi.fn(() => 'optimistic');

      const { result } = renderHook(() =>
        useOptimisticMutation({
          queryKey,
          mutationFn,
          updateCache,
          cache,
        })
      );

      act(() => {
        result.current.mutate(undefined);
      });

      expect(subscriber).toHaveBeenCalled();
    });
  });

  describe('handling missing cache entry', () => {
    it('should handle mutation when cache entry does not exist', async () => {
      const queryKey = ['non-existent'];
      const mutationFn = vi.fn(() => Promise.resolve('result'));
      const updateCache = vi.fn((prev) => prev ?? 'default');

      const { result } = renderHook(() =>
        useOptimisticMutation({
          queryKey,
          mutationFn,
          updateCache,
          cache,
        })
      );

      await act(async () => {
        result.current.mutate(undefined);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(updateCache).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});
