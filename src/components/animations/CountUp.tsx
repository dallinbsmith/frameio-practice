'use client';

import { useState, useEffect, useRef } from 'react';

import { useInView, useReducedMotion } from '@/hooks';

type CountUpProps = {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string | undefined;
  suffix?: string | undefined;
  separator?: string;
  className?: string;
};

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

const formatNumber = (
  num: number,
  decimals: number,
  separator: string
): string => {
  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  const whole = parts[0] ?? '0';
  const decimal = parts[1];
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decimal ? `${formatted}.${decimal}` : formatted;
};

export const CountUp = ({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className,
}: CountUpProps) => {
  const [count, setCount] = useState(start);
  const { ref, hasBeenInView } = useInView<HTMLSpanElement>({
    threshold: 0.5,
    triggerOnce: true,
  });
  const reducedMotion = useReducedMotion();
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!hasBeenInView) return;

    if (reducedMotion) {
      setCount(end);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = start + (end - start) * easedProgress;

      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [hasBeenInView, start, end, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(count, decimals, separator)}
      {suffix}
    </span>
  );
};

export default CountUp;
