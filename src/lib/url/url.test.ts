'use client';

import { describe, expect, it } from 'vitest';

import {
  buildUrl,
  createMatcher,
  createRoutePattern,
  createSlug,
  ensureTrailingSlash,
  extractPathSegments,
  generatePath,
  getDirname,
  getFileExtension,
  getFilename,
  getHash,
  getOrigin,
  getParentPath,
  getPathname,
  getQueryParam,
  getRelativePath,
  getSearch,
  getSearchParams,
  hasQueryParam,
  isAbsoluteUrl,
  isActiveRoute,
  isChildPath,
  isExternalUrl,
  isRelativeUrl,
  isSameOrigin,
  joinPaths,
  matchRoute,
  matchRoutes,
  mergeQueryStrings,
  normalizePath,
  omitQueryParams,
  parseQueryString,
  parseUrl,
  pickQueryParams,
  rankRoute,
  removeFromQueryString,
  removeHash,
  removeSearchParams,
  removeTrailingSlash,
  setHash,
  setSearchParams,
  slugify,
  sortQueryString,
  sortRoutesBySpecificity,
  stringifyQueryString,
  updateQueryString,
} from './index';

describe('URL Utilities', () => {
  describe('Query String', () => {
    describe('parseQueryString', () => {
      it('parses simple query string', () => {
        const result = parseQueryString('?foo=bar&baz=qux');
        expect(result).toEqual({ foo: 'bar', baz: 'qux' });
      });

      it('handles query string without leading ?', () => {
        const result = parseQueryString('foo=bar');
        expect(result).toEqual({ foo: 'bar' });
      });

      it('handles empty query string', () => {
        const result = parseQueryString('');
        expect(result).toEqual({});
      });

      it('parses bracket array format', () => {
        const result = parseQueryString('tags[]=a&tags[]=b&tags[]=c');
        expect(result).toEqual({ tags: ['a', 'b', 'c'] });
      });

      it('parses comma-separated arrays', () => {
        const result = parseQueryString('tags=a,b,c', { arrayFormat: 'comma' });
        expect(result).toEqual({ tags: ['a', 'b', 'c'] });
      });

      it('handles encoded values', () => {
        const result = parseQueryString('name=John%20Doe&city=New%20York');
        expect(result).toEqual({ name: 'John Doe', city: 'New York' });
      });

      it('handles duplicate keys', () => {
        const result = parseQueryString('key=value1&key=value2');
        expect(result).toEqual({ key: ['value1', 'value2'] });
      });
    });

    describe('stringifyQueryString', () => {
      it('stringifies simple object', () => {
        const result = stringifyQueryString({ foo: 'bar', baz: 'qux' });
        expect(result).toBe('foo=bar&baz=qux');
      });

      it('handles arrays with bracket format', () => {
        const result = stringifyQueryString({ tags: ['a', 'b', 'c'] });
        expect(result).toBe('tags%5B%5D=a&tags%5B%5D=b&tags%5B%5D=c');
      });

      it('handles arrays with comma format', () => {
        const result = stringifyQueryString(
          { tags: ['a', 'b', 'c'] },
          { arrayFormat: 'comma' }
        );
        expect(result).toBe('tags=a%2Cb%2Cc');
      });

      it('skips null values by default', () => {
        const result = stringifyQueryString({ foo: 'bar', baz: null });
        expect(result).toBe('foo=bar');
      });

      it('skips empty strings by default', () => {
        const result = stringifyQueryString({ foo: 'bar', baz: '' });
        expect(result).toBe('foo=bar');
      });

      it('handles objects by JSON stringifying', () => {
        const result = stringifyQueryString({ data: { nested: true } });
        expect(result).toBe('data=%7B%22nested%22%3Atrue%7D');
      });
    });

    describe('updateQueryString', () => {
      it('updates existing param', () => {
        const result = updateQueryString('foo=bar', { foo: 'baz' });
        expect(result).toBe('foo=baz');
      });

      it('adds new param', () => {
        const result = updateQueryString('foo=bar', { baz: 'qux' });
        expect(result).toBe('foo=bar&baz=qux');
      });

      it('removes param with undefined', () => {
        const result = updateQueryString('foo=bar&baz=qux', { baz: undefined });
        expect(result).toBe('foo=bar');
      });
    });

    describe('removeFromQueryString', () => {
      it('removes specified keys', () => {
        const result = removeFromQueryString('a=1&b=2&c=3', ['b']);
        expect(result).toBe('a=1&c=3');
      });

      it('removes multiple keys', () => {
        const result = removeFromQueryString('a=1&b=2&c=3', ['a', 'c']);
        expect(result).toBe('b=2');
      });
    });

    describe('getQueryParam', () => {
      it('gets single param value', () => {
        const result = getQueryParam('foo=bar&baz=qux', 'foo');
        expect(result).toBe('bar');
      });

      it('returns undefined for missing param', () => {
        const result = getQueryParam('foo=bar', 'missing');
        expect(result).toBeUndefined();
      });
    });

    describe('hasQueryParam', () => {
      it('returns true for existing param', () => {
        expect(hasQueryParam('foo=bar', 'foo')).toBe(true);
      });

      it('returns false for missing param', () => {
        expect(hasQueryParam('foo=bar', 'missing')).toBe(false);
      });
    });

    describe('mergeQueryStrings', () => {
      it('merges multiple query strings', () => {
        const result = mergeQueryStrings('a=1', 'b=2', 'c=3');
        expect(result).toBe('a=1&b=2&c=3');
      });

      it('later values override earlier ones', () => {
        const result = mergeQueryStrings('a=1', 'a=2');
        expect(result).toBe('a=2');
      });
    });

    describe('sortQueryString', () => {
      it('sorts params alphabetically', () => {
        const result = sortQueryString('c=3&a=1&b=2');
        expect(result).toBe('a=1&b=2&c=3');
      });
    });

    describe('pickQueryParams', () => {
      it('picks specified keys', () => {
        const result = pickQueryParams('a=1&b=2&c=3', ['a', 'c']);
        expect(result).toBe('a=1&c=3');
      });
    });

    describe('omitQueryParams', () => {
      it('omits specified keys', () => {
        const result = omitQueryParams('a=1&b=2&c=3', ['b']);
        expect(result).toBe('a=1&c=3');
      });
    });
  });

  describe('URL Utils', () => {
    describe('parseUrl', () => {
      it('parses full URL', () => {
        const result = parseUrl('https://example.com:8080/path?query=1#hash');
        expect(result.protocol).toBe('https:');
        expect(result.hostname).toBe('example.com');
        expect(result.port).toBe('8080');
        expect(result.pathname).toBe('/path');
        expect(result.search).toBe('?query=1');
        expect(result.hash).toBe('#hash');
      });

      it('handles relative URLs', () => {
        const result = parseUrl('/path?query=1#hash');
        expect(result.pathname).toBe('/path');
        expect(result.search).toBe('?query=1');
        expect(result.hash).toBe('#hash');
      });
    });

    describe('buildUrl', () => {
      it('builds URL from base and path', () => {
        const result = buildUrl('https://example.com', '/api/users');
        expect(result).toBe('https://example.com/api/users');
      });

      it('handles params', () => {
        const result = buildUrl('https://example.com', '/api', { page: 1 });
        expect(result).toBe('https://example.com/api?page=1');
      });

      it('handles hash', () => {
        const result = buildUrl(
          'https://example.com',
          '/page',
          undefined,
          'section'
        );
        expect(result).toBe('https://example.com/page#section');
      });

      it('handles trailing/leading slashes', () => {
        expect(buildUrl('https://example.com/', '/path')).toBe(
          'https://example.com/path'
        );
        expect(buildUrl('https://example.com', 'path')).toBe(
          'https://example.com/path'
        );
      });
    });

    describe('joinPaths', () => {
      it('joins path segments', () => {
        expect(joinPaths('a', 'b', 'c')).toBe('a/b/c');
      });

      it('handles leading/trailing slashes', () => {
        expect(joinPaths('/a/', '/b/', '/c')).toBe('/a/b/c');
      });
    });

    describe('normalizePath', () => {
      it('resolves . and ..', () => {
        expect(normalizePath('/a/b/../c')).toBe('/a/c');
        expect(normalizePath('/a/./b/c')).toBe('/a/b/c');
      });

      it('preserves trailing slash', () => {
        expect(normalizePath('/a/b/')).toBe('/a/b/');
      });
    });

    describe('isAbsoluteUrl', () => {
      it('identifies absolute URLs', () => {
        expect(isAbsoluteUrl('https://example.com')).toBe(true);
        expect(isAbsoluteUrl('mailto:test@example.com')).toBe(true);
        expect(isAbsoluteUrl('/path')).toBe(false);
        expect(isAbsoluteUrl('path')).toBe(false);
      });
    });

    describe('isRelativeUrl', () => {
      it('identifies relative URLs', () => {
        expect(isRelativeUrl('/path')).toBe(true);
        expect(isRelativeUrl('path')).toBe(true);
        expect(isRelativeUrl('https://example.com')).toBe(false);
      });
    });

    describe('isSameOrigin', () => {
      it('compares origins', () => {
        expect(
          isSameOrigin('https://example.com/a', 'https://example.com/b')
        ).toBe(true);
        expect(isSameOrigin('https://example.com', 'https://other.com')).toBe(
          false
        );
      });
    });

    describe('getOrigin', () => {
      it('extracts origin', () => {
        expect(getOrigin('https://example.com:8080/path')).toBe(
          'https://example.com:8080'
        );
      });
    });

    describe('getPathname', () => {
      it('extracts pathname', () => {
        expect(getPathname('https://example.com/path?query=1')).toBe('/path');
        expect(getPathname('/path?query=1#hash')).toBe('/path');
      });
    });

    describe('getSearch', () => {
      it('extracts search', () => {
        expect(getSearch('https://example.com/path?query=1')).toBe('?query=1');
        expect(getSearch('/path')).toBe('');
      });
    });

    describe('getHash', () => {
      it('extracts hash', () => {
        expect(getHash('https://example.com/path#section')).toBe('#section');
        expect(getHash('/path')).toBe('');
      });
    });

    describe('getSearchParams', () => {
      it('gets params as object', () => {
        const result = getSearchParams('/path?foo=bar&baz=qux');
        expect(result).toEqual({ foo: 'bar', baz: 'qux' });
      });
    });

    describe('setSearchParams', () => {
      it('sets new params', () => {
        const result = setSearchParams('/path?foo=bar', { baz: 'qux' });
        expect(result).toBe('/path?foo=bar&baz=qux');
      });
    });

    describe('removeSearchParams', () => {
      it('removes params', () => {
        const result = removeSearchParams('/path?foo=bar&baz=qux', ['baz']);
        expect(result).toBe('/path?foo=bar');
      });
    });

    describe('setHash', () => {
      it('sets hash', () => {
        expect(setHash('/path', 'section')).toBe('/path#section');
        expect(setHash('/path', '#section')).toBe('/path#section');
      });
    });

    describe('removeHash', () => {
      it('removes hash', () => {
        expect(removeHash('/path#section')).toBe('/path');
      });
    });

    describe('getFileExtension', () => {
      it('extracts extension', () => {
        expect(getFileExtension('/file.txt')).toBe('txt');
        expect(getFileExtension('/file.test.js')).toBe('js');
        expect(getFileExtension('/file')).toBe('');
      });
    });

    describe('getFilename', () => {
      it('extracts filename', () => {
        expect(getFilename('/path/to/file.txt')).toBe('file.txt');
      });
    });

    describe('getDirname', () => {
      it('extracts dirname', () => {
        expect(getDirname('/path/to/file.txt')).toBe('/path/to');
      });
    });

    describe('isExternalUrl', () => {
      it('identifies external URLs', () => {
        expect(isExternalUrl('https://other.com', 'https://example.com')).toBe(
          true
        );
        expect(isExternalUrl('/path', 'https://example.com')).toBe(false);
      });
    });

    describe('ensureTrailingSlash', () => {
      it('adds trailing slash', () => {
        expect(ensureTrailingSlash('/path')).toBe('/path/');
        expect(ensureTrailingSlash('/path/')).toBe('/path/');
      });
    });

    describe('removeTrailingSlash', () => {
      it('removes trailing slash', () => {
        expect(removeTrailingSlash('/path/')).toBe('/path');
        expect(removeTrailingSlash('/path')).toBe('/path');
        expect(removeTrailingSlash('/')).toBe('/');
      });
    });

    describe('slugify', () => {
      it('creates slugs', () => {
        expect(slugify('Hello World')).toBe('hello-world');
        expect(slugify('Test 123!')).toBe('test-123');
        expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      });
    });

    describe('createSlug', () => {
      it('creates unique slugs', () => {
        expect(createSlug('Hello World', [])).toBe('hello-world');
        expect(createSlug('Hello World', ['hello-world'])).toBe(
          'hello-world-1'
        );
        expect(
          createSlug('Hello World', ['hello-world', 'hello-world-1'])
        ).toBe('hello-world-2');
      });
    });
  });

  describe('Route Matching', () => {
    describe('createRoutePattern', () => {
      it('creates pattern with params', () => {
        const pattern = createRoutePattern('/users/:id');
        expect(pattern.paramNames).toEqual(['id']);
      });

      it('creates pattern with optional params', () => {
        const pattern = createRoutePattern('/posts/:id?');
        expect(pattern.paramNames).toEqual(['id']);
      });

      it('creates pattern with wildcard params', () => {
        const pattern = createRoutePattern('/files/:path*');
        expect(pattern.paramNames).toEqual(['path']);
      });
    });

    describe('matchRoute', () => {
      it('matches simple routes', () => {
        const result = matchRoute('/users/123', '/users/:id');
        expect(result).not.toBeNull();
        expect(result?.params).toEqual({ id: '123' });
      });

      it('matches routes with multiple params', () => {
        const result = matchRoute(
          '/users/123/posts/456',
          '/users/:userId/posts/:postId'
        );
        expect(result?.params).toEqual({ userId: '123', postId: '456' });
      });

      it('returns null for non-matching routes', () => {
        const result = matchRoute('/other/path', '/users/:id');
        expect(result).toBeNull();
      });

      it('extracts query params', () => {
        const result = matchRoute('/users/123?sort=asc', '/users/:id');
        expect(result?.query).toEqual({ sort: 'asc' });
      });

      it('extracts hash', () => {
        const result = matchRoute('/users/123#profile', '/users/:id');
        expect(result?.hash).toBe('profile');
      });
    });

    describe('matchRoutes', () => {
      it('matches first matching route', () => {
        const result = matchRoutes('/about', ['/home', '/about', '/contact']);
        expect(result).not.toBeNull();
        expect(result?.path).toBe('/about');
      });

      it('returns null if no routes match', () => {
        const result = matchRoutes('/other', ['/home', '/about']);
        expect(result).toBeNull();
      });
    });

    describe('generatePath', () => {
      it('generates path with params', () => {
        const result = generatePath('/users/:id', { id: '123' });
        expect(result).toBe('/users/123');
      });

      it('removes optional params if not provided', () => {
        const result = generatePath('/users/:id/:tab?', { id: '123' });
        expect(result).toBe('/users/123/');
      });

      it('encodes param values', () => {
        const result = generatePath('/search/:query', { query: 'hello world' });
        expect(result).toBe('/search/hello%20world');
      });
    });

    describe('rankRoute', () => {
      it('ranks static routes higher', () => {
        expect(rankRoute('/static/path')).toBeGreaterThan(
          rankRoute('/dynamic/:id')
        );
      });

      it('ranks specific params higher than wildcards', () => {
        expect(rankRoute('/:id')).toBeGreaterThan(rankRoute('/:path*'));
      });
    });

    describe('sortRoutesBySpecificity', () => {
      it('sorts routes by specificity', () => {
        const routes = ['/:path*', '/users/:id', '/users'];
        const sorted = sortRoutesBySpecificity(routes);
        expect(sorted[0]).toBe('/users/:id');
        expect(sorted[2]).toBe('/:path*');
      });
    });

    describe('isActiveRoute', () => {
      it('matches exact routes', () => {
        expect(isActiveRoute('/users', '/users', true)).toBe(true);
        expect(isActiveRoute('/users/123', '/users', true)).toBe(false);
      });

      it('matches prefix routes', () => {
        expect(isActiveRoute('/users/123', '/users')).toBe(true);
        expect(isActiveRoute('/users', '/users')).toBe(true);
      });
    });

    describe('extractPathSegments', () => {
      it('extracts segments', () => {
        expect(extractPathSegments('/a/b/c')).toEqual(['a', 'b', 'c']);
        expect(extractPathSegments('/')).toEqual([]);
      });
    });

    describe('getParentPath', () => {
      it('gets parent path', () => {
        expect(getParentPath('/a/b/c')).toBe('/a/b');
        expect(getParentPath('/a')).toBe('/');
      });
    });

    describe('isChildPath', () => {
      it('identifies child paths', () => {
        expect(isChildPath('/a/b', '/a')).toBe(true);
        expect(isChildPath('/a', '/a')).toBe(false);
        expect(isChildPath('/ab', '/a')).toBe(false);
      });
    });

    describe('getRelativePath', () => {
      it('calculates relative path', () => {
        expect(getRelativePath('/a/b', '/a/c')).toBe('../c');
        expect(getRelativePath('/a/b/c', '/a/d/e')).toBe('../../d/e');
      });
    });

    describe('createMatcher', () => {
      it('creates a route matcher', () => {
        const matcher = createMatcher({
          home: '/',
          user: '/users/:id',
          post: '/posts/:postId',
        });

        const homeMatch = matcher.match('/');
        expect(homeMatch?.name).toBe('home');

        const userMatch = matcher.match('/users/123');
        expect(userMatch?.name).toBe('user');
        expect(userMatch?.params).toEqual({ id: '123' });
      });

      it('generates paths', () => {
        const matcher = createMatcher({
          home: '/',
          user: '/users/:id',
        });

        expect(matcher.generate('user', { id: '456' })).toBe('/users/456');
      });

      it('throws for unknown route name', () => {
        const matcher = createMatcher({ home: '/' });
        expect(() => matcher.generate('unknown' as 'home')).toThrow();
      });
    });
  });
});
