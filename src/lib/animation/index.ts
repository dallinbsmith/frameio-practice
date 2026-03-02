'use client';

export {
  useScrollAnimation,
  useScrollAnimationWithStagger,
} from './useScrollAnimation';
export { useParallax, useParallaxLayers } from './useParallax';
export { useSpring, useSpringValue } from './useSpring';

export {
  DURATIONS,
  EASINGS,
  SPRING_CONFIGS,
  getAnimationPreset,
  getStaggerDelay,
  createFadePreset,
  createSlidePreset,
  createScalePreset,
  createFadeSlidePreset,
  createFadeScalePreset,
} from './presets';

export type {
  AnimationDirection,
  AnimationType,
  AnimationPreset,
  TransitionConfig,
  UseScrollAnimationOptions,
  UseScrollAnimationReturn,
  UseParallaxOptions,
  UseParallaxReturn,
  SpringConfig,
  UseSpringOptions,
  UseSpringReturn,
  UseStaggerOptions,
  AnimateOnScrollProps,
  AnimatedCounterProps,
  TypeWriterProps,
  StaggeredListProps,
  ParallaxContainerProps,
  PageTransitionProps,
} from './types';
