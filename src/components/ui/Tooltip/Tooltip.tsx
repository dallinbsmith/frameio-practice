'use client';

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

import type { ReactNode, CSSProperties } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const TooltipWrapper = styled.div`
  display: inline-block;
`;

const TooltipContent = styled.div<{ $position: TooltipPosition }>`
  position: fixed;
  z-index: var(--z-tooltip);
  max-width: 250px;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-fg-primary);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  pointer-events: none;
  animation: ${fadeIn} var(--duration-fast) var(--ease-out-expo);

  &::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    transform: rotate(45deg);

    ${({ $position }) => {
      switch ($position) {
        case 'top':
          return `
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            border-top: none;
            border-left: none;
          `;
        case 'bottom':
          return `
            top: -5px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            border-bottom: none;
            border-right: none;
          `;
        case 'left':
          return `
            right: -5px;
            top: 50%;
            transform: translateY(-50%) rotate(45deg);
            border-bottom: none;
            border-left: none;
          `;
        case 'right':
          return `
            left: -5px;
            top: 50%;
            transform: translateY(-50%) rotate(45deg);
            border-top: none;
            border-right: none;
          `;
      }
    }}
  }
`;

const OFFSET = 12;

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const style: CSSProperties = {};

    switch (position) {
      case 'top':
        style.bottom = window.innerHeight - rect.top + OFFSET;
        style.left = rect.left + rect.width / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        style.top = rect.bottom + OFFSET;
        style.left = rect.left + rect.width / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'left':
        style.top = rect.top + rect.height / 2;
        style.right = window.innerWidth - rect.left + OFFSET;
        style.transform = 'translateY(-50%)';
        break;
      case 'right':
        style.top = rect.top + rect.height / 2;
        style.left = rect.right + OFFSET;
        style.transform = 'translateY(-50%)';
        break;
    }

    setTooltipStyle(style);
  }, [position]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const tooltip =
    isVisible &&
    typeof document !== 'undefined' &&
    createPortal(
      <TooltipContent $position={position} style={tooltipStyle} role="tooltip">
        {content}
      </TooltipContent>,
      document.body
    );

  return (
    <>
      <TooltipWrapper
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
      </TooltipWrapper>
      {tooltip}
    </>
  );
};

export default Tooltip;
