import type { ReactNode } from 'react';

export type DataListLayout = 'list' | 'grid';

export type DataListProps<TItem> = {
  items: TItem[];
  renderItem: (item: TItem, index: number) => ReactNode;
  keyExtractor: (item: TItem, index: number) => string;
  layout?: DataListLayout;
  columns?: number;
  gap?: number;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  loadingItemCount?: number;
  renderLoadingItem?: (index: number) => ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
};
