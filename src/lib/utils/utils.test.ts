import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  breakpointOrder,
  breakpoints,
  compareBreakpoints,
  createMediaQuery,
  getBreakpointIndex,
  getCurrentBreakpoint,
  isBelowBreakpoint,
  isBreakpoint,
  mediaQueries,
} from './breakpoints';
import { cn, isValidClassValue, mergeClasses } from './cn';

describe('cn (className utility)', () => {
  describe('basic string handling', () => {
    it('joins multiple strings with spaces', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });

    it('handles single string', () => {
      expect(cn('single')).toBe('single');
    });

    it('handles empty call', () => {
      expect(cn()).toBe('');
    });

    it('preserves spaces within strings', () => {
      expect(cn('class one', 'class two')).toBe('class one class two');
    });
  });

  describe('falsy value filtering', () => {
    it('filters out null', () => {
      expect(cn('a', null, 'b')).toBe('a b');
    });

    it('filters out undefined', () => {
      expect(cn('a', undefined, 'b')).toBe('a b');
    });

    it('filters out false', () => {
      expect(cn('a', false, 'b')).toBe('a b');
    });

    it('filters out empty string', () => {
      expect(cn('a', '', 'b')).toBe('a b');
    });

    it('filters out zero', () => {
      expect(cn('a', 0, 'b')).toBe('a b');
    });

    it('handles all falsy values', () => {
      expect(cn(null, undefined, false, '', 0)).toBe('');
    });
  });

  describe('conditional classes', () => {
    it('includes class when condition is true', () => {
      const isActive = true;
      expect(cn('btn', isActive && 'btn-active')).toBe('btn btn-active');
    });

    it('excludes class when condition is false', () => {
      const isActive = false;
      expect(cn('btn', isActive && 'btn-active')).toBe('btn');
    });

    it('handles multiple conditions', () => {
      const isActive = true;
      const isDisabled = false;
      const isLoading = true;
      expect(
        cn(
          'btn',
          isActive && 'active',
          isDisabled && 'disabled',
          isLoading && 'loading'
        )
      ).toBe('btn active loading');
    });
  });

  describe('object syntax', () => {
    it('includes keys with truthy values', () => {
      expect(cn({ active: true, disabled: false })).toBe('active');
    });

    it('handles all true values', () => {
      expect(cn({ a: true, b: true, c: true })).toBe('a b c');
    });

    it('handles all false values', () => {
      expect(cn({ a: false, b: false, c: false })).toBe('');
    });

    it('handles null and undefined values', () => {
      expect(cn({ a: true, b: null, c: undefined })).toBe('a');
    });

    it('combines with string classes', () => {
      expect(cn('base', { active: true, disabled: false })).toBe('base active');
    });

    it('handles empty object', () => {
      expect(cn({})).toBe('');
    });
  });

  describe('array syntax', () => {
    it('flattens simple arrays', () => {
      expect(cn(['a', 'b', 'c'])).toBe('a b c');
    });

    it('handles arrays with falsy values', () => {
      expect(cn(['a', false, 'b', null, 'c'])).toBe('a b c');
    });

    it('handles nested arrays', () => {
      expect(cn(['a', ['b', 'c']])).toBe('a b c');
    });

    it('handles deeply nested arrays', () => {
      expect(cn(['a', ['b', ['c', 'd']]])).toBe('a b c d');
    });

    it('combines arrays with other types', () => {
      expect(cn('base', ['from', 'array'], { obj: true })).toBe(
        'base from array obj'
      );
    });

    it('handles empty arrays', () => {
      expect(cn([])).toBe('');
    });

    it('handles array of empty arrays', () => {
      expect(cn([[], []])).toBe('');
    });
  });

  describe('number handling', () => {
    it('converts numbers to strings', () => {
      expect(cn(1, 2, 3)).toBe('1 2 3');
    });

    it('handles negative numbers', () => {
      expect(cn(-1, -2)).toBe('-1 -2');
    });

    it('handles floating point numbers', () => {
      expect(cn(1.5, 2.5)).toBe('1.5 2.5');
    });

    it('filters out zero (falsy)', () => {
      expect(cn(1, 0, 2)).toBe('1 2');
    });
  });

  describe('mixed usage', () => {
    it('handles complex real-world example', () => {
      const variant = 'primary';
      const size = 'lg';
      const disabled = false;
      const loading = true;
      const className = 'custom-class';

      const result = cn(
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        size === 'lg' && 'btn-lg',
        { 'btn-disabled': disabled, 'btn-loading': loading },
        className
      );

      expect(result).toBe('btn btn-primary btn-lg btn-loading custom-class');
    });

    it('handles Tailwind-style utility classes', () => {
      const result = cn('flex', 'items-center', 'justify-between', 'p-4', {
        'bg-blue-500': true,
        'text-white': true,
        hidden: false,
      });

      expect(result).toBe(
        'flex items-center justify-between p-4 bg-blue-500 text-white'
      );
    });
  });
});

