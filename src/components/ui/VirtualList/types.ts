'use client';

import type { ReactNode, CSSProperties } from 'react';

export type VirtualListProps<TItem> = {
  items: TItem[];
  height: number;
  width?: number | string;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: TItem, index: number, style: CSSProperties) => ReactNode;
  keyExtractor?: (item: TItem, index: number) => string | number;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  onScroll?: (scrollOffset: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  horizontal?: boolean;
  gap?: number;
  initialScrollOffset?: number;
  scrollToIndex?: number;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  isLoading?: boolean;
};

export type VirtualGridProps<TItem> = {
  items: TItem[];
  height: number;
  width?: number | string;
  columnCount: number;
  rowHeight: number | ((rowIndex: number) => number);
  columnWidth?: number | ((columnIndex: number) => number);
  renderItem: (
    item: TItem,
    index: number,
    rowIndex: number,
    columnIndex: number,
    style: CSSProperties
  ) => ReactNode;
  keyExtractor?: (item: TItem, index: number) => string | number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollOffset: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  gap?: number;
  isLoading?: boolean;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
};
