'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { Spinner } from '@/components/ui/Spinner';

import type { VirtualListProps } from './types';

const Container = styled.div<{ $height: number; $width?: number | string }>`
  position: relative;
  overflow: auto;
  height: ${({ $height }) => `${$height}px`};
  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : ($width ?? '100%')};
`;

const Inner = styled.div<{ $totalSize: number; $horizontal?: boolean }>`
  position: relative;
  width: ${({ $horizontal, $totalSize }) =>
    $horizontal ? `${$totalSize}px` : '100%'};
  height: ${({ $horizontal, $totalSize }) =>
    $horizontal ? '100%' : `${$totalSize}px`};
`;

const ItemWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
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

export const VirtualList = <TItem,>({
  items,
  height,
  width,
  itemHeight,
  renderItem,
  keyExtractor,
  overscan = 3,
  className,
  onScroll,
  onEndReached,
  endReachedThreshold = 200,
  horizontal = false,
  gap = 0,
  initialScrollOffset = 0,
  scrollToIndex,
  loadingComponent,
  emptyComponent,
  isLoading = false,
}: VirtualListProps<TItem>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(initialScrollOffset);
  const [containerSize, setContainerSize] = useState(height);
  const endReachedCalledRef = useRef(false);

  const getItemSize = useCallback(
    (index: number): number => {
      const baseSize =
        typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
      return index < items.length - 1 ? baseSize + gap : baseSize;
    },
    [itemHeight, gap, items.length]
  );

  const getItemOffset = useCallback(
    (index: number): number => {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemSize(i);
      }
      return offset;
    },
    [getItemSize]
  );

  const totalSize = useMemo(() => {
    let size = 0;
    for (let i = 0; i < items.length; i++) {
      size += getItemSize(i);
    }
    return size;
  }, [items.length, getItemSize]);

  const visibleRange = useMemo(() => {
    if (items.length === 0) {
      return { startIndex: 0, endIndex: 0 };
    }

    let startIndex = 0;
    let currentOffset = 0;

    while (startIndex < items.length - 1 && currentOffset < scrollOffset) {
      currentOffset += getItemSize(startIndex);
      if (currentOffset < scrollOffset) {
        startIndex++;
      }
    }

    let endIndex = startIndex;
    while (
      endIndex < items.length - 1 &&
      currentOffset < scrollOffset + containerSize
    ) {
      endIndex++;
      currentOffset += getItemSize(endIndex);
    }

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [items.length, scrollOffset, containerSize, getItemSize, overscan]);

  const virtualItems = useMemo(() => {
    const result: Array<{
      index: number;
      item: TItem;
      style: React.CSSProperties;
    }> = [];

    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      const item = items[i];
      if (!item) continue;

      const offset = getItemOffset(i);
      const size =
        typeof itemHeight === 'function' ? itemHeight(i) : itemHeight;

      result.push({
        index: i,
        item,
        style: horizontal
          ? {
              position: 'absolute',
              left: offset,
              top: 0,
              width: size,
              height: '100%',
            }
          : {
              position: 'absolute',
              top: offset,
              left: 0,
              height: size,
              width: '100%',
            },
      });
    }

    return result;
  }, [visibleRange, items, getItemOffset, itemHeight, horizontal]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const offset = horizontal ? container.scrollLeft : container.scrollTop;
    setScrollOffset(offset);
    onScroll?.(offset);

    if (onEndReached) {
      const distanceFromEnd = totalSize - offset - containerSize;
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
    horizontal,
    onScroll,
    onEndReached,
    totalSize,
    containerSize,
    endReachedThreshold,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      setContainerSize(
        horizontal ? container.clientWidth : container.clientHeight
      );
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [horizontal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || scrollToIndex === undefined) return;

    const offset = getItemOffset(scrollToIndex);
    if (horizontal) {
      container.scrollLeft = offset;
    } else {
      container.scrollTop = offset;
    }
  }, [scrollToIndex, getItemOffset, horizontal]);

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
      <Inner $totalSize={totalSize} $horizontal={horizontal}>
        {virtualItems.map(({ index, item, style }) => (
          <ItemWrapper key={getKey(item, index)} style={style}>
            {renderItem(item, index, style)}
          </ItemWrapper>
        ))}
      </Inner>
    </Container>
  );
};

export default VirtualList;
