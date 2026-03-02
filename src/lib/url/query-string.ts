'use client';

import type { ParsedQuery, QueryStringOptions } from './types';

const defaultOptions: QueryStringOptions = {
  arrayFormat: 'bracket',
  arraySeparator: ',',
  skipNull: true,
  skipEmptyString: true,
  encode: true,
};

const encodeValue = (value: string, shouldEncode: boolean): string => {
  return shouldEncode ? encodeURIComponent(value) : value;
};

const decodeValue = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const parseQueryString = (
  queryString: string,
  options: QueryStringOptions = {}
): ParsedQuery => {
  const opts = { ...defaultOptions, ...options };
  const result: ParsedQuery = {};

  const query = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString;

  if (!query) {
    return result;
  }

  const pairs = query.split('&');

  for (const pair of pairs) {
    const [rawKey, rawValue] = pair.split('=');
    if (!rawKey) continue;

    const key = decodeValue(rawKey);
    const value = rawValue !== undefined ? decodeValue(rawValue) : '';

    if (opts.arrayFormat === 'bracket' && key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      const existing = result[arrayKey];

      if (Array.isArray(existing)) {
        existing.push(value);
      } else if (existing !== undefined) {
        result[arrayKey] = [existing, value];
      } else {
        result[arrayKey] = [value];
      }
    } else if (
      opts.arrayFormat === 'comma' ||
      opts.arrayFormat === 'separator'
    ) {
      const separator = opts.arraySeparator ?? ',';
      if (value.includes(separator)) {
        result[key] = value.split(separator);
      } else {
        result[key] = value;
      }
    } else if (opts.arrayFormat === 'index') {
      const match = key.match(/^(.+)\[(\d+)\]$/);
      if (match) {
        const [, arrayKey, index] = match;
        const existing = result[arrayKey!];
        if (Array.isArray(existing)) {
          existing[parseInt(index!, 10)] = value;
        } else {
          const arr: string[] = [];
          arr[parseInt(index!, 10)] = value;
          result[arrayKey!] = arr;
        }
      } else {
        result[key] = value;
      }
    } else {
      const existing = result[key];
      if (existing !== undefined) {
        result[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      } else {
        result[key] = value;
      }
    }
  }

  return result;
};

export const stringifyQueryString = (
  params: Record<string, unknown>,
  options: QueryStringOptions = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  const parts: string[] = [];

  const entries = Object.entries(params);

  for (const [key, value] of entries) {
    if (value === null || value === undefined) {
      if (!opts.skipNull) {
        parts.push(encodeValue(key, opts.encode ?? true));
      }
      continue;
    }

    if (value === '' && opts.skipEmptyString) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) continue;

      if (opts.arrayFormat === 'bracket') {
        for (const item of value) {
          if (item === null || item === undefined) continue;
          parts.push(
            `${encodeValue(`${key}[]`, opts.encode ?? true)}=${encodeValue(String(item), opts.encode ?? true)}`
          );
        }
      } else if (
        opts.arrayFormat === 'comma' ||
        opts.arrayFormat === 'separator'
      ) {
        const separator = opts.arraySeparator ?? ',';
        const joinedValue = value
          .filter((item) => item !== null && item !== undefined)
          .join(separator);
        parts.push(
          `${encodeValue(key, opts.encode ?? true)}=${encodeValue(joinedValue, opts.encode ?? true)}`
        );
      } else if (opts.arrayFormat === 'index') {
        value.forEach((item, index) => {
          if (item === null || item === undefined) return;
          parts.push(
            `${encodeValue(`${key}[${index}]`, opts.encode ?? true)}=${encodeValue(String(item), opts.encode ?? true)}`
          );
        });
      } else {
        for (const item of value) {
          if (item === null || item === undefined) continue;
          parts.push(
            `${encodeValue(key, opts.encode ?? true)}=${encodeValue(String(item), opts.encode ?? true)}`
          );
        }
      }
    } else if (typeof value === 'object') {
      parts.push(
        `${encodeValue(key, opts.encode ?? true)}=${encodeValue(JSON.stringify(value), opts.encode ?? true)}`
      );
    } else {
      parts.push(
        `${encodeValue(key, opts.encode ?? true)}=${encodeValue(String(value), opts.encode ?? true)}`
      );
    }
  }

  return parts.join('&');
};

export const updateQueryString = (
  queryString: string,
  updates: Record<string, unknown>,
  options: QueryStringOptions = {}
): string => {
  const current = parseQueryString(queryString, options);

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) {
      delete current[key];
    } else {
      current[key] = value as string | string[];
    }
  }

  return stringifyQueryString(current, options);
};

export const removeFromQueryString = (
  queryString: string,
  keys: string[],
  options: QueryStringOptions = {}
): string => {
  const current = parseQueryString(queryString, options);

  for (const key of keys) {
    delete current[key];
  }

  return stringifyQueryString(current, options);
};

export const getQueryParam = (
  queryString: string,
  key: string,
  options: QueryStringOptions = {}
): string | string[] | undefined => {
  const params = parseQueryString(queryString, options);
  return params[key];
};

export const hasQueryParam = (
  queryString: string,
  key: string,
  options: QueryStringOptions = {}
): boolean => {
  const params = parseQueryString(queryString, options);
  return key in params;
};

export const mergeQueryStrings = (...queryStrings: string[]): string => {
  const merged: ParsedQuery = {};

  for (const qs of queryStrings) {
    const parsed = parseQueryString(qs);
    Object.assign(merged, parsed);
  }

  return stringifyQueryString(merged);
};

export const sortQueryString = (
  queryString: string,
  options: QueryStringOptions = {}
): string => {
  const params = parseQueryString(queryString, options);
  const sorted: Record<string, unknown> = {};

  const keys = Object.keys(params).sort();
  for (const key of keys) {
    sorted[key] = params[key];
  }

  return stringifyQueryString(sorted, options);
};

export const pickQueryParams = (
  queryString: string,
  keys: string[],
  options: QueryStringOptions = {}
): string => {
  const params = parseQueryString(queryString, options);
  const picked: Record<string, unknown> = {};

  for (const key of keys) {
    if (key in params) {
      picked[key] = params[key];
    }
  }

  return stringifyQueryString(picked, options);
};

export const omitQueryParams = (
  queryString: string,
  keys: string[],
  options: QueryStringOptions = {}
): string => {
  const params = parseQueryString(queryString, options);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!keys.includes(key)) {
      result[key] = value;
    }
  }

  return stringifyQueryString(result, options);
};
