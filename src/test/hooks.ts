import { act, renderHook, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';

import type { AsyncTestOptions } from './types';
import type { ReactNode } from 'react';

type HookRenderOptions<P> = {
  initialProps?: P | undefined;
  wrapper?: React.ComponentType<{ children: ReactNode }> | undefined;
};

const renderHookWithSetup = <R, P>(
  hook: (props: P) => R,
  options: HookRenderOptions<P> = {}
) => {
  const result = renderHook(hook, {
    initialProps: options.initialProps,
    wrapper: options.wrapper,
  });

  return {
    ...result,
    waitForValueToChange: async (
      selector: (current: R) => unknown,
      opts: AsyncTestOptions = {}
    ) => {
      const initialValue = selector(result.result.current);
      await waitFor(
        () => {
          const currentValue = selector(result.result.current);
          if (currentValue === initialValue) {
            throw new Error('Value has not changed');
          }
        },
        {
          timeout: opts.timeout ?? 1000,
          interval: opts.interval ?? 50,
        }
      );
    },
    waitForNextUpdate: async (opts: AsyncTestOptions = {}) => {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, opts.timeout ?? 0));
      });
    },
    actAsync: async (callback: () => Promise<void>) => {
      await act(async () => {
        await callback();
      });
    },
  };
};

type MockHookState<T> = {
  value: T;
  setValue: (newValue: T | ((prev: T) => T)) => void;
  history: T[];
  reset: () => void;
};

const createMockHookState = <T>(initialValue: T): MockHookState<T> => {
  let value = initialValue;
  const history: T[] = [initialValue];

  return {
    get value() {
      return value;
    },
    setValue: (newValue) => {
      value =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;
      history.push(value);
    },
    history,
    reset: () => {
      value = initialValue;
      history.length = 0;
      history.push(initialValue);
    },
  };
};

type UseStateSpyResult<T> = {
  states: T[];
  setters: Array<T | ((prev: T) => T)>;
};

const spyOnUseState = <T>(initialValue: T): UseStateSpyResult<T> => {
  const result: UseStateSpyResult<T> = {
    states: [initialValue],
    setters: [],
  };

  return result;
};

const createHookTestHarness = <Props, Result>(
  useHook: (props: Props) => Result
) => {
  type HarnessOptions = {
    initialProps: Props;
    wrapper?: React.ComponentType<{ children: ReactNode }> | undefined;
  };

  return (options: HarnessOptions) => {
    const rendered = renderHookWithSetup(useHook, {
      initialProps: options.initialProps,
      wrapper: options.wrapper,
    });

    return {
      ...rendered,
      getCurrent: () => rendered.result.current,
      updateProps: (newProps: Partial<Props>) => {
        rendered.rerender({ ...options.initialProps, ...newProps } as Props);
      },
    };
  };
};

const useTestEffect = <T>(
  callback: () => T | Promise<T>,
  deps: unknown[] = []
): {
  result: T | undefined;
  error: Error | null;
  isLoading: boolean;
} => {
  const [result, setResult] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const execute = async () => {
      try {
        const value = await callback();
        setResult(value);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { result, error, isLoading };
};

type EffectTracker = {
  mountCount: number;
  unmountCount: number;
  updateCount: number;
  lastDeps: unknown[] | undefined;
};

const createEffectTracker = (): EffectTracker & {
  track: (deps?: unknown[]) => () => void;
  reset: () => void;
} => {
  const tracker: EffectTracker = {
    mountCount: 0,
    unmountCount: 0,
    updateCount: 0,
    lastDeps: undefined,
  };

  return {
    ...tracker,
    get mountCount() {
      return tracker.mountCount;
    },
    get unmountCount() {
      return tracker.unmountCount;
    },
    get updateCount() {
      return tracker.updateCount;
    },
    get lastDeps() {
      return tracker.lastDeps;
    },
    track: (deps?: unknown[]) => {
      tracker.mountCount += 1;
      tracker.lastDeps = deps;

      return () => {
        tracker.unmountCount += 1;
      };
    },
    reset: () => {
      tracker.mountCount = 0;
      tracker.unmountCount = 0;
      tracker.updateCount = 0;
      tracker.lastDeps = undefined;
    },
  };
};

const waitForHookToSettle = async <R>(
  result: { current: R },
  predicate: (value: R) => boolean,
  options: AsyncTestOptions = {}
): Promise<void> => {
  const { timeout = 1000, interval = 50 } = options;

  await waitFor(
    () => {
      if (!predicate(result.current)) {
        throw new Error('Hook has not settled');
      }
    },
    { timeout, interval }
  );
};

const createAsyncHookTester = <T>() => {
  type AsyncResult = {
    data: T | null;
    loading: boolean;
    error: Error | null;
  };

  const useAsyncTest = (asyncFn: () => Promise<T>): AsyncResult => {
    const [state, setState] = useState<AsyncResult>({
      data: null,
      loading: true,
      error: null,
    });

    useEffect(() => {
      let mounted = true;

      asyncFn()
        .then((data) => {
          if (mounted) {
            setState({ data, loading: false, error: null });
          }
        })
        .catch((error) => {
          if (mounted) {
            setState({
              data: null,
              loading: false,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        });

      return () => {
        mounted = false;
      };
    }, [asyncFn]);

    return state;
  };

  return useAsyncTest;
};

export {
  createAsyncHookTester,
  createEffectTracker,
  createHookTestHarness,
  createMockHookState,
  renderHookWithSetup,
  spyOnUseState,
  useTestEffect,
  waitForHookToSettle,
};

export type {
  EffectTracker,
  HookRenderOptions,
  MockHookState,
  UseStateSpyResult,
};
