'use client';

import styled, { css, keyframes } from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

import type { DataListLayout, DataListProps } from './types';

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

const Header = styled.div`
  margin-bottom: var(--spacing-4);
`;

const Footer = styled.div`
  margin-top: var(--spacing-4);
`;

const ListContainer = styled.div<{
  $layout: DataListLayout;
  $columns: number;
  $gap: number;
}>`
  display: ${({ $layout }) => ($layout === 'grid' ? 'grid' : 'flex')};
  flex-direction: ${({ $layout }) => ($layout === 'list' ? 'column' : 'row')};
  gap: ${({ $gap }) => `${$gap}px`};

  ${({ $layout, $columns }) =>
    $layout === 'grid' &&
    css`
      grid-template-columns: repeat(${$columns}, 1fr);

      @media (max-width: 1024px) {
        grid-template-columns: repeat(${Math.min($columns, 2)}, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    `}
`;

const ListItem = styled.div`
  animation: ${fadeIn} var(--duration-normal) var(--ease-out-expo);
`;

const LoadingContainer = styled.div<{
  $layout: DataListLayout;
  $columns: number;
  $gap: number;
}>`
  display: ${({ $layout }) => ($layout === 'grid' ? 'grid' : 'flex')};
  flex-direction: ${({ $layout }) => ($layout === 'list' ? 'column' : 'row')};
  gap: ${({ $gap }) => `${$gap}px`};

  ${({ $layout, $columns }) =>
    $layout === 'grid' &&
    css`
      grid-template-columns: repeat(${$columns}, 1fr);

      @media (max-width: 1024px) {
        grid-template-columns: repeat(${Math.min($columns, 2)}, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    `}
`;

const LoadingItem = styled.div`
  padding: var(--spacing-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
`;

const SkeletonRow = styled.div`
  margin-bottom: var(--spacing-2);

  &:last-child {
    margin-bottom: 0;
  }
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
  max-width: 300px;
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

const DefaultLoadingItem = () => (
  <LoadingItem>
    <SkeletonRow>
      <Skeleton height={20} width="60%" />
    </SkeletonRow>
    <SkeletonRow>
      <Skeleton height={16} width="80%" />
    </SkeletonRow>
    <Skeleton height={16} width="40%" />
  </LoadingItem>
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
    <ErrorTitle>Failed to load data</ErrorTitle>
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

const DefaultEmpty = ({
  title = 'No items found',
  description = 'There are no items to display at this time.',
}: {
  title?: string | undefined;
  description?: string | undefined;
}) => (
  <EmptyContainer>
    <EmptyIcon>
      <InboxIcon />
    </EmptyIcon>
    <EmptyTitle>{title}</EmptyTitle>
    <EmptyText>{description}</EmptyText>
  </EmptyContainer>
);

export const DataList = <TItem,>({
  items,
  renderItem,
  keyExtractor,
  layout = 'list',
  columns = 3,
  gap = 16,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  loadingComponent,
  loadingItemCount = 6,
  renderLoadingItem,
  errorComponent,
  emptyComponent,
  emptyTitle,
  emptyDescription,
  header,
  footer,
  className,
}: DataListProps<TItem>) => {
  if (isLoading && items.length === 0) {
    if (loadingComponent) {
      return <Container className={className}>{loadingComponent}</Container>;
    }

    return (
      <Container className={className}>
        {header && <Header>{header}</Header>}
        <LoadingContainer $layout={layout} $columns={columns} $gap={gap}>
          {Array.from({ length: loadingItemCount }).map((_, index) => (
            <div key={`loading-${index}`}>
              {renderLoadingItem ? (
                renderLoadingItem(index)
              ) : (
                <DefaultLoadingItem />
              )}
            </div>
          ))}
        </LoadingContainer>
      </Container>
    );
  }

  if (isError && items.length === 0) {
    return (
      <Container className={className}>
        {header && <Header>{header}</Header>}
        {errorComponent ?? <DefaultError error={error} onRetry={onRetry} />}
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className={className}>
        {header && <Header>{header}</Header>}
        {emptyComponent ?? (
          <DefaultEmpty title={emptyTitle} description={emptyDescription} />
        )}
      </Container>
    );
  }

  return (
    <Container className={className}>
      {header && <Header>{header}</Header>}
      <ListContainer $layout={layout} $columns={columns} $gap={gap}>
        {items.map((item, index) => (
          <ListItem key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </ListItem>
        ))}
      </ListContainer>
      {footer && <Footer>{footer}</Footer>}
    </Container>
  );
};

export default DataList;
