/**
 * ==========================================================================
 * UTILITY FUNCTIONS
 * ==========================================================================
 *
 * Central export for all utility functions.
 *
 * Usage:
 *   import { cn, mergeClasses } from '@/lib/utils';
 *   import { breakpoints, mediaQueries } from '@/lib/utils';
 *
 * ==========================================================================
 */

// Classname utilities
export { cn, mergeClasses, isValidClassValue } from './cn';
export { default } from './cn';

// Breakpoint utilities
export {
  breakpoints,
  mediaQueries,
  isBreakpoint,
  isBelowBreakpoint,
  getCurrentBreakpoint,
  createMediaQuery,
  breakpointOrder,
  getBreakpointIndex,
  compareBreakpoints,
} from './breakpoints';

export type { BreakpointKey } from './breakpoints';
