'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

const ProgressBar = styled.div<{ $isLoading: boolean; $isComplete: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--color-interactive-primary);
  z-index: calc(var(--z-header) + 1);
  transform-origin: left;
  opacity: ${({ $isLoading, $isComplete }) =>
    $isLoading || $isComplete ? 1 : 0};
  animation: ${({ $isLoading, $isComplete }) =>
      $isComplete ? slideOut : $isLoading ? slideIn : 'none'}
    ${({ $isComplete }) => ($isComplete ? '200ms' : '500ms')}
    var(--ease-out-expo) forwards;
  transition: opacity 200ms var(--ease-default);
`;

const RouteChangeTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsComplete(false);

    const completeTimeout = setTimeout(() => {
      setIsComplete(true);
      setIsLoading(false);
    }, 100);

    const resetTimeout = setTimeout(() => {
      setIsComplete(false);
    }, 400);

    return () => {
      clearTimeout(completeTimeout);
      clearTimeout(resetTimeout);
    };
  }, [pathname, searchParams]);

  return <ProgressBar $isLoading={isLoading} $isComplete={isComplete} />;
};

export const RouteChangeIndicator = () => {
  return (
    <Suspense fallback={null}>
      <RouteChangeTracker />
    </Suspense>
  );
};

export default RouteChangeIndicator;
