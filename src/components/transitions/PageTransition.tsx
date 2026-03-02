'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { useReducedMotion } from '@/hooks';

import type { ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
`;

const TransitionWrapper = styled.div<{
  $isExiting: boolean;
  $reducedMotion: boolean;
}>`
  animation: ${({ $isExiting, $reducedMotion }) =>
    $reducedMotion
      ? 'none'
      : $isExiting
        ? `${fadeOut} 150ms var(--ease-in) forwards`
        : `${fadeIn} 300ms var(--ease-out-expo) forwards`};
`;

export const PageTransition = ({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isExiting, setIsExiting] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== currentPath) {
      if (!reducedMotion) {
        setIsExiting(true);

        const timeout = setTimeout(() => {
          setDisplayChildren(children);
          setCurrentPath(pathname);
          setIsExiting(false);
        }, 150);

        return () => clearTimeout(timeout);
      } else {
        setDisplayChildren(children);
        setCurrentPath(pathname);
      }
    } else {
      setDisplayChildren(children);
    }
    return undefined;
  }, [pathname, children, currentPath, reducedMotion]);

  return (
    <TransitionWrapper $isExiting={isExiting} $reducedMotion={reducedMotion}>
      {displayChildren}
    </TransitionWrapper>
  );
};

export default PageTransition;
