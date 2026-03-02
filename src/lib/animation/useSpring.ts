'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SPRING_CONFIGS } from './presets';

import type { SpringConfig, UseSpringOptions, UseSpringReturn } from './types';

const DEFAULT_CONFIG: Required<SpringConfig> = {
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  precision: 0.01,
};

const springStep = (
  current: number,
  target: number,
  velocity: number,
  config: Required<SpringConfig>,
  deltaTime: number
): { position: number; velocity: number } => {
  const { stiffness, damping, mass } = config;

  const springForce = -stiffness * (current - target);
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;

  const newVelocity = velocity + acceleration * deltaTime;
  const newPosition = current + newVelocity * deltaTime;

  return {
    position: newPosition,
    velocity: newVelocity,
  };
};

export const useSpring = (options: UseSpringOptions): UseSpringReturn => {
  const { from, to, config, immediate = false, onRest } = options;

  const resolvedConfig = useMemo(
    (): Required<SpringConfig> => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [
      config?.stiffness,
      config?.damping,
      config?.mass,
      config?.velocity,
      config?.precision,
    ]
  );

  const [value, setValue] = useState(immediate ? to : from);
  const [isAnimating, setIsAnimating] = useState(!immediate && from !== to);

  const targetRef = useRef(to);
  const velocityRef = useRef(resolvedConfig.velocity);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const onRestRef = useRef(onRest);

  useEffect(() => {
    onRestRef.current = onRest;
  }, [onRest]);

  const animate = useCallback(() => {
    const now = performance.now();
    const deltaTime = lastTimeRef.current
      ? (now - lastTimeRef.current) / 1000
      : 0.016;
    lastTimeRef.current = now;

    setValue((currentValue) => {
      const { position, velocity } = springStep(
        currentValue,
        targetRef.current,
        velocityRef.current,
        resolvedConfig,
        deltaTime
      );

      velocityRef.current = velocity;

      const isAtRest =
        Math.abs(position - targetRef.current) < resolvedConfig.precision &&
        Math.abs(velocity) < resolvedConfig.precision;

      if (isAtRest) {
        setIsAnimating(false);
        frameRef.current = null;
        lastTimeRef.current = null;
        onRestRef.current?.();
        return targetRef.current;
      }

      frameRef.current = requestAnimationFrame(animate);
      return position;
    });
  }, [resolvedConfig]);

  const startAnimation = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setIsAnimating(true);
    lastTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    if (to !== targetRef.current) {
      targetRef.current = to;
      if (!immediate) {
        startAnimation();
      } else {
        setValue(to);
        setIsAnimating(false);
      }
    }
  }, [to, immediate, startAnimation]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const set = useCallback(
    (newValue: number) => {
      targetRef.current = newValue;
      startAnimation();
    },
    [startAnimation]
  );

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setIsAnimating(false);
    velocityRef.current = 0;
    lastTimeRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setValue(from);
    targetRef.current = from;
  }, [from, stop]);

  return {
    value,
    isAnimating,
    set,
    stop,
    reset,
  };
};

export const useSpringValue = (
  target: number,
  configName: keyof typeof SPRING_CONFIGS = 'default'
): number => {
  const config = SPRING_CONFIGS[configName];
  const initialRef = useRef(target);

  const { value } = useSpring({
    from: initialRef.current,
    to: target,
    config,
  });

  return value;
};
