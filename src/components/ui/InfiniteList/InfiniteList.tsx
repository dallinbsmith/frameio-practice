'use client';

import { useCallback, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

import type { InfiniteListProps, LoadMoreButtonProps } from './types';

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

const Container = styled.div`
  width: 100%;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const ListItem = styled.div`
  animation: ${fadeIn} var(--duration-normal) var(--ease-out-expo);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  gap: var(--spacing-3);
`;

const LoadingText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  gap: var(--spacing-4);
  background-color: var(--color-status-error-bg);
  border-radius: var(--radius-lg);
`;

const ErrorIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-status-error);
  color: white;
  border-radius: var(--radius-full);
`;

const ErrorTitle = styled.h4`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  margin: 0;
  text-align: center;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  gap: var(--spacing-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border-subtle);
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  color: var(--color-fg-tertiary);
  border-radius: var(--radius-full);
`;

const EmptyTitle = styled.h4`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  margin: 0;
  text-align: center;
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: var(--spacing-6) 0;
`;

const SentinelContainer = styled.div`
  height: 1px;
  width: 100%;
`;

const AlertIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const InboxIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const DefaultLoading = () => (
  <LoadingContainer>
    <Spinner size="md" />
    <LoadingText>Loading...</LoadingText>
  </LoadingContainer>
);

const DefaultError = ({
  error,
  onRetry,
}: {
  error?: Error | null | undefined;
  onRetry?: (() => void) | undefined;
}) => (
  <ErrorContainer>
    <ErrorIcon>
      <AlertIcon />
    </ErrorIcon>
    <ErrorTitle>Something went wrong</ErrorTitle>
    <ErrorMessage>
      {error?.message ?? 'An unexpected error occurred. Please try again.'}
    </ErrorMessage>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </ErrorContainer>
);

const DefaultEmpty = () => (
  <EmptyContainer>
    <EmptyIcon>
      <InboxIcon />
    </EmptyIcon>
    <EmptyTitle>No items found</EmptyTitle>
    <EmptyText>There are no items to display at this time.</EmptyText>
  </EmptyContainer>
);

export const LoadMoreButton = ({
  onClick,
  isLoading,
  disabled = false,
  children = 'Load More',
  className,
}: LoadMoreButtonProps) => (
  <LoadMoreContainer className={className}>
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  </LoadMoreContainer>
);

export const InfiniteList = <TItem,>({
  items,
  renderItem,
  keyExtractor,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  loadMoreComponent,
  threshold = 0.5,
  useIntersectionObserver = true,
  className,
  listClassName,
  itemClassName,
}: InfiniteListProps<TItem>) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    if (!useIntersectionObserver) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [useIntersectionObserver, handleIntersection, threshold]);

  if (isLoading && items.length === 0) {
    return (
      <Container className={className}>
        {loadingComponent ?? <DefaultLoading />}
      </Container>
    );
  }

  if (isError && items.length === 0) {
    return (
      <Container className={className}>
        {errorComponent ?? <DefaultError error={error} onRetry={onRetry} />}
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className={className}>
        {emptyComponent ?? <DefaultEmpty />}
      </Container>
    );
  }

  return (
    <Container className={className}>
      <List className={listClassName}>
        {items.map((item, index) => (
          <ListItem key={keyExtractor(item, index)} className={itemClassName}>
            {renderItem(item, index)}
          </ListItem>
        ))}
      </List>

      {useIntersectionObserver ? (
        <>
          <SentinelContainer ref={sentinelRef} />
          {isFetchingNextPage && (
            <LoadingContainer>
              <Spinner size="sm" />
              <LoadingText>Loading more...</LoadingText>
            </LoadingContainer>
          )}
        </>
      ) : hasNextPage ? (
        (loadMoreComponent ?? (
          <LoadMoreButton
            onClick={fetchNextPage}
            isLoading={isFetchingNextPage}
          />
        ))
      ) : null}
    </Container>
  );
};

export default InfiniteList;
