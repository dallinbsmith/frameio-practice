import { useEffect, useState, useRef, useCallback } from 'react';

export const useThrottle = <T>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastExecuted.current;

    if (elapsed >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
      return;
    }

    const timerId = setTimeout(() => {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    }, interval - elapsed);

    return () => clearTimeout(timerId);
  }, [value, interval]);

  return throttledValue;
};

export const useThrottledCallback = <
  T extends (...args: Parameters<T>) => void,
>(
  callback: T,
  interval: number
): ((...args: Parameters<T>) => void) => {
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastExecuted.current;

      if (elapsed >= interval) {
        lastExecuted.current = now;
        callbackRef.current(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastExecuted.current = Date.now();
          callbackRef.current(...args);
          timeoutRef.current = null;
        }, interval - elapsed);
      }
    },
    [interval]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};
