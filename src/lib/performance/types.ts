'use client';

export type VirtualItem = {
  index: number;
  start: number;
  size: number;
  end: number;
};

export type VirtualRange = {
  startIndex: number;
  endIndex: number;
  overscan: number;
};

export type UseVirtualListOptions = {
  count: number;
  getItemSize: (index: number) => number;
  overscan?: number;
  paddingStart?: number;
  paddingEnd?: number;
  horizontal?: boolean;
  initialOffset?: number;
  estimatedItemSize?: number;
};

export type UseVirtualListReturn = {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollOffset: number;
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
  scrollToOffset: (offset: number, options?: ScrollToOffsetOptions) => void;
  measure: () => void;
  range: VirtualRange;
};

export type ScrollToIndexOptions = {
  align?: 'start' | 'center' | 'end' | 'auto';
  behavior?: ScrollBehavior;
};

export type ScrollToOffsetOptions = {
  behavior?: ScrollBehavior;
};

export type UseIntersectionObserverOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
};

export type UseIntersectionObserverReturn = {
  ref: (node: Element | null) => void;
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
};

export type UsePrefetchOptions<TData> = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
  enabled?: boolean;
};

export type UsePrefetchReturn = {
  prefetch: () => void;
  isPrefetching: boolean;
  isPrefetched: boolean;
};

export type UseIdleCallbackOptions = {
  timeout?: number;
  disabled?: boolean;
};

export type LazyComponentProps = {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onLoad?: () => void;
  onError?: (error: Error) => void;
};

export type VirtualListProps<TItem> = {
  items: TItem[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (
    item: TItem,
    index: number,
    style: React.CSSProperties
  ) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollOffset: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  horizontal?: boolean;
  gap?: number;
};
