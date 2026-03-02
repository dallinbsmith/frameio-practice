'use client';

import Image from 'next/image';
import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2';
  objectFit?: 'cover' | 'contain' | 'fill';
};

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const aspectRatioMap = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
  '3/2': '66.67%',
};

const ImageWrapper = styled.div<{
  $aspectRatio?: string;
  $isLoading: boolean;
}>`
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-surface);

  ${({ $aspectRatio }) =>
    $aspectRatio &&
    css`
      padding-bottom: ${aspectRatioMap[
        $aspectRatio as keyof typeof aspectRatioMap
      ] ?? $aspectRatio};
    `}

  ${({ $isLoading }) =>
    $isLoading &&
    css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          var(--color-bg-surface) 25%,
          var(--color-bg-elevated) 50%,
          var(--color-bg-surface) 75%
        );
        background-size: 200% 100%;
        animation: ${shimmer} 1.5s ease-in-out infinite;
      }
    `}
`;

const StyledImage = styled(Image)<{ $isLoaded: boolean }>`
  transition: opacity var(--duration-normal) var(--ease-default);
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
`;

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  fill,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  aspectRatio,
  objectFit = 'cover',
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setIsLoaded(true);
  };

  return (
    <ImageWrapper
      className={className}
      {...(aspectRatio !== undefined && { $aspectRatio: aspectRatio })}
      $isLoading={isLoading}
    >
      <StyledImage
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        $isLoaded={isLoaded}
        style={{
          objectFit,
          ...(fill && { position: 'absolute', inset: 0 }),
        }}
      />
    </ImageWrapper>
  );
};

export default OptimizedImage;
