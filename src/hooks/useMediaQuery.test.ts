import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useMediaQuery,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
} from './useMediaQuery';

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when media query matches', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 1200px)'));
    expect(result.current).toBe(false);
  });
});

describe('useIsDesktop', () => {
  it('returns boolean for desktop breakpoint', () => {
    const { result } = renderHook(() => useIsDesktop());
    expect(typeof result.current).toBe('boolean');
  });
});

describe('useIsMobile', () => {
  it('returns boolean for mobile breakpoint', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe('boolean');
  });
});

describe('useIsTablet', () => {
  it('returns boolean for tablet breakpoint', () => {
    const { result } = renderHook(() => useIsTablet());
    expect(typeof result.current).toBe('boolean');
  });
});
