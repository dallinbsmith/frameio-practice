'use client';

import styled, { css, keyframes } from 'styled-components';

import { useInView, useReducedMotion } from '@/hooks';

import type { ReactNode, CSSProperties } from 'react';

type AnimationType =
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'
  | 'slideInFromBottom';

type AnimatedSectionProps = {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements;
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInFromBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const animationMap = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInFromBottom,
};

const Wrapper = styled.div<{
  $isVisible: boolean;
  $animation: AnimationType;
  $delay: number;
  $duration: number;
  $reducedMotion: boolean;
}>`
  ${({ $isVisible, $animation, $delay, $duration, $reducedMotion }) =>
    $reducedMotion
      ? css`
          opacity: ${$isVisible ? 1 : 0};
        `
      : css`
          opacity: 0;
          ${$isVisible &&
          css`
            animation: ${animationMap[$animation]} ${$duration}ms
              var(--ease-out-expo) ${$delay}ms forwards;
          `}
        `}
`;

export const AnimatedSection = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
  className,
  style,
  as,
}: AnimatedSectionProps) => {
  const { ref, hasBeenInView } = useInView<HTMLDivElement>({
    threshold,
    triggerOnce,
    rootMargin: '-50px 0px',
  });
  const reducedMotion = useReducedMotion();

  return (
    <Wrapper
      ref={ref}
      {...(as && { as })}
      className={className}
      style={style}
      $isVisible={hasBeenInView}
      $animation={animation}
      $delay={delay}
      $duration={duration}
      $reducedMotion={reducedMotion}
    >
      {children}
    </Wrapper>
  );
};

export default AnimatedSection;
