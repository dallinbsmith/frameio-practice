'use client';

import { useCallback, useMemo, useState } from 'react';

import { useQuery } from './useQuery';

import type {
  PaginationActions,
  PaginationState,
  UsePaginationOptions,
} from './types';

type UsePaginationReturn = PaginationState &
  PaginationActions & {
    canGoNext: boolean;
    canGoPrev: boolean;
    pageRange: number[];
    startIndex: number;
    endIndex: number;
  };

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10,
  total,
  onChange,
}: UsePaginationOptions): UsePaginationReturn => {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const normalizedPage = useMemo(
    () => Math.min(Math.max(1, page), totalPages),
    [page, totalPages]
  );

  const canGoNext = normalizedPage < totalPages;
  const canGoPrev = normalizedPage > 1;

  const startIndex = (normalizedPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const setPage = useCallback(
    (newPage: number) => {
      const validPage = Math.min(Math.max(1, newPage), totalPages);
      setPageState(validPage);
      onChange?.(validPage, pageSize);
    },
    [totalPages, pageSize, onChange]
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      const validPageSize = Math.max(1, newPageSize);
      setPageSizeState(validPageSize);

      const newTotalPages = Math.max(1, Math.ceil(total / validPageSize));
      const newPage = Math.min(normalizedPage, newTotalPages);

      if (newPage !== normalizedPage) {
        setPageState(newPage);
      }

      onChange?.(newPage, validPageSize);
    },
    [total, normalizedPage, onChange]
  );

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setPage(normalizedPage + 1);
    }
  }, [canGoNext, normalizedPage, setPage]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setPage(normalizedPage - 1);
    }
  }, [canGoPrev, normalizedPage, setPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  const pageRange = useMemo(() => {
    const maxVisible = 7;
    const sidePages = Math.floor((maxVisible - 3) / 2);

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [1];

    let start = Math.max(2, normalizedPage - sidePages);
    let end = Math.min(totalPages - 1, normalizedPage + sidePages);

    if (normalizedPage - sidePages <= 2) {
      end = Math.min(totalPages - 1, maxVisible - 2);
    }

    if (normalizedPage + sidePages >= totalPages - 1) {
      start = Math.max(2, totalPages - maxVisible + 2);
    }

    if (start > 2) {
      pages.push(-1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push(-1);
    }

    pages.push(totalPages);

    return pages;
  }, [totalPages, normalizedPage]);

  return {
    page: normalizedPage,
    pageSize,
    total,
    totalPages,
    canGoNext,
    canGoPrev,
    pageRange,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
};

export const usePaginatedQuery = <TData, TItem>({
  queryKey,
  queryFn,
  getItems,
  getTotal,
  initialPage = 1,
  pageSize = 10,
  ...queryOptions
}: {
  queryKey: readonly unknown[];
  queryFn: (page: number, pageSize: number) => Promise<TData>;
  getItems: (data: TData) => TItem[];
  getTotal: (data: TData) => number;
  initialPage?: number;
  pageSize?: number;
  enabled?: boolean;
  staleTime?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}): {
  items: TItem[];
  pagination: UsePaginationReturn;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);

  const query = useQuery<TData>({
    queryKey: [...queryKey, page, pageSize],
    queryFn: () => queryFn(page, pageSize),
    ...queryOptions,
    onSuccess: (data: TData) => {
      setTotal(getTotal(data));
      queryOptions.onSuccess?.(data);
    },
  });

  const pagination = usePagination({
    initialPage: page,
    initialPageSize: pageSize,
    total,
    onChange: (newPage) => setPage(newPage),
  });

  const items = query.data ? getItems(query.data) : [];

  return {
    items,
    pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
