'use client';

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';
export type AnimationType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'fadeSlide'
  | 'fadeScale';

export type AnimationPreset = {
  initial: React.CSSProperties;
  animate: React.CSSProperties;
  exit?: React.CSSProperties;
  transition?: TransitionConfig;
};

export type TransitionConfig = {
  duration?: number;
  delay?: number;
  easing?: string;
};

export type UseScrollAnimationOptions = {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  disabled?: boolean;
};

export type UseScrollAnimationReturn = {
  ref: (node: Element | null) => void;
  isVisible: boolean;
  hasAnimated: boolean;
  style: React.CSSProperties;
};

export type UseParallaxOptions = {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  disabled?: boolean;
};

export type UseParallaxReturn = {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  offset: number;
};

export type SpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  precision?: number;
};

export type UseSpringOptions = {
  from: number;
  to: number;
  config?: SpringConfig | undefined;
  immediate?: boolean;
  onRest?: (() => void) | undefined;
};

export type UseSpringReturn = {
  value: number;
  isAnimating: boolean;
  set: (newValue: number) => void;
  stop: () => void;
  reset: () => void;
};

export type UseStaggerOptions = {
  stagger?: number;
  delay?: number;
  disabled?: boolean;
};

export type AnimateOnScrollProps = {
  children: React.ReactNode;
  animation?: AnimationType;
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export type AnimatedCounterProps = {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  formatter?: (value: number) => string;
  className?: string;
  triggerOnScroll?: boolean;
};

export type TypeWriterProps = {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
  className?: string;
};

export type StaggeredListProps = {
  children: React.ReactNode;
  stagger?: number;
  animation?: AnimationType;
  direction?: AnimationDirection;
  triggerOnScroll?: boolean;
  className?: string;
};

export type ParallaxContainerProps = {
  children: React.ReactNode;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  className?: string;
};

export type PageTransitionProps = {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  duration?: number;
};
