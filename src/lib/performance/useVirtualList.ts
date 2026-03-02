'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  ScrollToIndexOptions,
  ScrollToOffsetOptions,
  UseVirtualListOptions,
  UseVirtualListReturn,
  VirtualItem,
  VirtualRange,
} from './types';

const findNearestBinarySearch = (
  low: number,
  high: number,
  offset: number,
  getOffset: (index: number) => number
): number => {
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const currentOffset = getOffset(mid);

    if (currentOffset === offset) {
      return mid;
    } else if (currentOffset < offset) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(0, low - 1);
};

export const useVirtualList = ({
  count,
  getItemSize,
  overscan = 3,
  paddingStart = 0,
  paddingEnd = 0,
  horizontal = false,
  initialOffset = 0,
  estimatedItemSize: _estimatedItemSize = 50,
}: UseVirtualListOptions): UseVirtualListReturn & {
  containerRef: React.RefObject<HTMLDivElement>;
} => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(initialOffset);
  const [containerSize, setContainerSize] = useState(0);
  const measurementsCache = useRef<Map<number, number>>(new Map());
  const pendingMeasurements = useRef<boolean>(false);

  const getMeasuredSize = useCallback(
    (index: number): number => {
      const cached = measurementsCache.current.get(index);
      if (cached !== undefined) {
        return cached;
      }
      return getItemSize(index);
    },
    [getItemSize]
  );

  const getItemOffset = useCallback(
    (index: number): number => {
      let offset = paddingStart;
      for (let i = 0; i < index; i++) {
        offset += getMeasuredSize(i);
      }
      return offset;
    },
    [getMeasuredSize, paddingStart]
  );

  const totalSize = useMemo(() => {
    let size = paddingStart + paddingEnd;
    for (let i = 0; i < count; i++) {
      size += getMeasuredSize(i);
    }
    return size;
  }, [count, getMeasuredSize, paddingStart, paddingEnd]);

  const range = useMemo((): VirtualRange => {
    if (count === 0 || containerSize === 0) {
      return { startIndex: 0, endIndex: 0, overscan };
    }

    const startIndex = findNearestBinarySearch(
      0,
      count - 1,
      scrollOffset,
      getItemOffset
    );

    let endIndex = startIndex;
    let currentOffset = getItemOffset(startIndex);

    while (
      endIndex < count - 1 &&
      currentOffset < scrollOffset + containerSize
    ) {
      endIndex++;
      currentOffset += getMeasuredSize(endIndex);
    }

    const overscanStart = Math.max(0, startIndex - overscan);
    const overscanEnd = Math.min(count - 1, endIndex + overscan);

    return {
      startIndex: overscanStart,
      endIndex: overscanEnd,
      overscan,
    };
  }, [
    count,
    containerSize,
    scrollOffset,
    getItemOffset,
    getMeasuredSize,
    overscan,
  ]);

  const virtualItems = useMemo((): VirtualItem[] => {
    const items: VirtualItem[] = [];

    for (let i = range.startIndex; i <= range.endIndex; i++) {
      const size = getMeasuredSize(i);
      const start = getItemOffset(i);

      items.push({
        index: i,
        start,
        size,
        end: start + size,
      });
    }

    return items;
  }, [range, getMeasuredSize, getItemOffset]);

  const scrollToOffset = useCallback(
    (offset: number, options?: ScrollToOffsetOptions) => {
      const container = containerRef.current;
      if (!container) return;

      const scrollProperty = horizontal ? 'scrollLeft' : 'scrollTop';
      container[scrollProperty] = offset;

      if (options?.behavior === 'smooth') {
        container.scrollTo({
          [horizontal ? 'left' : 'top']: offset,
          behavior: 'smooth',
        });
      }
    },
    [horizontal]
  );

  const scrollToIndex = useCallback(
    (index: number, options?: ScrollToIndexOptions) => {
      const container = containerRef.current;
      if (!container) return;

      const { align = 'auto' } = options ?? {};
      const itemOffset = getItemOffset(index);
      const itemSize = getMeasuredSize(index);

      let targetOffset: number;

      switch (align) {
        case 'start':
          targetOffset = itemOffset;
          break;
        case 'end':
          targetOffset = itemOffset - containerSize + itemSize;
          break;
        case 'center':
          targetOffset = itemOffset - containerSize / 2 + itemSize / 2;
          break;
        case 'auto':
        default:
          if (itemOffset < scrollOffset) {
            targetOffset = itemOffset;
          } else if (itemOffset + itemSize > scrollOffset + containerSize) {
            targetOffset = itemOffset - containerSize + itemSize;
          } else {
            return;
          }
      }

      targetOffset = Math.max(
        0,
        Math.min(targetOffset, totalSize - containerSize)
      );
      scrollToOffset(targetOffset, options);
    },
    [
      getItemOffset,
      getMeasuredSize,
      containerSize,
      scrollOffset,
      totalSize,
      scrollToOffset,
    ]
  );

  const measure = useCallback(() => {
    pendingMeasurements.current = true;
    measurementsCache.current.clear();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const offset = horizontal ? container.scrollLeft : container.scrollTop;
      setScrollOffset(offset);
    };

    const handleResize = () => {
      const size = horizontal ? container.clientWidth : container.clientHeight;
      setContainerSize(size);
    };

    handleResize();
    container.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [horizontal]);

  return {
    containerRef,
    virtualItems,
    totalSize,
    scrollOffset,
    scrollToIndex,
    scrollToOffset,
    measure,
    range,
  };
};
