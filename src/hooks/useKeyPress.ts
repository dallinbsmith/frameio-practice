import { useCallback, useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

type UseKeyPressOptions = {
  target?: Window | HTMLElement | null;
  enabled?: boolean;
};

export const useKeyPress = (
  key: string | string[],
  handler: KeyHandler,
  options: UseKeyPressOptions = {}
): void => {
  const {
    target = typeof window !== 'undefined' ? window : null,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.includes(event.key)) {
        handler(event);
      }
    },
    [key, handler]
  );

  useEffect(() => {
    if (!enabled || !target) return;

    const element = target as Window | HTMLElement;
    element.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [target, enabled, handleKeyDown]);
};
