'use client';

import { parseQueryString } from './query-string';
import { getHash, getPathname, getSearch } from './url-utils';

import type { RouteMatch, RoutePattern } from './types';

export const createRoutePattern = (pattern: string): RoutePattern => {
  const paramNames: string[] = [];

  const regexPattern = pattern
    .replace(/\//g, '\\/')
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\*/g, (_, name) => {
      paramNames.push(name);
      return '(.+)';
    })
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\?/g, (_, name) => {
      paramNames.push(name);
      return '([^\\/]*)';
    })
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name);
      return '([^\\/]+)';
    })
    .replace(/\\\*\\\*/g, '.*')
    .replace(/\\\*/g, '[^\\/]*');

  return {
    pattern,
    regex: new RegExp(`^${regexPattern}$`),
    paramNames,
  };
};

export const matchRoute = <
  P extends Record<string, string> = Record<string, string>,
>(
  path: string,
  pattern: string | RoutePattern
): RouteMatch<P> | null => {
  const routePattern =
    typeof pattern === 'string' ? createRoutePattern(pattern) : pattern;

  const pathname = getPathname(path);
  const search = getSearch(path);
  const hash = getHash(path);

  const match = pathname.match(routePattern.regex);

  if (!match) {
    return null;
  }

  const params: Record<string, string> = {};

  routePattern.paramNames.forEach((name, index) => {
    const value = match[index + 1];
    if (value !== undefined) {
      params[name] = decodeURIComponent(value);
    }
  });

  const query = parseQueryString(search);
  const queryRecord: Record<string, string> = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      queryRecord[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      queryRecord[key] = value[0] ?? '';
    }
  }

  return {
    matched: true,
    params: params as P,
    path: pathname,
    query: queryRecord,
    hash: hash.slice(1),
  };
};

export const matchRoutes = <
  P extends Record<string, string> = Record<string, string>,
>(
  path: string,
  patterns: Array<string | RoutePattern>
): RouteMatch<P> | null => {
  for (const pattern of patterns) {
    const match = matchRoute<P>(path, pattern);
    if (match) {
      return match;
    }
  }
  return null;
};

export const generatePath = (
  pattern: string,
  params: Record<string, string | number> = {}
): string => {
  let path = pattern;

  for (const [key, value] of Object.entries(params)) {
    path = path
      .replace(`:${key}*`, encodeURIComponent(String(value)))
      .replace(`:${key}?`, encodeURIComponent(String(value)))
      .replace(`:${key}`, encodeURIComponent(String(value)));
  }

  path = path.replace(/:[a-zA-Z_][a-zA-Z0-9_]*\?/g, '').replace(/\/+/g, '/');

  return path;
};

export const rankRoute = (pattern: string): number => {
  let score = 0;
  const segments = pattern.split('/').filter(Boolean);

  for (const segment of segments) {
    if (segment.startsWith(':')) {
      if (segment.endsWith('*')) {
        score += 1;
      } else if (segment.endsWith('?')) {
        score += 2;
      } else {
        score += 3;
      }
    } else if (segment === '**') {
      score += 0;
    } else if (segment === '*') {
      score += 1;
    } else {
      score += 4;
    }
  }

  return score;
};

export const sortRoutesBySpecificity = (
  patterns: Array<string | RoutePattern>
): Array<string | RoutePattern> => {
  return [...patterns].sort((a, b) => {
    const patternA = typeof a === 'string' ? a : a.pattern;
    const patternB = typeof b === 'string' ? b : b.pattern;
    return rankRoute(patternB) - rankRoute(patternA);
  });
};

export const isActiveRoute = (
  currentPath: string,
  targetPath: string,
  exact = false
): boolean => {
  const current = getPathname(currentPath).replace(/\/$/, '') || '/';
  const target = getPathname(targetPath).replace(/\/$/, '') || '/';

  if (exact) {
    return current === target;
  }

  return current === target || current.startsWith(target + '/');
};

export const getActiveRouteParams = (
  currentPath: string,
  pattern: string
): Record<string, string> | null => {
  const match = matchRoute(currentPath, pattern);
  return match ? match.params : null;
};

export const extractPathSegments = (path: string): string[] => {
  return getPathname(path).split('/').filter(Boolean);
};

export const getParentPath = (path: string): string => {
  const segments = extractPathSegments(path);
  segments.pop();
  return '/' + segments.join('/');
};

export const isChildPath = (childPath: string, parentPath: string): boolean => {
  const child = getPathname(childPath).replace(/\/$/, '');
  const parent = getPathname(parentPath).replace(/\/$/, '');

  if (parent === '/') {
    return child !== '/';
  }

  return child.startsWith(parent + '/');
};

export const getRelativePath = (from: string, to: string): string => {
  const fromSegments = extractPathSegments(from);
  const toSegments = extractPathSegments(to);

  let commonLength = 0;
  const maxLength = Math.min(fromSegments.length, toSegments.length);

  while (
    commonLength < maxLength &&
    fromSegments[commonLength] === toSegments[commonLength]
  ) {
    commonLength++;
  }

  const upCount = fromSegments.length - commonLength;
  const ups = Array(upCount).fill('..');
  const remaining = toSegments.slice(commonLength);

  return [...ups, ...remaining].join('/') || '.';
};

export const createMatcher = <Routes extends Record<string, string>>(
  routes: Routes
): {
  match: (
    path: string
  ) => { name: keyof Routes; params: Record<string, string> } | null;
  generate: (
    name: keyof Routes,
    params?: Record<string, string | number>
  ) => string;
} => {
  const patterns = Object.entries(routes).map(([name, pattern]) => ({
    name,
    routePattern: createRoutePattern(pattern),
  }));

  const sortedPatterns = patterns.sort(
    (a, b) =>
      rankRoute(b.routePattern.pattern) - rankRoute(a.routePattern.pattern)
  );

  return {
    match: (path: string) => {
      for (const { name, routePattern } of sortedPatterns) {
        const result = matchRoute(path, routePattern);
        if (result) {
          return { name: name as keyof Routes, params: result.params };
        }
      }
      return null;
    },
    generate: (
      name: keyof Routes,
      params?: Record<string, string | number>
    ) => {
      const pattern = routes[name];
      if (!pattern) {
        throw new Error(`Unknown route: ${String(name)}`);
      }
      return generatePath(pattern, params ?? {});
    },
  };
};
