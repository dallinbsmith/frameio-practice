'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { UseIdleCallbackOptions } from './types';

type IdleCallbackHandle = ReturnType<typeof requestIdleCallback>;

const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  const timeout = options?.timeout ?? 1;
  const start = Date.now();

  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, timeout) as unknown as number;
};

const cancelIdleCallbackPolyfill = (handle: number): void => {
  window.clearTimeout(handle);
};

const getRequestIdleCallback = (): typeof requestIdleCallback => {
  if (typeof window === 'undefined') {
    return (() => 0) as typeof requestIdleCallback;
  }
  return window.requestIdleCallback ?? requestIdleCallbackPolyfill;
};

const getCancelIdleCallback = (): typeof cancelIdleCallback => {
  if (typeof window === 'undefined') {
    return () => {};
  }
  return window.cancelIdleCallback ?? cancelIdleCallbackPolyfill;
};

export const useIdleCallback = (
  callback: () => void,
  options?: UseIdleCallbackOptions
): { cancel: () => void; request: () => void } => {
  const { timeout = 1000, disabled = false } = options ?? {};
  const handleRef = useRef<IdleCallbackHandle | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (handleRef.current !== null) {
      getCancelIdleCallback()(handleRef.current);
      handleRef.current = null;
    }
  }, []);

  const request = useCallback(() => {
    if (disabled) return;

    cancel();

    handleRef.current = getRequestIdleCallback()(
      () => {
        callbackRef.current();
        handleRef.current = null;
      },
      { timeout }
    );
  }, [disabled, timeout, cancel]);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { cancel, request };
};

export const useIdleEffect = (
  callback: () => void | (() => void),
  deps: React.DependencyList,
  options?: UseIdleCallbackOptions
): void => {
  const { timeout = 1000, disabled = false } = options ?? {};
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    if (disabled) return;

    const handle = getRequestIdleCallback()(
      () => {
        cleanupRef.current = callback();
      },
      { timeout }
    );

    return () => {
      getCancelIdleCallback()(handle);
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, timeout, ...deps]);
};

export const runWhenIdle = <T>(
  task: () => T,
  options?: { timeout?: number }
): Promise<T> => {
  return new Promise((resolve) => {
    getRequestIdleCallback()(
      () => {
        resolve(task());
      },
      { timeout: options?.timeout ?? 1000 }
    );
  });
};

export const batchIdleTasks = (
  tasks: Array<() => void>,
  options?: { timeout?: number; maxTasksPerFrame?: number }
): { start: () => void; cancel: () => void } => {
  const { timeout = 1000, maxTasksPerFrame = 5 } = options ?? {};
  let taskIndex = 0;
  let handle: IdleCallbackHandle | null = null;

  const processTasksInFrame = (deadline: IdleDeadline) => {
    let tasksProcessed = 0;

    while (
      taskIndex < tasks.length &&
      tasksProcessed < maxTasksPerFrame &&
      (deadline.timeRemaining() > 0 || deadline.didTimeout)
    ) {
      tasks[taskIndex]?.();
      taskIndex++;
      tasksProcessed++;
    }

    if (taskIndex < tasks.length) {
      handle = getRequestIdleCallback()(processTasksInFrame, { timeout });
    } else {
      handle = null;
    }
  };

  const start = () => {
    taskIndex = 0;
    handle = getRequestIdleCallback()(processTasksInFrame, { timeout });
  };

  const cancel = () => {
    if (handle !== null) {
      getCancelIdleCallback()(handle);
      handle = null;
    }
  };

  return { start, cancel };
};
