import type { CookieAttributes, CookieOptions } from './types';

export const parseCookies = (cookieString?: string): Record<string, string> => {
  const str =
    cookieString ?? (typeof document !== 'undefined' ? document.cookie : '');

  if (!str) return {};

  const cookies: Record<string, string> = {};

  str.split(';').forEach((cookie) => {
    const [rawName, ...rawValue] = cookie.split('=');
    if (rawName) {
      const name = rawName.trim();
      const value = rawValue.join('=').trim();
      if (name) {
        cookies[name] = decodeURIComponent(value);
      }
    }
  });

  return cookies;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const cookies = parseCookies();
  return cookies[name] ?? null;
};

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  if (typeof document === 'undefined') return;

  const {
    path = '/',
    domain,
    expires,
    maxAge,
    secure,
    sameSite = 'lax',
    httpOnly,
    partitioned,
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (expires) {
    const expiryDate =
      expires instanceof Date ? expires : new Date(Date.now() + expires);
    cookieString += `; expires=${expiryDate.toUTCString()}`;
  }

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  if (httpOnly) {
    cookieString += '; httponly';
  }

  if (partitioned) {
    cookieString += '; partitioned';
  }

  document.cookie = cookieString;
};

export const removeCookie = (
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): void => {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  });
};

export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

export const getAllCookies = (): Record<string, string> => {
  return parseCookies();
};

export const clearAllCookies = (
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): void => {
  const cookies = getAllCookies();
  for (const name of Object.keys(cookies)) {
    removeCookie(name, options);
  }
};

export const getCookieAttributes = (name: string): CookieAttributes | null => {
  const value = getCookie(name);
  if (value === null) return null;

  return {
    name,
    value,
  };
};

export const setCookieJson = <T>(
  name: string,
  value: T,
  options: CookieOptions = {}
): void => {
  setCookie(name, JSON.stringify(value), options);
};

export const getCookieJson = <T>(name: string): T | null => {
  const value = getCookie(name);
  if (value === null) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const getCookieSize = (): number => {
  if (typeof document === 'undefined') return 0;
  return document.cookie.length;
};

export const getCookieCount = (): number => {
  return Object.keys(getAllCookies()).length;
};

export const isCookieEnabled = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.cookieEnabled;
};

export const createCookieStorage = (
  prefix = '',
  defaultOptions: CookieOptions = {}
) => {
  const getKey = (key: string) => (prefix ? `${prefix}_${key}` : key);

  return {
    get: (key: string): string | null => getCookie(getKey(key)),

    set: (key: string, value: string, options?: CookieOptions): void => {
      setCookie(getKey(key), value, { ...defaultOptions, ...options });
    },

    remove: (key: string): void => {
      removeCookie(getKey(key), defaultOptions);
    },

    has: (key: string): boolean => hasCookie(getKey(key)),

    getJson: <T>(key: string): T | null => getCookieJson<T>(getKey(key)),

    setJson: <T>(key: string, value: T, options?: CookieOptions): void => {
      setCookieJson(getKey(key), value, { ...defaultOptions, ...options });
    },

    clear: (): void => {
      const cookies = getAllCookies();
      const prefixWithSeparator = prefix ? `${prefix}_` : '';
      for (const name of Object.keys(cookies)) {
        if (!prefix || name.startsWith(prefixWithSeparator)) {
          removeCookie(name, defaultOptions);
        }
      }
    },

    keys: (): string[] => {
      const cookies = getAllCookies();
      const prefixWithSeparator = prefix ? `${prefix}_` : '';
      return Object.keys(cookies)
        .filter((name) => !prefix || name.startsWith(prefixWithSeparator))
        .map((name) =>
          prefix ? name.slice(prefixWithSeparator.length) : name
        );
    },
  };
};

export const serializeCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): string => {
  const {
    path = '/',
    domain,
    expires,
    maxAge,
    secure,
    sameSite = 'lax',
    httpOnly,
    partitioned,
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (path) cookieString += `; Path=${path}`;
  if (domain) cookieString += `; Domain=${domain}`;

  if (expires) {
    const expiryDate =
      expires instanceof Date ? expires : new Date(Date.now() + expires);
    cookieString += `; Expires=${expiryDate.toUTCString()}`;
  }

  if (maxAge !== undefined) cookieString += `; Max-Age=${maxAge}`;
  if (secure) cookieString += '; Secure';
  if (sameSite) cookieString += `; SameSite=${sameSite}`;
  if (httpOnly) cookieString += '; HttpOnly';
  if (partitioned) cookieString += '; Partitioned';

  return cookieString;
};

export const parseSetCookieHeader = (
  header: string
): CookieAttributes | null => {
  const parts = header.split(';').map((part) => part.trim());
  const [nameValue, ...attributes] = parts;

  if (!nameValue) return null;

  const [name, ...valueParts] = nameValue.split('=');
  if (!name) return null;

  const result: CookieAttributes = {
    name: decodeURIComponent(name.trim()),
    value: decodeURIComponent(valueParts.join('=').trim()),
  };

  for (const attr of attributes) {
    const [attrName, attrValue] = attr.split('=');
    const normalizedName = attrName?.toLowerCase().trim();

    switch (normalizedName) {
      case 'path':
        result.path = attrValue?.trim();
        break;
      case 'domain':
        result.domain = attrValue?.trim();
        break;
      case 'expires':
        result.expires = attrValue ? new Date(attrValue.trim()) : undefined;
        break;
      case 'secure':
        result.secure = true;
        break;
      case 'samesite':
        result.sameSite = attrValue?.toLowerCase().trim() as
          | 'strict'
          | 'lax'
          | 'none';
        break;
    }
  }

  return result;
};
