import { expect } from 'vitest';

import type { MatcherResult } from './types';

type MatcherUtils = {
  matcherHint: (name: string, received?: string, expected?: string) => string;
  printReceived: (value: unknown) => string;
  printExpected: (value: unknown) => string;
};

const toBeWithinRange = (
  received: number,
  floor: number,
  ceiling: number
): MatcherResult => {
  const pass = received >= floor && received <= ceiling;
  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to be within range ${floor} - ${ceiling}`
        : `expected ${received} to be within range ${floor} - ${ceiling}`,
  };
};

const toHaveBeenCalledWithMatch = function (
  this: { utils: MatcherUtils; isNot: boolean },
  received: { mock: { calls: unknown[][] } },
  expected: Record<string, unknown>
): MatcherResult {
  const calls = received.mock.calls;
  const pass = calls.some((call) => {
    const arg = call[0];
    if (typeof arg !== 'object' || arg === null) return false;
    return Object.entries(expected).every(([key, value]) => {
      return (arg as Record<string, unknown>)[key] === value;
    });
  });

  return {
    pass,
    message: () =>
      pass
        ? `expected mock not to have been called with object matching ${this.utils.printExpected(expected)}`
        : `expected mock to have been called with object matching ${this.utils.printExpected(expected)}\nReceived calls: ${this.utils.printReceived(calls)}`,
  };
};

const toContainObject = function (
  this: { utils: MatcherUtils },
  received: unknown[],
  expected: Record<string, unknown>
): MatcherResult {
  const pass = received.some((item) => {
    if (typeof item !== 'object' || item === null) return false;
    return Object.entries(expected).every(([key, value]) => {
      return (item as Record<string, unknown>)[key] === value;
    });
  });

  return {
    pass,
    message: () =>
      pass
        ? `expected array not to contain object ${this.utils.printExpected(expected)}`
        : `expected array to contain object ${this.utils.printExpected(expected)}`,
  };
};

const toHaveClass = (received: Element, className: string): MatcherResult => {
  const pass = received.classList.contains(className);
  return {
    pass,
    message: () =>
      pass
        ? `expected element not to have class "${className}"`
        : `expected element to have class "${className}", but it has "${received.className}"`,
  };
};

const toHaveStyleProperty = (
  received: HTMLElement,
  property: string,
  value?: string
): MatcherResult => {
  const style = window.getComputedStyle(received);
  const actualValue = style.getPropertyValue(property);

  const pass = value !== undefined ? actualValue === value : actualValue !== '';

  return {
    pass,
    message: () => {
      if (value !== undefined) {
        return pass
          ? `expected element not to have style "${property}: ${value}"`
          : `expected element to have style "${property}: ${value}", but got "${property}: ${actualValue}"`;
      }
      return pass
        ? `expected element not to have style property "${property}"`
        : `expected element to have style property "${property}"`;
    },
  };
};

const toBeValidDate = (received: unknown): MatcherResult => {
  const pass = received instanceof Date && !isNaN(received.getTime());
  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to be a valid date`
        : `expected ${received} to be a valid date`,
  };
};

const toBeValidUUID = (received: string): MatcherResult => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const pass = uuidRegex.test(received);
  return {
    pass,
    message: () =>
      pass
        ? `expected "${received}" not to be a valid UUID`
        : `expected "${received}" to be a valid UUID`,
  };
};

const toBeValidEmail = (received: string): MatcherResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const pass = emailRegex.test(received);
  return {
    pass,
    message: () =>
      pass
        ? `expected "${received}" not to be a valid email`
        : `expected "${received}" to be a valid email`,
  };
};

const toBeValidURL = (received: string): MatcherResult => {
  let pass = false;
  try {
    new URL(received);
    pass = true;
  } catch {
    pass = false;
  }
  return {
    pass,
    message: () =>
      pass
        ? `expected "${received}" not to be a valid URL`
        : `expected "${received}" to be a valid URL`,
  };
};

