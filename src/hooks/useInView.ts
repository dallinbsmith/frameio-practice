import { useCallback, useEffect, useRef, useState } from 'react';

type UseInViewOptions = {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  root?: Element | null;
};

type UseInViewReturn<T extends Element> = {
  ref: React.RefObject<T>;
  inView: boolean;
  hasBeenInView: boolean;
};

export const useInView = <T extends Element = HTMLDivElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> => {
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
    root = null,
  } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const isIntersecting = entry?.isIntersecting ?? false;

      setInView(isIntersecting);

      if (isIntersecting && !hasBeenInView) {
        setHasBeenInView(true);
      }
    },
    [hasBeenInView]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (triggerOnce && hasBeenInView) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      root,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    handleIntersection,
    threshold,
    rootMargin,
    root,
    triggerOnce,
    hasBeenInView,
  ]);

  return { ref, inView, hasBeenInView };
};
