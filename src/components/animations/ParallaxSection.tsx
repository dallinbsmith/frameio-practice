'use client';

import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '@/hooks';

import type { ReactNode, CSSProperties } from 'react';

type ParallaxSectionProps = {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
  style?: CSSProperties;
};

const Container = styled.div`
  position: relative;
  overflow: hidden;
`;

const Content = styled.div<{ $transform: string }>`
  transform: ${({ $transform }) => $transform};
  will-change: transform;
`;

export const ParallaxSection = ({
  children,
  speed = 0.5,
  direction = 'up',
  className,
  style,
}: ParallaxSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;

      const multiplier = direction === 'up' ? -1 : 1;
      const newOffset = distanceFromCenter * speed * multiplier * 0.1;

      setOffset(newOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction, reducedMotion]);

  const transform = reducedMotion ? 'none' : `translateY(${offset}px)`;

  return (
    <Container ref={containerRef} className={className} style={style}>
      <Content $transform={transform}>{children}</Content>
    </Container>
  );
};

export default ParallaxSection;
