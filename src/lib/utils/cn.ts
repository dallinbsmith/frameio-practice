/**
 * ==========================================================================
 * CLASSNAME UTILITY (cn)
 * ==========================================================================
 *
 * A lightweight utility for conditionally joining class names together.
 * Similar to `clsx` or `classnames` packages but without external dependencies.
 *
 * Features:
 * - Handles strings, objects, arrays, and nested arrays
 * - Filters out falsy values (null, undefined, false, 0, '')
 * - TypeScript support with proper typing
 * - Zero dependencies
 *
 * Usage:
 *   cn('base', condition && 'conditional')
 *   cn('base', { active: isActive, disabled: isDisabled })
 *   cn(['array', 'of', 'classes'])
 *   cn('base', ['nested', condition && 'conditional'])
 *
 * ==========================================================================
 */

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassObject
  | ClassArray;

type ClassObject = Record<string, boolean | undefined | null>;
type ClassArray = ClassValue[];

/**
 * Conditionally join class names together.
 *
 * @param inputs - Class values to join (strings, objects, arrays)
 * @returns A single string of space-separated class names
 *
 * @example
 * // Basic usage
 * cn('btn', 'btn-primary')
 * // => 'btn btn-primary'
 *
 * @example
 * // Conditional classes
 * cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')
 * // => 'btn btn-active' (if isActive is true, isDisabled is false)
 *
 * @example
 * // Object syntax
 * cn('btn', { 'btn-active': isActive, 'btn-disabled': isDisabled })
 * // => 'btn btn-active' (if isActive is true, isDisabled is false)
 *
 * @example
 * // Array syntax
 * cn(['base', 'classes'], condition && 'conditional')
 * // => 'base classes conditional' (if condition is true)
 *
 * @example
 * // Mixed usage
 * cn(
 *   'btn',
 *   variant === 'primary' && 'btn-primary',
 *   { 'btn-disabled': disabled, 'btn-loading': loading },
 *   className
 * )
 */
export const cn = (...inputs: ClassValue[]): string => {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) {
        classes.push(nested);
      }
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
};

/**
 * Type guard to check if a value is a valid class value.
 */
export const isValidClassValue = (value: unknown): value is ClassValue => {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return true;
  }

  if (Array.isArray(value)) {
    return true;
  }

  if (typeof value === 'object') {
    return true;
  }

  return false;
};

/**
 * Merge multiple className props, filtering out undefined values.
 * Useful when forwarding className from props.
 *
 * @param baseClasses - Base classes to always include
 * @param classNameProp - Optional className from props
 * @returns Merged class string
 *
 * @example
 * // In a component
 * const Button = ({ className, ...props }) => (
 *   <button className={mergeClasses('btn btn-primary', className)} {...props} />
 * )
 */
export const mergeClasses = (
  baseClasses: string,
  classNameProp?: string
): string => {
  if (!classNameProp) {
    return baseClasses;
  }
  return `${baseClasses} ${classNameProp}`;
};

export default cn;
