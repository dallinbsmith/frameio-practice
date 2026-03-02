'use client';

import { parseQueryString, stringifyQueryString } from './query-string';

import type { ParsedQuery, UrlParts } from './types';

export const parseUrl = (url: string): UrlParts => {
  try {
    const parsed = new URL(url, 'http://localhost');
    return {
      protocol: parsed.protocol,
      host: parsed.host,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      origin: parsed.origin,
    };
  } catch {
    const questionIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');
    const searchStart = questionIndex !== -1 ? questionIndex : url.length;
    const hashStart = hashIndex !== -1 ? hashIndex : url.length;
    const searchEnd =
      hashIndex !== -1 && hashIndex > questionIndex ? hashIndex : url.length;

    return {
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: url.slice(0, Math.min(searchStart, hashStart)),
      search: questionIndex !== -1 ? url.slice(questionIndex, searchEnd) : '',
      hash: hashIndex !== -1 ? url.slice(hashIndex) : '',
      origin: '',
    };
  }
};

export const buildUrl = (
  base: string,
  path?: string | undefined,
  params?: Record<string, unknown> | undefined,
  hash?: string | undefined
): string => {
  let url = base;

  if (path) {
    const baseEndsWithSlash = base.endsWith('/');
    const pathStartsWithSlash = path.startsWith('/');

    if (baseEndsWithSlash && pathStartsWithSlash) {
      url = base + path.slice(1);
    } else if (!baseEndsWithSlash && !pathStartsWithSlash) {
      url = `${base}/${path}`;
    } else {
      url = base + path;
    }
  }

  if (params && Object.keys(params).length > 0) {
    const queryString = stringifyQueryString(params);
    if (queryString) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${queryString}`;
    }
  }

  if (hash) {
    const hashValue = hash.startsWith('#') ? hash : `#${hash}`;
    url = `${url}${hashValue}`;
  }

  return url;
};

export const joinPaths = (...paths: string[]): string => {
  return paths
    .map((path, index) => {
      if (index === 0) {
        return path.replace(/\/+$/, '');
      }
      if (index === paths.length - 1) {
        return path.replace(/^\/+/, '');
      }
      return path.replace(/^\/+/, '').replace(/\/+$/, '');
    })
    .filter(Boolean)
    .join('/');
};

export const normalizePath = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  const normalized: string[] = [];

  for (const part of parts) {
    if (part === '..') {
      normalized.pop();
    } else if (part !== '.') {
      normalized.push(part);
    }
  }

  const result = '/' + normalized.join('/');
  return path.endsWith('/') && result !== '/' ? result + '/' : result;
};

export const isAbsoluteUrl = (url: string): boolean => {
  return /^[a-z][a-z0-9+.-]*:/i.test(url);
};

export const isRelativeUrl = (url: string): boolean => {
  return !isAbsoluteUrl(url);
};

export const isSameOrigin = (url1: string, url2: string): boolean => {
  try {
    const parsed1 = new URL(url1);
    const parsed2 = new URL(url2);
    return parsed1.origin === parsed2.origin;
  } catch {
    return false;
  }
};

export const getOrigin = (url: string): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

export const getPathname = (url: string): string => {
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch {
    return url.split('?')[0]?.split('#')[0] ?? '';
  }
};

export const getSearch = (url: string): string => {
  try {
    return new URL(url, 'http://localhost').search;
  } catch {
    const queryStart = url.indexOf('?');
    if (queryStart === -1) return '';
    const hashStart = url.indexOf('#', queryStart);
    return hashStart === -1
      ? url.slice(queryStart)
      : url.slice(queryStart, hashStart);
  }
};

export const getHash = (url: string): string => {
  try {
    return new URL(url, 'http://localhost').hash;
  } catch {
    const hashStart = url.indexOf('#');
    return hashStart === -1 ? '' : url.slice(hashStart);
  }
};

export const getSearchParams = (url: string): ParsedQuery => {
  const search = getSearch(url);
  return parseQueryString(search);
};

export const setSearchParams = (
  url: string,
  params: Record<string, unknown>
): string => {
  const parts = parseUrl(url);
  const currentParams = parseQueryString(parts.search);
  const newParams = { ...currentParams, ...params };
  const queryString = stringifyQueryString(newParams);

  let result = parts.pathname;
  if (queryString) {
    result += `?${queryString}`;
  }
  if (parts.hash) {
    result += parts.hash;
  }

  if (parts.origin && parts.origin !== 'http://localhost') {
    result = `${parts.origin}${result}`;
  }

  return result;
};

export const removeSearchParams = (url: string, keys: string[]): string => {
  const parts = parseUrl(url);
  const params = parseQueryString(parts.search);

  for (const key of keys) {
    delete params[key];
  }

  const queryString = stringifyQueryString(params);

  let result = parts.pathname;
  if (queryString) {
    result += `?${queryString}`;
  }
  if (parts.hash) {
    result += parts.hash;
  }

  if (parts.origin && parts.origin !== 'http://localhost') {
    result = `${parts.origin}${result}`;
  }

  return result;
};

export const setHash = (url: string, hash: string): string => {
  const parts = parseUrl(url);
  const hashValue = hash.startsWith('#') ? hash : `#${hash}`;

  let result = parts.pathname;
  if (parts.search) {
    result += parts.search;
  }
  if (hash) {
    result += hashValue;
  }

  if (parts.origin && parts.origin !== 'http://localhost') {
    result = `${parts.origin}${result}`;
  }

  return result;
};

export const removeHash = (url: string): string => {
  const hashIndex = url.indexOf('#');
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
};

export const getFileExtension = (url: string): string => {
  const pathname = getPathname(url);
  const lastDot = pathname.lastIndexOf('.');
  const lastSlash = pathname.lastIndexOf('/');

  if (lastDot === -1 || lastDot < lastSlash) {
    return '';
  }

  return pathname.slice(lastDot + 1).toLowerCase();
};

export const getFilename = (url: string): string => {
  const pathname = getPathname(url);
  const lastSlash = pathname.lastIndexOf('/');
  return pathname.slice(lastSlash + 1);
};

export const getDirname = (url: string): string => {
  const pathname = getPathname(url);
  const lastSlash = pathname.lastIndexOf('/');
  return lastSlash === -1 ? '' : pathname.slice(0, lastSlash);
};

export const isExternalUrl = (
  url: string,
  origin?: string | undefined
): boolean => {
  if (!isAbsoluteUrl(url)) {
    return false;
  }

  const currentOrigin =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return !isSameOrigin(url, currentOrigin);
};

export const ensureTrailingSlash = (url: string): string => {
  const parts = parseUrl(url);
  let pathname = parts.pathname;

  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  let result = pathname;
  if (parts.search) result += parts.search;
  if (parts.hash) result += parts.hash;

  if (parts.origin && parts.origin !== 'http://localhost') {
    result = `${parts.origin}${result}`;
  }

  return result;
};

export const removeTrailingSlash = (url: string): string => {
  const parts = parseUrl(url);
  let pathname = parts.pathname;

  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  let result = pathname;
  if (parts.search) result += parts.search;
  if (parts.hash) result += parts.hash;

  if (parts.origin && parts.origin !== 'http://localhost') {
    result = `${parts.origin}${result}`;
  }

  return result;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const createSlug = (
  text: string,
  existingSlugs: string[] = []
): string => {
  const slug = slugify(text);

  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  let counter = 1;
  while (existingSlugs.includes(`${slug}-${counter}`)) {
    counter++;
  }

  return `${slug}-${counter}`;
};
