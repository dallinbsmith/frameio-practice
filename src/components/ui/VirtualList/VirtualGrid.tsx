'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { Spinner } from '@/components/ui/Spinner';

import type { VirtualGridProps } from './types';

const Container = styled.div<{ $height: number; $width?: number | string }>`
  position: relative;
  overflow: auto;
  height: ${({ $height }) => `${$height}px`};
  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : ($width ?? '100%')};
`;

const Inner = styled.div<{ $totalHeight: number; $totalWidth: number }>`
  position: relative;
  width: ${({ $totalWidth }) => `${$totalWidth}px`};
  height: ${({ $totalHeight }) => `${$totalHeight}px`};
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  color: var(--color-fg-secondary);
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
`;

const InboxIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginBottom: 'var(--spacing-4)', opacity: 0.5 }}
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const DefaultEmpty = () => (
  <EmptyContainer>
    <InboxIcon />
    <p>No items to display</p>
  </EmptyContainer>
);

const DefaultLoading = () => (
  <LoadingContainer>
    <Spinner size="md" />
  </LoadingContainer>
);

export const VirtualGrid = <TItem,>({
  items,
  height,
  width,
  columnCount,
  rowHeight,
  columnWidth,
  renderItem,
  keyExtractor,
  overscan = 2,
  className,
  onScroll,
  onEndReached,
  endReachedThreshold = 200,
  gap = 0,
  isLoading = false,
  loadingComponent,
  emptyComponent,
}: VirtualGridProps<TItem>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(height);
  const [containerWidth, setContainerWidth] = useState(0);
  const endReachedCalledRef = useRef(false);

  const rowCount = Math.ceil(items.length / columnCount);

  const getRowHeight = useCallback(
    (rowIndex: number): number => {
      const baseHeight =
        typeof rowHeight === 'function' ? rowHeight(rowIndex) : rowHeight;
      return rowIndex < rowCount - 1 ? baseHeight + gap : baseHeight;
    },
    [rowHeight, gap, rowCount]
  );

  const getColumnWidth = useCallback(
    (colIndex: number): number => {
      if (columnWidth === undefined) {
        const totalGap = (columnCount - 1) * gap;
        return (containerWidth - totalGap) / columnCount;
      }
      const baseWidth =
        typeof columnWidth === 'function' ? columnWidth(colIndex) : columnWidth;
      return colIndex < columnCount - 1 ? baseWidth + gap : baseWidth;
    },
    [columnWidth, gap, columnCount, containerWidth]
  );

  const getRowOffset = useCallback(
    (rowIndex: number): number => {
      let offset = 0;
      for (let i = 0; i < rowIndex; i++) {
        offset += getRowHeight(i);
      }
      return offset;
    },
    [getRowHeight]
  );

  const getColumnOffset = useCallback(
    (colIndex: number): number => {
      let offset = 0;
      for (let i = 0; i < colIndex; i++) {
        offset += getColumnWidth(i);
      }
      return offset;
    },
    [getColumnWidth]
  );

  const totalHeight = useMemo(() => {
    let h = 0;
    for (let i = 0; i < rowCount; i++) {
      h += getRowHeight(i);
    }
    return h;
  }, [rowCount, getRowHeight]);

  const totalWidth = useMemo(() => {
    let w = 0;
    for (let i = 0; i < columnCount; i++) {
      w += getColumnWidth(i);
    }
    return w;
  }, [columnCount, getColumnWidth]);

  const visibleRows = useMemo(() => {
    if (rowCount === 0) {
      return { startRow: 0, endRow: 0 };
    }

    let startRow = 0;
    let currentOffset = 0;

    while (startRow < rowCount - 1 && currentOffset < scrollTop) {
      currentOffset += getRowHeight(startRow);
      if (currentOffset < scrollTop) {
        startRow++;
      }
    }

    let endRow = startRow;
    while (
      endRow < rowCount - 1 &&
      currentOffset < scrollTop + containerHeight
    ) {
      endRow++;
      currentOffset += getRowHeight(endRow);
    }

    return {
      startRow: Math.max(0, startRow - overscan),
      endRow: Math.min(rowCount - 1, endRow + overscan),
    };
  }, [rowCount, scrollTop, containerHeight, getRowHeight, overscan]);

  const virtualItems = useMemo(() => {
    const result: Array<{
      index: number;
      rowIndex: number;
      columnIndex: number;
      item: TItem;
      style: React.CSSProperties;
    }> = [];

    for (
      let rowIndex = visibleRows.startRow;
      rowIndex <= visibleRows.endRow;
      rowIndex++
    ) {
      for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        const itemIndex = rowIndex * columnCount + colIndex;
        if (itemIndex >= items.length) break;

        const item = items[itemIndex];
        if (!item) continue;

        const top = getRowOffset(rowIndex);
        const left = getColumnOffset(colIndex);
        const itemHeight =
          typeof rowHeight === 'function' ? rowHeight(rowIndex) : rowHeight;
        const itemWidth =
          getColumnWidth(colIndex) - (colIndex < columnCount - 1 ? gap : 0);

        result.push({
          index: itemIndex,
          rowIndex,
          columnIndex: colIndex,
          item,
          style: {
            position: 'absolute',
            top,
            left,
            height: itemHeight,
            width: itemWidth,
          },
        });
      }
    }

    return result;
  }, [
    visibleRows,
    columnCount,
    items,
    getRowOffset,
    getColumnOffset,
    rowHeight,
    getColumnWidth,
    gap,
  ]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setScrollTop(container.scrollTop);
    onScroll?.(container.scrollTop);

    if (onEndReached) {
      const distanceFromEnd =
        totalHeight - container.scrollTop - containerHeight;
      if (
        distanceFromEnd < endReachedThreshold &&
        !endReachedCalledRef.current
      ) {
        endReachedCalledRef.current = true;
        onEndReached();
      } else if (distanceFromEnd >= endReachedThreshold) {
        endReachedCalledRef.current = false;
      }
    }
  }, [
    onScroll,
    onEndReached,
    totalHeight,
    containerHeight,
    endReachedThreshold,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
      setContainerWidth(container.clientWidth);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    endReachedCalledRef.current = false;
  }, [items.length]);

  if (isLoading && items.length === 0) {
    return (
      <Container
        $height={height}
        {...(width !== undefined ? { $width: width } : {})}
        className={className}
      >
        {loadingComponent ?? <DefaultLoading />}
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container
        $height={height}
        {...(width !== undefined ? { $width: width } : {})}
        className={className}
      >
        {emptyComponent ?? <DefaultEmpty />}
      </Container>
    );
  }

  const getKey = (item: TItem, index: number): string | number => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    return index;
  };

  return (
    <Container
      ref={containerRef}
      $height={height}
      {...(width !== undefined ? { $width: width } : {})}
      className={className}
      onScroll={handleScroll}
    >
      <Inner $totalHeight={totalHeight} $totalWidth={totalWidth}>
        {virtualItems.map(({ index, rowIndex, columnIndex, item, style }) => (
          <div key={getKey(item, index)} style={style}>
            {renderItem(item, index, rowIndex, columnIndex, style)}
          </div>
        ))}
      </Inner>
    </Container>
  );
};

export default VirtualGrid;