const toHaveBeenCalledBefore = (
  received: { mock: { invocationCallOrder: number[] } },
  other: { mock: { invocationCallOrder: number[] } }
): MatcherResult => {
  const receivedOrder = Math.min(...received.mock.invocationCallOrder);
  const otherOrder = Math.min(...other.mock.invocationCallOrder);
  const pass = receivedOrder < otherOrder;
  return {
    pass,
    message: () =>
      pass
        ? `expected first mock not to have been called before second mock`
        : `expected first mock (call order: ${receivedOrder}) to have been called before second mock (call order: ${otherOrder})`,
  };
};

const toHaveBeenCalledAfter = (
  received: { mock: { invocationCallOrder: number[] } },
  other: { mock: { invocationCallOrder: number[] } }
): MatcherResult => {
  const receivedOrder = Math.min(...received.mock.invocationCallOrder);
  const otherOrder = Math.min(...other.mock.invocationCallOrder);
  const pass = receivedOrder > otherOrder;
  return {
    pass,
    message: () =>
      pass
        ? `expected first mock not to have been called after second mock`
        : `expected first mock (call order: ${receivedOrder}) to have been called after second mock (call order: ${otherOrder})`,
  };
};

const toHaveErrorMessage = (
  received: Error,
  expected: string | RegExp
): MatcherResult => {
  const pass =
    typeof expected === 'string'
      ? received.message === expected
      : expected.test(received.message);
  return {
    pass,
    message: () =>
      pass
        ? `expected error message not to match ${expected}`
        : `expected error message "${received.message}" to match ${expected}`,
  };
};

const toBeEmptyArray = (received: unknown[]): MatcherResult => {
  const pass = Array.isArray(received) && received.length === 0;
  return {
    pass,
    message: () =>
      pass
        ? `expected array not to be empty`
        : `expected array to be empty, but it has ${received.length} items`,
  };
};

const toHaveLength = (
  received: unknown[] | string | { length: number },
  expected: number
): MatcherResult => {
  const length = 'length' in received ? received.length : 0;
  const pass = length === expected;
  return {
    pass,
    message: () =>
      pass
        ? `expected length not to be ${expected}`
        : `expected length to be ${expected}, but got ${length}`,
  };
};

const toBeOneOf = <T>(received: T, expected: T[]): MatcherResult => {
  const pass = expected.includes(received);
  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to be one of ${JSON.stringify(expected)}`
        : `expected ${received} to be one of ${JSON.stringify(expected)}`,
  };
};

const customMatchers = {
  toBeWithinRange,
  toHaveBeenCalledWithMatch,
  toContainObject,
  toHaveClass,
  toHaveStyleProperty,
  toBeValidDate,
  toBeValidUUID,
  toBeValidEmail,
  toBeValidURL,
  toHaveBeenCalledBefore,
  toHaveBeenCalledAfter,
  toHaveErrorMessage,
  toBeEmptyArray,
  toHaveLength,
  toBeOneOf,
};

const setupCustomMatchers = (): void => {
  expect.extend(customMatchers);
};

declare module 'vitest' {
  interface Assertion<T> {
    toBeWithinRange(floor: number, ceiling: number): T;
    toHaveBeenCalledWithMatch(expected: Record<string, unknown>): T;
    toContainObject(expected: Record<string, unknown>): T;
    toHaveClass(className: string): T;
    toHaveStyleProperty(property: string, value?: string): T;
    toBeValidDate(): T;
    toBeValidUUID(): T;
    toBeValidEmail(): T;
    toBeValidURL(): T;
    toHaveBeenCalledBefore(other: unknown): T;
    toHaveBeenCalledAfter(other: unknown): T;
    toHaveErrorMessage(expected: string | RegExp): T;
    toBeEmptyArray(): T;
    toBeOneOf<U>(expected: U[]): T;
  }
}

export {
  customMatchers,
  setupCustomMatchers,
  toBeEmptyArray,
  toBeOneOf,
  toBeValidDate,
  toBeValidEmail,
  toBeValidURL,
  toBeValidUUID,
  toBeWithinRange,
  toContainObject,
  toHaveBeenCalledAfter,
  toHaveBeenCalledBefore,
  toHaveBeenCalledWithMatch,
  toHaveClass,
  toHaveErrorMessage,
  toHaveLength,
  toHaveStyleProperty,
};
