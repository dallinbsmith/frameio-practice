import { useCallback, useEffect, useState } from 'react';

type ScrollPosition = {
  x: number;
  y: number;
  direction: 'up' | 'down' | null;
  isAtTop: boolean;
  isAtBottom: boolean;
  progress: number;
};

type UseScrollPositionOptions = {
  throttleMs?: number;
};

export const useScrollPosition = (
  options: UseScrollPositionOptions = {}
): ScrollPosition => {
  const { throttleMs = 16 } = options;

  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
    isAtTop: true,
    isAtBottom: false,
    progress: 0,
  });

  const handleScroll = useCallback(() => {
    const x = window.scrollX;
    const y = window.scrollY;
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? y / documentHeight : 0;

    setScrollPosition((prev) => ({
      x,
      y,
      direction: y > prev.y ? 'down' : y < prev.y ? 'up' : prev.direction,
      isAtTop: y <= 0,
      isAtBottom: y >= documentHeight - 1,
      progress: Math.min(1, Math.max(0, progress)),
    }));
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastRun = 0;

    const throttledHandler = () => {
      const now = Date.now();
      const elapsed = now - lastRun;

      if (elapsed >= throttleMs) {
        lastRun = now;
        handleScroll();
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastRun = Date.now();
          handleScroll();
          timeoutId = null;
        }, throttleMs - elapsed);
      }
    };

    handleScroll();

    window.addEventListener('scroll', throttledHandler, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledHandler);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll, throttleMs]);

  return scrollPosition;
};
