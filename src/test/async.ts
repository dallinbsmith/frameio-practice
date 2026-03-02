import { act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import type { AsyncTestOptions } from './types';

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const flushPromises = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const waitForCondition = async (
  condition: () => boolean,
  options: AsyncTestOptions = {}
): Promise<void> => {
  const { timeout = 1000, interval = 50 } = options;

  await waitFor(
    () => {
      if (!condition()) {
        throw new Error('Condition not met');
      }
    },
    { timeout, interval }
  );
};

const waitForValue = async <T>(
  getValue: () => T,
  expectedValue: T,
  options: AsyncTestOptions = {}
): Promise<void> => {
  await waitForCondition(() => getValue() === expectedValue, options);
};

const waitForElement = async (
  getElement: () => Element | null,
  options: AsyncTestOptions = {}
): Promise<Element> => {
  let element: Element | null = null;

  await waitFor(
    () => {
      element = getElement();
      if (!element) {
        throw new Error('Element not found');
      }
    },
    { timeout: options.timeout ?? 1000, interval: options.interval ?? 50 }
  );

  return element!;
};

const waitForElementToBeRemoved = async (
  getElement: () => Element | null,
  options: AsyncTestOptions = {}
): Promise<void> => {
  await waitFor(
    () => {
      const element = getElement();
      if (element) {
        throw new Error('Element still exists');
      }
    },
    { timeout: options.timeout ?? 1000, interval: options.interval ?? 50 }
  );
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  isResolved: () => boolean;
  isRejected: () => boolean;
  isPending: () => boolean;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  let status: 'pending' | 'resolved' | 'rejected' = 'pending';

  const promise = new Promise<T>((res, rej) => {
    resolve = (value: T) => {
      status = 'resolved';
      res(value);
    };
    reject = (reason?: unknown) => {
      status = 'rejected';
      rej(reason);
    };
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
    isResolved: () => status === 'resolved',
    isRejected: () => status === 'rejected',
    isPending: () => status === 'pending',
  };
};

type RetryOptions = {
  maxAttempts?: number | undefined;
  delay?: number | undefined;
  backoff?: number | undefined;
};

const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxAttempts = 3, delay: delayMs = 100, backoff = 2 } = options;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxAttempts) {
        await delay(delayMs * Math.pow(backoff, attempt - 1));
      }
    }
  }

  throw lastError;
};

const withTimeout = async <T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]);
};

type PromiseQueue = {
  add: <T>(fn: () => Promise<T>) => Promise<T>;
  waitForAll: () => Promise<void>;
  clear: () => void;
  size: () => number;
};

const createPromiseQueue = (): PromiseQueue => {
  const queue: Array<Promise<unknown>> = [];

  return {
    add: <T>(fn: () => Promise<T>): Promise<T> => {
      const promise = fn();
      queue.push(promise);
      promise.finally(() => {
        const index = queue.indexOf(promise);
        if (index > -1) {
          queue.splice(index, 1);
        }
      });
      return promise;
    },
    waitForAll: async () => {
      await Promise.all(queue);
    },
    clear: () => {
      queue.length = 0;
    },
    size: () => queue.length,
  };
};

const mockAsyncIterable = <T>(items: T[], delayMs = 0): AsyncIterable<T> => ({
  [Symbol.asyncIterator]: async function* () {
    for (const item of items) {
      if (delayMs > 0) {
        await delay(delayMs);
      }
      yield item;
    }
  },
});

const collectAsyncIterable = async <T>(
  iterable: AsyncIterable<T>
): Promise<T[]> => {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
};

type MockTimer = {
  now: () => number;
  advance: (ms: number) => void;
  set: (timestamp: number) => void;
  reset: () => void;
};

const createMockTimer = (initialTime = Date.now()): MockTimer => {
  let currentTime = initialTime;

  vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

  return {
    now: () => currentTime,
    advance: (ms: number) => {
      currentTime += ms;
    },
    set: (timestamp: number) => {
      currentTime = timestamp;
    },
    reset: () => {
      currentTime = initialTime;
    },
  };
};

const expectToResolve = async <T>(
  promise: Promise<T>,
  expected?: T
): Promise<T> => {
  const result = await promise;
  if (expected !== undefined) {
    expect(result).toEqual(expected);
  }
  return result;
};

const expectToReject = async (
  promise: Promise<unknown>,
  expectedError?: string | RegExp | Error
): Promise<Error> => {
  let resolved = false;
  let rejectionError: Error | undefined;

  try {
    await promise;
    resolved = true;
  } catch (err) {
    rejectionError = err instanceof Error ? err : new Error(String(err));
  }

  if (resolved) {
    throw new Error('Expected promise to reject, but it resolved');
  }

  const error = rejectionError!;

  if (expectedError) {
    if (typeof expectedError === 'string') {
      expect(error.message).toBe(expectedError);
    } else if (expectedError instanceof RegExp) {
      expect(error.message).toMatch(expectedError);
    } else if (expectedError instanceof Error) {
      expect(error.message).toBe(expectedError.message);
    }
  }

  return error;
};

const createAbortController = (): {
  controller: AbortController;
  signal: AbortSignal;
  abort: () => void;
  isAborted: () => boolean;
} => {
  const controller = new AbortController();
  return {
    controller,
    signal: controller.signal,
    abort: () => controller.abort(),
    isAborted: () => controller.signal.aborted,
  };
};

const waitForAbort = async (signal: AbortSignal): Promise<void> => {
  if (signal.aborted) return;

  return new Promise((resolve) => {
    signal.addEventListener('abort', () => resolve(), { once: true });
  });
};

export {
  collectAsyncIterable,
  createAbortController,
  createDeferred,
  createMockTimer,
  createPromiseQueue,
  delay,
  expectToReject,
  expectToResolve,
  flushPromises,
  mockAsyncIterable,
  retry,
  waitForAbort,
  waitForCondition,
  waitForElement,
  waitForElementToBeRemoved,
  waitForValue,
  withTimeout,
};

export type { Deferred, MockTimer, PromiseQueue, RetryOptions };
