'use client';

import { Children, isValidElement } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { useInView, useReducedMotion } from '@/hooks';

import type { ReactNode, CSSProperties } from 'react';

type StaggeredChildrenProps = {
  children: ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  style?: CSSProperties;
};

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div``;

const AnimatedChild = styled.div<{
  $isVisible: boolean;
  $delay: number;
  $duration: number;
  $reducedMotion: boolean;
  $index: number;
}>`
  ${({ $isVisible, $delay, $duration, $reducedMotion }) =>
    $reducedMotion
      ? css`
          opacity: ${$isVisible ? 1 : 0};
        `
      : css`
          opacity: 0;
          ${$isVisible &&
          css`
            animation: ${fadeInUp} ${$duration}ms var(--ease-out-expo)
              ${$delay}ms forwards;
          `}
        `}
`;

export const StaggeredChildren = ({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  duration = 500,
  threshold = 0.1,
  triggerOnce = true,
  className,
  style,
}: StaggeredChildrenProps) => {
  const { ref, hasBeenInView } = useInView<HTMLDivElement>({
    threshold,
    triggerOnce,
    rootMargin: '-30px 0px',
  });
  const reducedMotion = useReducedMotion();

  const childArray = Children.toArray(children);

  return (
    <Container ref={ref} className={className} style={style}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        const delay = initialDelay + index * staggerDelay;

        return (
          <AnimatedChild
            key={index}
            $isVisible={hasBeenInView}
            $delay={delay}
            $duration={duration}
            $reducedMotion={reducedMotion}
            $index={index}
          >
            {child}
          </AnimatedChild>
        );
      })}
    </Container>
  );
};

export default StaggeredChildren;