describe('isValidClassValue', () => {
  it('returns false for null', () => {
    expect(isValidClassValue(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidClassValue(undefined)).toBe(false);
  });

  it('returns false for false', () => {
    expect(isValidClassValue(false)).toBe(false);
  });

  it('returns true for strings', () => {
    expect(isValidClassValue('class')).toBe(true);
    expect(isValidClassValue('')).toBe(true);
  });

  it('returns true for numbers', () => {
    expect(isValidClassValue(123)).toBe(true);
    expect(isValidClassValue(0)).toBe(true);
  });

  it('returns true for arrays', () => {
    expect(isValidClassValue([])).toBe(true);
    expect(isValidClassValue(['a', 'b'])).toBe(true);
  });

  it('returns true for objects', () => {
    expect(isValidClassValue({})).toBe(true);
    expect(isValidClassValue({ active: true })).toBe(true);
  });

  it('returns false for true boolean', () => {
    expect(isValidClassValue(true)).toBe(false);
  });

  it('returns false for functions', () => {
    expect(isValidClassValue(() => {})).toBe(false);
  });

  it('returns false for symbols', () => {
    expect(isValidClassValue(Symbol('test'))).toBe(false);
  });
});

describe('mergeClasses', () => {
  it('returns base classes when classNameProp is undefined', () => {
    expect(mergeClasses('base classes')).toBe('base classes');
  });

  it('returns base classes when classNameProp is empty', () => {
    expect(mergeClasses('base classes', '')).toBe('base classes');
  });

  it('merges base classes with classNameProp', () => {
    expect(mergeClasses('base', 'custom')).toBe('base custom');
  });

  it('preserves spacing in both inputs', () => {
    expect(mergeClasses('base one two', 'custom three')).toBe(
      'base one two custom three'
    );
  });
});

describe('Breakpoints', () => {
  describe('breakpoints object', () => {
    it('has all expected breakpoint keys', () => {
      expect(breakpoints).toHaveProperty('xs');
      expect(breakpoints).toHaveProperty('sm');
      expect(breakpoints).toHaveProperty('md');
      expect(breakpoints).toHaveProperty('lg');
      expect(breakpoints).toHaveProperty('xl');
      expect(breakpoints).toHaveProperty('2xl');
      expect(breakpoints).toHaveProperty('3xl');
    });

    it('has breakpoints in ascending order', () => {
      expect(breakpoints.xs).toBeLessThan(breakpoints.sm);
      expect(breakpoints.sm).toBeLessThan(breakpoints.md);
      expect(breakpoints.md).toBeLessThan(breakpoints.lg);
      expect(breakpoints.lg).toBeLessThan(breakpoints.xl);
      expect(breakpoints.xl).toBeLessThan(breakpoints['2xl']);
      expect(breakpoints['2xl']).toBeLessThan(breakpoints['3xl']);
    });

    it('has correct values', () => {
      expect(breakpoints.xs).toBe(320);
      expect(breakpoints.sm).toBe(640);
      expect(breakpoints.md).toBe(768);
      expect(breakpoints.lg).toBe(1024);
      expect(breakpoints.xl).toBe(1280);
      expect(breakpoints['2xl']).toBe(1536);
      expect(breakpoints['3xl']).toBe(1920);
    });
  });

  describe('mediaQueries', () => {
    it('has min-width queries for all breakpoints', () => {
      expect(mediaQueries.xs).toBe('@media (min-width: 320px)');
      expect(mediaQueries.sm).toBe('@media (min-width: 640px)');
      expect(mediaQueries.md).toBe('@media (min-width: 768px)');
      expect(mediaQueries.lg).toBe('@media (min-width: 1024px)');
      expect(mediaQueries.xl).toBe('@media (min-width: 1280px)');
      expect(mediaQueries['2xl']).toBe('@media (min-width: 1536px)');
      expect(mediaQueries['3xl']).toBe('@media (min-width: 1920px)');
    });

    it('has "only" queries for ranges', () => {
      expect(mediaQueries.xsOnly).toBe('@media (max-width: 639px)');
      expect(mediaQueries.smOnly).toBe(
        '@media (min-width: 640px) and (max-width: 767px)'
      );
      expect(mediaQueries.mdOnly).toBe(
        '@media (min-width: 768px) and (max-width: 1023px)'
      );
    });

    it('has preference queries', () => {
      expect(mediaQueries.prefersReducedMotion).toBe(
        '@media (prefers-reduced-motion: reduce)'
      );
      expect(mediaQueries.prefersDark).toBe(
        '@media (prefers-color-scheme: dark)'
      );
      expect(mediaQueries.prefersLight).toBe(
        '@media (prefers-color-scheme: light)'
      );
      expect(mediaQueries.prefersHighContrast).toBe(
        '@media (prefers-contrast: high)'
      );
    });

    it('has device queries', () => {
      expect(mediaQueries.hover).toBe('@media (hover: hover)');
      expect(mediaQueries.touch).toBe('@media (hover: none)');
      expect(mediaQueries.portrait).toBe('@media (orientation: portrait)');
      expect(mediaQueries.landscape).toBe('@media (orientation: landscape)');
    });
  });

  describe('isBreakpoint', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns false when window is undefined (SSR)', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - testing SSR environment
      delete globalThis.window;

      expect(isBreakpoint('md')).toBe(false);

      globalThis.window = originalWindow;
    });

    it('returns true when viewport is at or above breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 1024 });

      expect(isBreakpoint('lg')).toBe(true);
      expect(isBreakpoint('md')).toBe(true);
      expect(isBreakpoint('sm')).toBe(true);

      vi.unstubAllGlobals();
    });

    it('returns false when viewport is below breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 600 });

      expect(isBreakpoint('md')).toBe(false);
      expect(isBreakpoint('lg')).toBe(false);

      vi.unstubAllGlobals();
    });

    it('returns true when viewport exactly matches breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 768 });

      expect(isBreakpoint('md')).toBe(true);

      vi.unstubAllGlobals();
    });
  });

  describe('isBelowBreakpoint', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns false when window is undefined (SSR)', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - testing SSR environment
      delete globalThis.window;

      expect(isBelowBreakpoint('md')).toBe(false);

      globalThis.window = originalWindow;
    });

    it('returns true when viewport is below breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 500 });

      expect(isBelowBreakpoint('md')).toBe(true);
      expect(isBelowBreakpoint('lg')).toBe(true);

      vi.unstubAllGlobals();
    });

    it('returns false when viewport is at or above breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 1024 });

      expect(isBelowBreakpoint('md')).toBe(false);
      expect(isBelowBreakpoint('lg')).toBe(false);

      vi.unstubAllGlobals();
    });
  });

  describe('getCurrentBreakpoint', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns undefined when window is undefined (SSR)', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - testing SSR environment
      delete globalThis.window;

      expect(getCurrentBreakpoint()).toBeUndefined();

      globalThis.window = originalWindow;
    });

    it('returns correct breakpoint for various widths', () => {
      vi.stubGlobal('window', { innerWidth: 1920 });
      expect(getCurrentBreakpoint()).toBe('3xl');
      vi.unstubAllGlobals();

      vi.stubGlobal('window', { innerWidth: 1536 });
      expect(getCurrentBreakpoint()).toBe('2xl');
      vi.unstubAllGlobals();

      vi.stubGlobal('window', { innerWidth: 1280 });
      expect(getCurrentBreakpoint()).toBe('xl');
      vi.unstubAllGlobals();

      vi.stubGlobal('window', { innerWidth: 1024 });
      expect(getCurrentBreakpoint()).toBe('lg');
      vi.unstubAllGlobals();

      vi.stubGlobal('window', { innerWidth: 768 });
      expect(getCurrentBreakpoint()).toBe('md');
      vi.unstubAllGlobals();

      vi.stubGlobal('window', { innerWidth: 640 });
      expect(getCurrentBreakpoint()).toBe('sm');
      vi.unstubAllGlobals();

      vi.stubGlobal('window', { innerWidth: 320 });
      expect(getCurrentBreakpoint()).toBe('xs');
      vi.unstubAllGlobals();
    });

    it('returns xs for very small widths', () => {
      vi.stubGlobal('window', { innerWidth: 200 });

      expect(getCurrentBreakpoint()).toBe('xs');

      vi.unstubAllGlobals();
    });
  });

  describe('createMediaQuery', () => {
    it('creates min-width query', () => {
      expect(createMediaQuery(768)).toBe('@media (min-width: 768px)');
    });

    it('creates max-width query', () => {
      expect(createMediaQuery(undefined, 1024)).toBe(
        '@media (max-width: 1024px)'
      );
    });

    it('creates range query', () => {
      expect(createMediaQuery(768, 1024)).toBe(
        '@media (min-width: 768px) and (max-width: 1024px)'
      );
    });

    it('returns @media all for no parameters', () => {
      expect(createMediaQuery()).toBe('@media all');
    });

    it('handles zero values', () => {
      expect(createMediaQuery(0)).toBe('@media (min-width: 0px)');
    });
  });

  describe('breakpointOrder', () => {
    it('contains all breakpoints in correct order', () => {
      expect(breakpointOrder).toEqual([
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
        '3xl',
      ]);
    });

    it('has same length as breakpoints object', () => {
      expect(breakpointOrder.length).toBe(Object.keys(breakpoints).length);
    });
  });

  describe('getBreakpointIndex', () => {
    it('returns correct indices', () => {
      expect(getBreakpointIndex('xs')).toBe(0);
      expect(getBreakpointIndex('sm')).toBe(1);
      expect(getBreakpointIndex('md')).toBe(2);
      expect(getBreakpointIndex('lg')).toBe(3);
      expect(getBreakpointIndex('xl')).toBe(4);
      expect(getBreakpointIndex('2xl')).toBe(5);
      expect(getBreakpointIndex('3xl')).toBe(6);
    });
  });

  describe('compareBreakpoints', () => {
    it('returns negative when first is smaller', () => {
      expect(compareBreakpoints('sm', 'lg')).toBeLessThan(0);
      expect(compareBreakpoints('xs', '3xl')).toBeLessThan(0);
    });

    it('returns positive when first is larger', () => {
      expect(compareBreakpoints('lg', 'sm')).toBeGreaterThan(0);
      expect(compareBreakpoints('3xl', 'xs')).toBeGreaterThan(0);
    });

    it('returns zero when equal', () => {
      expect(compareBreakpoints('md', 'md')).toBe(0);
      expect(compareBreakpoints('xl', 'xl')).toBe(0);
    });

    it('can be used for sorting', () => {
      const unsorted: Array<'lg' | 'xs' | 'md' | 'sm'> = [
        'lg',
        'xs',
        'md',
        'sm',
      ];
      const sorted = [...unsorted].sort(compareBreakpoints);
      expect(sorted).toEqual(['xs', 'sm', 'md', 'lg']);
    });
  });
});
