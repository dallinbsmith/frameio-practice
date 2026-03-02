import type { ReactNode } from 'react';

export type InfiniteListProps<TItem> = {
  items: TItem[];
  renderItem: (item: TItem, index: number) => ReactNode;
  keyExtractor: (item: TItem, index: number) => string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  loadMoreComponent?: ReactNode;
  threshold?: number;
  useIntersectionObserver?: boolean;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
};

export type LoadMoreButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};
