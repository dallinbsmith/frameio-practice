'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useIntersectionObserver } from '@/lib/performance';

import { DURATIONS, EASINGS, getAnimationPreset } from './presets';

import type {
  AnimationDirection,
  AnimationType,
  UseScrollAnimationOptions,
  UseScrollAnimationReturn,
} from './types';

export const useScrollAnimation = (
  animation: AnimationType = 'fadeSlide',
  direction: AnimationDirection = 'up',
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    disabled = false,
  } = options;

  const hasAnimatedRef = useRef(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleChange = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (
        entry.isIntersecting &&
        !hasAnimatedRef.current &&
        triggerOnce &&
        !disabled
      ) {
        hasAnimatedRef.current = true;
        setHasAnimated(true);
      }
    },
    [triggerOnce, disabled]
  );

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: triggerOnce,
    onChange: handleChange,
  });

  const preset = useMemo(
    () => getAnimationPreset(animation, direction),
    [animation, direction]
  );

  const isVisible = disabled || isIntersecting || hasAnimated;

  const style = useMemo((): React.CSSProperties => {
    if (disabled) {
      return preset.animate;
    }

    const baseStyle = isVisible ? preset.animate : preset.initial;
    const duration = preset.transition?.duration ?? DURATIONS.moderate;
    const easing = preset.transition?.easing ?? EASINGS.easeOutExpo;

    return {
      ...baseStyle,
      transition: `all ${duration}ms ${easing}`,
      transitionDelay: `${delay}ms`,
    };
  }, [isVisible, preset, delay, disabled]);

  return {
    ref,
    isVisible,
    hasAnimated,
    style,
  };
};

export type UseScrollAnimationWithStaggerOptions = UseScrollAnimationOptions & {
  stagger?: number;
  count: number;
};

export const useScrollAnimationWithStagger = (
  animation: AnimationType = 'fadeSlide',
  direction: AnimationDirection = 'up',
  options: UseScrollAnimationWithStaggerOptions
): {
  ref: (node: Element | null) => void;
  isVisible: boolean;
  getItemStyle: (index: number) => React.CSSProperties;
} => {
  const { stagger = 100, count, delay = 0, ...rest } = options;

  const {
    ref,
    isVisible,
    style: _baseStyle,
  } = useScrollAnimation(animation, direction, { ...rest, delay: 0 });

  const preset = useMemo(
    () => getAnimationPreset(animation, direction),
    [animation, direction]
  );

  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => {
      if (rest.disabled) {
        return preset.animate;
      }

      const itemDelay = delay + index * stagger;
      const currentStyle = isVisible ? preset.animate : preset.initial;
      const duration = preset.transition?.duration ?? DURATIONS.moderate;
      const easing = preset.transition?.easing ?? EASINGS.easeOutExpo;

      return {
        ...currentStyle,
        transition: `all ${duration}ms ${easing}`,
        transitionDelay: `${itemDelay}ms`,
      };
    },
    [isVisible, preset, delay, stagger, rest.disabled]
  );

  return {
    ref,
    isVisible,
    getItemStyle,
  };
};
