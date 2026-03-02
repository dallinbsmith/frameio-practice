'use client';

import styled, { keyframes } from 'styled-components';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

type SpinnerProps = {
  size?: SpinnerSize;
  color?: string;
  label?: string;
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const sizeMap = {
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
};

const borderWidthMap = {
  sm: '2px',
  md: '2px',
  lg: '3px',
  xl: '4px',
};

const SpinnerWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SpinnerCircle = styled.div<{ $size: SpinnerSize; $color?: string }>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border: ${({ $size }) => borderWidthMap[$size]} solid
    var(--color-border-subtle);
  border-top-color: ${({ $color }) =>
    $color ?? 'var(--color-interactive-primary)'};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const Spinner = ({
  size = 'md',
  color,
  label = 'Loading...',
}: SpinnerProps) => {
  return (
    <SpinnerWrapper role="status" aria-live="polite">
      <SpinnerCircle
        $size={size}
        {...(color !== undefined && { $color: color })}
      />
      <VisuallyHidden>{label}</VisuallyHidden>
    </SpinnerWrapper>
  );
};

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--color-bg-primary-rgb), 0.8);
  backdrop-filter: blur(2px);
  z-index: var(--z-overlay);
`;

export const LoadingButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
`;

export default Spinner;
