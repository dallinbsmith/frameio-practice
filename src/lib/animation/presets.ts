'use client';

import type {
  AnimationDirection,
  AnimationPreset,
  AnimationType,
  SpringConfig,
} from './types';

export const DURATIONS = {
  instant: 75,
  fast: 150,
  normal: 200,
  moderate: 300,
  slow: 500,
  slower: 700,
} as const;

export const EASINGS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  springSoft: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const SPRING_CONFIGS: Record<string, SpringConfig> = {
  default: { stiffness: 100, damping: 10, mass: 1 },
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  stiff: { stiffness: 210, damping: 20, mass: 1 },
  slow: { stiffness: 280, damping: 60, mass: 1 },
  molasses: { stiffness: 280, damping: 120, mass: 1 },
};

const TRANSLATE_VALUES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const getTranslateForDirection = (
  direction: AnimationDirection,
  distance: number = TRANSLATE_VALUES.md
): { x: number; y: number } => {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance };
    case 'down':
      return { x: 0, y: -distance };
    case 'left':
      return { x: distance, y: 0 };
    case 'right':
      return { x: -distance, y: 0 };
  }
};

export const createFadePreset = (): AnimationPreset => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATIONS.normal, easing: EASINGS.easeOutCubic },
});

export const createSlidePreset = (
  direction: AnimationDirection
): AnimationPreset => {
  const { x, y } = getTranslateForDirection(direction);
  return {
    initial: { transform: `translate(${x}px, ${y}px)` },
    animate: { transform: 'translate(0, 0)' },
    exit: { transform: `translate(${x}px, ${y}px)` },
    transition: { duration: DURATIONS.moderate, easing: EASINGS.easeOutExpo },
  };
};

export const createScalePreset = (): AnimationPreset => ({
  initial: { transform: 'scale(0.95)', opacity: 0 },
  animate: { transform: 'scale(1)', opacity: 1 },
  exit: { transform: 'scale(0.95)', opacity: 0 },
  transition: { duration: DURATIONS.normal, easing: EASINGS.springSoft },
});

export const createFadeSlidePreset = (
  direction: AnimationDirection
): AnimationPreset => {
  const { x, y } = getTranslateForDirection(direction);
  return {
    initial: { opacity: 0, transform: `translate(${x}px, ${y}px)` },
    animate: { opacity: 1, transform: 'translate(0, 0)' },
    exit: { opacity: 0, transform: `translate(${x}px, ${y}px)` },
    transition: { duration: DURATIONS.moderate, easing: EASINGS.easeOutExpo },
  };
};

export const createFadeScalePreset = (): AnimationPreset => ({
  initial: { opacity: 0, transform: 'scale(0.9)' },
  animate: { opacity: 1, transform: 'scale(1)' },
  exit: { opacity: 0, transform: 'scale(0.9)' },
  transition: { duration: DURATIONS.normal, easing: EASINGS.springSoft },
});

export const getAnimationPreset = (
  type: AnimationType,
  direction: AnimationDirection = 'up'
): AnimationPreset => {
  switch (type) {
    case 'fade':
      return createFadePreset();
    case 'slide':
      return createSlidePreset(direction);
    case 'scale':
      return createScalePreset();
    case 'fadeSlide':
      return createFadeSlidePreset(direction);
    case 'fadeScale':
      return createFadeScalePreset();
  }
};

export const getStaggerDelay = (
  index: number,
  staggerMs: number = 100,
  baseDelayMs: number = 0
): number => {
  return baseDelayMs + index * staggerMs;
};
