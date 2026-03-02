'use client';

import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const LoadingWrapper = styled.div`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
`;

const HeroSkeleton = styled.div`
  padding: calc(var(--header-height) + var(--spacing-16)) 0 var(--spacing-20);
  background: var(--gradient-hero);
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SkeletonContent = styled.div`
  max-width: 800px;
  width: 100%;
  padding: 0 var(--spacing-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
`;

const SkeletonBar = styled.div<{ $width?: string; $height?: string }>`
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-md);
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? '24px'};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonSection = styled.div`
  padding: var(--spacing-20) var(--spacing-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-8);
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);
  width: 100%;
  max-width: 1200px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonCard = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  animation: ${pulse} 1.5s ease-in-out infinite;
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

const Loading = () => {
  return (
    <LoadingWrapper role="status" aria-live="polite">
      <VisuallyHidden>Loading page content...</VisuallyHidden>

      <HeroSkeleton>
        <SkeletonContent>
          <SkeletonBar $width="120px" $height="16px" />
          <SkeletonBar $width="80%" $height="48px" />
          <SkeletonBar $width="60%" $height="24px" />
          <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
            <SkeletonBar $width="140px" $height="48px" />
            <SkeletonBar $width="140px" $height="48px" />
          </div>
        </SkeletonContent>
      </HeroSkeleton>

      <SkeletonSection>
        <SkeletonBar $width="200px" $height="32px" />
        <SkeletonBar $width="400px" $height="20px" />
        <SkeletonGrid>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i}>
              <SkeletonBar $width="48px" $height="48px" />
              <SkeletonBar $width="70%" $height="24px" />
              <SkeletonBar $height="16px" />
              <SkeletonBar $width="90%" $height="16px" />
            </SkeletonCard>
          ))}
        </SkeletonGrid>
      </SkeletonSection>
    </LoadingWrapper>
  );
};

export default Loading;
