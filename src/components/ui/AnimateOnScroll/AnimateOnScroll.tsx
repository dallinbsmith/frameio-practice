'use client';

import { createElement, forwardRef, useMemo } from 'react';
import styled from 'styled-components';

import { useScrollAnimation } from '@/lib/animation/useScrollAnimation';

import type { AnimateOnScrollProps } from '@/lib/animation/types';

const AnimatedWrapper = styled.div`
  will-change: transform, opacity;
`;

export const AnimateOnScroll = forwardRef<HTMLElement, AnimateOnScrollProps>(
  (
    {
      children,
      animation = 'fadeSlide',
      direction = 'up',
      duration,
      delay = 0,
      threshold = 0.1,
      triggerOnce = true,
      className,
      as = 'div',
    },
    forwardedRef
  ) => {
    const { ref, style: animationStyle } = useScrollAnimation(
      animation,
      direction,
      {
        threshold,
        triggerOnce,
        delay,
      }
    );

    const combinedStyle = useMemo(() => {
      if (duration) {
        return {
          ...animationStyle,
          transitionDuration: `${duration}ms`,
        };
      }
      return animationStyle;
    }, [animationStyle, duration]);

    const setRefs = (node: HTMLElement | null) => {
      ref(node);
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    if (as === 'div') {
      return (
        <AnimatedWrapper
          ref={setRefs as React.Ref<HTMLDivElement>}
          className={className}
          style={combinedStyle}
        >
          {children}
        </AnimatedWrapper>
      );
    }

    return createElement(
      as,
      {
        ref: setRefs,
        className,
        style: combinedStyle,
      },
      children
    );
  }
);

AnimateOnScroll.displayName = 'AnimateOnScroll';

export default AnimateOnScroll;
