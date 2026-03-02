import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePagination } from './usePagination';

describe('usePagination', () => {
  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.total).toBe(100);
      expect(result.current.totalPages).toBe(10);
    });

    it('should initialize with custom values', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 3,
          initialPageSize: 25,
          total: 100,
        })
      );

      expect(result.current.page).toBe(3);
      expect(result.current.pageSize).toBe(25);
      expect(result.current.totalPages).toBe(4);
    });

    it('should handle zero total', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 0,
        })
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrev).toBe(false);
    });
  });

  describe('navigation', () => {
    it('should go to next page', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(2);
    });

    it('should go to previous page', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 3,
          total: 100,
        })
      );

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(2);
    });

    it('should go to first page', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 5,
          total: 100,
        })
      );

      act(() => {
        result.current.firstPage();
      });

      expect(result.current.page).toBe(1);
    });

    it('should go to last page', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      act(() => {
        result.current.lastPage();
      });

      expect(result.current.page).toBe(10);
    });

    it('should set specific page', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.page).toBe(5);
    });

    it('should not go past last page', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 10,
          total: 100,
        })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(10);
    });

    it('should not go before first page', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(1);
    });

    it('should clamp setPage to valid range', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      act(() => {
        result.current.setPage(100);
      });

      expect(result.current.page).toBe(10);

      act(() => {
        result.current.setPage(0);
      });

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.setPage(-5);
      });

      expect(result.current.page).toBe(1);
    });
  });

  describe('canGoNext and canGoPrev', () => {
    it('should indicate when next page is available', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      expect(result.current.canGoNext).toBe(true);

      act(() => {
        result.current.lastPage();
      });

      expect(result.current.canGoNext).toBe(false);
    });

    it('should indicate when previous page is available', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      expect(result.current.canGoPrev).toBe(false);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.canGoPrev).toBe(true);
    });
  });

  describe('pageSize', () => {
    it('should update page size', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
        })
      );

      act(() => {
        result.current.setPageSize(25);
      });

      expect(result.current.pageSize).toBe(25);
      expect(result.current.totalPages).toBe(4);
    });

    it('should adjust page when new page size would make current page invalid', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 5,
          total: 100,
        })
      );

      act(() => {
        result.current.setPageSize(50);
      });

      expect(result.current.page).toBe(2);
    });
  });

  describe('pageRange', () => {
    it('should return all pages when total pages <= 7', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 50,
          initialPageSize: 10,
        })
      );

      expect(result.current.pageRange).toEqual([1, 2, 3, 4, 5]);
    });

    it('should show ellipsis for many pages on first page', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 200,
          initialPageSize: 10,
        })
      );

      expect(result.current.pageRange).toEqual([1, 2, 3, 4, 5, -1, 20]);
    });

    it('should show ellipsis for many pages on last page', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 20,
          total: 200,
          initialPageSize: 10,
        })
      );

      expect(result.current.pageRange).toEqual([1, -1, 15, 16, 17, 18, 19, 20]);
    });

    it('should show ellipsis on both sides for middle pages', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 10,
          total: 200,
          initialPageSize: 10,
        })
      );

      expect(result.current.pageRange).toEqual([
        1, -1, 8, 9, 10, 11, 12, -1, 20,
      ]);
    });
  });

  describe('startIndex and endIndex', () => {
    it('should calculate correct indices for first page', () => {
      const { result } = renderHook(() =>
        usePagination({
          total: 100,
          initialPageSize: 10,
        })
      );

      expect(result.current.startIndex).toBe(0);
      expect(result.current.endIndex).toBe(10);
    });

    it('should calculate correct indices for middle page', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 5,
          total: 100,
          initialPageSize: 10,
        })
      );

      expect(result.current.startIndex).toBe(40);
      expect(result.current.endIndex).toBe(50);
    });

    it('should cap endIndex at total', () => {
      const { result } = renderHook(() =>
        usePagination({
          initialPage: 10,
          total: 95,
          initialPageSize: 10,
        })
      );

      expect(result.current.startIndex).toBe(90);
      expect(result.current.endIndex).toBe(95);
    });
  });

  describe('onChange callback', () => {
    it('should call onChange when page changes', () => {
      const onChange = vi.fn();

      const { result } = renderHook(() =>
        usePagination({
          total: 100,
          onChange,
        })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(onChange).toHaveBeenCalledWith(2, 10);
    });

    it('should call onChange when pageSize changes', () => {
      const onChange = vi.fn();

      const { result } = renderHook(() =>
        usePagination({
          total: 100,
          onChange,
        })
      );

      act(() => {
        result.current.setPageSize(25);
      });

      expect(onChange).toHaveBeenCalledWith(1, 25);
    });

    it('should call onChange with correct values for setPage', () => {
      const onChange = vi.fn();

      const { result } = renderHook(() =>
        usePagination({
          total: 100,
          onChange,
        })
      );

      act(() => {
        result.current.setPage(7);
      });

      expect(onChange).toHaveBeenCalledWith(7, 10);
    });
  });

  describe('dynamic total', () => {
    it('should update when total changes', () => {
      const { result, rerender } = renderHook(
        ({ total }) =>
          usePagination({
            total,
          }),
        { initialProps: { total: 100 } }
      );

      expect(result.current.totalPages).toBe(10);

      rerender({ total: 200 });

      expect(result.current.totalPages).toBe(20);
    });

    it('should adjust page when total decreases below current page', () => {
      const { result, rerender } = renderHook(
        ({ total }) =>
          usePagination({
            initialPage: 10,
            total,
          }),
        { initialProps: { total: 100 } }
      );

      expect(result.current.page).toBe(10);

      rerender({ total: 50 });

      expect(result.current.page).toBe(5);
    });
  });
});
