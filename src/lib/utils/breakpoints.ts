/**
 * ==========================================================================
 * BREAKPOINT UTILITIES
 * ==========================================================================
 *
 * JavaScript/TypeScript utilities for responsive breakpoints.
 * Mirrors the values defined in CSS (src/styles/tokens/breakpoints.css).
 *
 * Usage:
 *   import { breakpoints, mediaQueries, isBreakpoint } from '@/lib/utils/breakpoints';
 *
 *   // Use in styled-components
 *   const Wrapper = styled.div`
 *     ${mediaQueries.md} {
 *       flex-direction: row;
 *     }
 *   `;
 *
 *   // Check current breakpoint
 *   if (isBreakpoint('md')) { ... }
 *
 * ==========================================================================
 */

/**
 * Breakpoint values in pixels.
 * Must be kept in sync with CSS variables in breakpoints.css.
 */
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * Media query strings for use in CSS-in-JS libraries.
 *
 * @example
 * // In styled-components
 * const Card = styled.div`
 *   padding: 1rem;
 *
 *   ${mediaQueries.md} {
 *     padding: 2rem;
 *   }
 * `;
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  '3xl': `@media (min-width: ${breakpoints['3xl']}px)`,
  // Max-width queries (for targeting specific ranges)
  xsOnly: `@media (max-width: ${breakpoints.sm - 1}px)`,
  smOnly: `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  mdOnly: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lgOnly: `@media (min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  xlOnly: `@media (min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`,
  // Preference queries
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
  prefersDark: '@media (prefers-color-scheme: dark)',
  prefersLight: '@media (prefers-color-scheme: light)',
  prefersHighContrast: '@media (prefers-contrast: high)',
  // Device queries
  hover: '@media (hover: hover)',
  touch: '@media (hover: none)',
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
} as const;

/**
 * Check if the current viewport matches or exceeds a breakpoint.
 * Only works in browser environment.
 *
 * @param breakpoint - The breakpoint to check against
 * @returns boolean indicating if viewport is at or above the breakpoint
 *
 * @example
 * if (isBreakpoint('md')) {
 *   // Show desktop layout
 * }
 */
export const isBreakpoint = (breakpoint: BreakpointKey): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth >= breakpoints[breakpoint];
};

/**
 * Check if the current viewport is below a breakpoint.
 * Only works in browser environment.
 *
 * @param breakpoint - The breakpoint to check against
 * @returns boolean indicating if viewport is below the breakpoint
 *
 * @example
 * if (isBelowBreakpoint('md')) {
 *   // Show mobile layout
 * }
 */
export const isBelowBreakpoint = (breakpoint: BreakpointKey): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth < breakpoints[breakpoint];
};

/**
 * Get the current breakpoint name based on viewport width.
 * Only works in browser environment.
 *
 * @returns The current breakpoint key or undefined on server
 *
 * @example
 * const current = getCurrentBreakpoint();
 * // => 'md' (if viewport is 768-1023px)
 */
export const getCurrentBreakpoint = (): BreakpointKey | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const width = window.innerWidth;
  const sortedBreakpoints = Object.entries(breakpoints).sort(
    ([, a], [, b]) => b - a
  ) as [BreakpointKey, number][];

  for (const [key, value] of sortedBreakpoints) {
    if (width >= value) {
      return key;
    }
  }

  return 'xs';
};

/**
 * Create a media query string for a custom breakpoint.
 *
 * @param minWidth - Minimum width in pixels
 * @param maxWidth - Optional maximum width in pixels
 * @returns Media query string
 *
 * @example
 * const customQuery = createMediaQuery(500, 800);
 * // => '@media (min-width: 500px) and (max-width: 800px)'
 */
export const createMediaQuery = (
  minWidth?: number,
  maxWidth?: number
): string => {
  const conditions: string[] = [];

  if (minWidth !== undefined) {
    conditions.push(`(min-width: ${minWidth}px)`);
  }

  if (maxWidth !== undefined) {
    conditions.push(`(max-width: ${maxWidth}px)`);
  }

  if (conditions.length === 0) {
    return '@media all';
  }

  return `@media ${conditions.join(' and ')}`;
};

/**
 * Breakpoint order for sorting.
 */
export const breakpointOrder: BreakpointKey[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
];

/**
 * Get the index of a breakpoint in the order array.
 * Useful for comparing breakpoints.
 *
 * @param breakpoint - The breakpoint to get the index of
 * @returns The index (0-based) of the breakpoint
 */
export const getBreakpointIndex = (breakpoint: BreakpointKey): number => {
  return breakpointOrder.indexOf(breakpoint);
};

/**
 * Compare two breakpoints.
 *
 * @param a - First breakpoint
 * @param b - Second breakpoint
 * @returns Negative if a < b, 0 if equal, positive if a > b
 */
export const compareBreakpoints = (
  a: BreakpointKey,
  b: BreakpointKey
): number => {
  return getBreakpointIndex(a) - getBreakpointIndex(b);
};
