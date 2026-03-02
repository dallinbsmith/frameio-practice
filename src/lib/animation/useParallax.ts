'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { UseParallaxOptions, UseParallaxReturn } from './types';

export const useParallax = (
  options: UseParallaxOptions = {}
): UseParallaxReturn => {
  const { speed = 0.5, direction = 'vertical', disabled = false } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const ticking = useRef(false);

  const calculateOffset = useCallback(() => {
    if (!ref.current || disabled) {
      setOffset(0);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const windowCenter = windowHeight / 2;
    const distanceFromCenter = elementCenter - windowCenter;
    const normalizedDistance = distanceFromCenter / windowHeight;
    const parallaxOffset = normalizedDistance * speed * 100;

    setOffset(parallaxOffset);
  }, [speed, disabled]);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      calculateOffset();
      ticking.current = false;
    });
  }, [calculateOffset]);

  useEffect(() => {
    if (disabled) return;

    calculateOffset();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll, calculateOffset, disabled]);

  const style = useMemo((): React.CSSProperties => {
    if (disabled) {
      return {};
    }

    const transform =
      direction === 'vertical'
        ? `translateY(${offset}px)`
        : `translateX(${offset}px)`;

    return {
      transform,
      willChange: 'transform',
    };
  }, [offset, direction, disabled]);

  return {
    ref,
    style,
    offset,
  };
};

export type UseParallaxLayersOptions = {
  layers: number[];
  disabled?: boolean;
};

export const useParallaxLayers = (
  options: UseParallaxLayersOptions
): {
  containerRef: React.RefObject<HTMLDivElement>;
  getLayerStyle: (index: number) => React.CSSProperties;
} => {
  const { layers, disabled = false } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current || disabled) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const progress =
          1 - (rect.top + rect.height) / (windowHeight + rect.height);
        setScrollY(progress);
      }
      ticking.current = false;
    });
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, disabled]);

  const getLayerStyle = useCallback(
    (index: number): React.CSSProperties => {
      if (disabled || index >= layers.length) {
        return {};
      }

      const speed = layers[index] ?? 0;
      const offset = (scrollY - 0.5) * speed * 100;

      return {
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
      };
    },
    [layers, scrollY, disabled]
  );

  return {
    containerRef,
    getLayerStyle,
  };
};
