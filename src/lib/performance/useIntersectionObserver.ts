'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  UseIntersectionObserverOptions,
  UseIntersectionObserverReturn,
} from './types';

export const useIntersectionObserver = ({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  freezeOnceVisible = false,
  onChange,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [node, setNode] = useState<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const frozen = useRef(false);

  const ref = useCallback((newNode: Element | null) => {
    setNode(newNode);
  }, []);

  useEffect(() => {
    if (frozen.current && freezeOnceVisible) {
      return;
    }

    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [observerEntry] = entries;
        if (!observerEntry) return;

        setEntry(observerEntry);
        onChange?.(observerEntry);

        if (observerEntry.isIntersecting && freezeOnceVisible) {
          frozen.current = true;
          observerRef.current?.disconnect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(node);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [node, root, rootMargin, threshold, freezeOnceVisible, onChange]);

  const isIntersecting = entry?.isIntersecting ?? false;

  return {
    ref,
    entry,
    isIntersecting,
  };
};

export const useInView = (
  options?: UseIntersectionObserverOptions
): UseIntersectionObserverReturn => {
  return useIntersectionObserver(options);
};
