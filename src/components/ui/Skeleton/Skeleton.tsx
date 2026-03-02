'use client';

import styled, { keyframes, css } from 'styled-components';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
};

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const wave = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const animationStyles = {
  pulse: css`
    animation: ${pulse} 1.5s ease-in-out infinite;
  `,
  wave: css`
    background: linear-gradient(
      90deg,
      var(--color-bg-surface) 25%,
      var(--color-bg-elevated) 50%,
      var(--color-bg-surface) 75%
    );
    background-size: 200% 100%;
    animation: ${wave} 1.5s ease-in-out infinite;
  `,
  none: css``,
};

const variantStyles = {
  text: css`
    border-radius: var(--radius-sm);
    height: 1em;
  `,
  circular: css`
    border-radius: 50%;
  `,
  rectangular: css`
    border-radius: 0;
  `,
  rounded: css`
    border-radius: var(--radius-md);
  `,
};

const SkeletonBase = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $variant: SkeletonProps['variant'];
  $animation: SkeletonProps['animation'];
}>`
  display: block;
  background-color: var(--color-bg-surface);
  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : ($width ?? '100%')};
  height: ${({ $height }) =>
    typeof $height === 'number' ? `${$height}px` : ($height ?? 'auto')};

  ${({ $variant }) => variantStyles[$variant ?? 'text']}
  ${({ $animation }) => animationStyles[$animation ?? 'wave']}
`;

export const Skeleton = ({
  width,
  height,
  variant = 'text',
  animation = 'wave',
}: SkeletonProps) => {
  return (
    <SkeletonBase
      {...(width !== undefined && { $width: width })}
      {...(height !== undefined && { $height: height })}
      $variant={variant}
      $animation={animation}
      aria-hidden="true"
    />
  );
};

export const SkeletonText = styled(SkeletonBase).attrs({
  $variant: 'text' as const,
  $animation: 'wave' as const,
})`
  margin-bottom: var(--spacing-2);

  &:last-child {
    width: 80%;
    margin-bottom: 0;
  }
`;

export const SkeletonAvatar = styled(SkeletonBase).attrs({
  $variant: 'circular' as const,
  $animation: 'wave' as const,
})`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`;

export const SkeletonButton = styled(SkeletonBase).attrs({
  $variant: 'rounded' as const,
  $animation: 'wave' as const,
})`
  height: 44px;
  width: 120px;
`;

export const SkeletonCard = styled.div`
  padding: var(--spacing-6);
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
`;

export const SkeletonImage = styled(SkeletonBase).attrs({
  $variant: 'rounded' as const,
  $animation: 'wave' as const,
})`
  aspect-ratio: 16 / 9;
`;

export default Skeleton;
