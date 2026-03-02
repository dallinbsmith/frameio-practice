'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { useIntersectionObserver } from '@/lib/performance';

import type { AnimatedCounterProps } from '@/lib/animation/types';

const CounterSpan = styled.span`
  font-variant-numeric: tabular-nums;
`;

const easeOutQuart = (t: number): number => {
  return 1 - Math.pow(1 - t, 4);
};

const formatNumber = (value: number): string => {
  return Math.round(value).toLocaleString();
};

export const AnimatedCounter = ({
  from = 0,
  to,
  duration = 2000,
  delay = 0,
  formatter = formatNumber,
  className,
  triggerOnScroll = true,
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(from);
  const [hasStarted, setHasStarted] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = from + (to - from) * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    },
    [from, to, duration]
  );

  const startAnimation = useCallback(() => {
    if (hasStarted) return;

    setHasStarted(true);

    if (delay > 0) {
      setTimeout(() => {
        frameRef.current = requestAnimationFrame(animate);
      }, delay);
    } else {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [hasStarted, delay, animate]);

  const handleChange = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting && !hasStarted) {
        startAnimation();
      }
    },
    [hasStarted, startAnimation]
  );

  const { ref } = useIntersectionObserver({
    threshold: 0.5,
    freezeOnceVisible: true,
    onChange: handleChange,
  });

  useEffect(() => {
    if (!triggerOnScroll && !hasStarted) {
      startAnimation();
    }
  }, [triggerOnScroll, hasStarted, startAnimation]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (triggerOnScroll) {
    return (
      <CounterSpan ref={ref} className={className}>
        {formatter(displayValue)}
      </CounterSpan>
    );
  }

  return (
    <CounterSpan className={className}>{formatter(displayValue)}</CounterSpan>
  );
};

export default AnimatedCounter;
