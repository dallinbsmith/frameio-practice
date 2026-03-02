'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isActiveRoute, matchRoute } from './route-matching';

import type {
  CampaignParams,
  InferParamsFromConfig,
  NavigateOptions,
  ParamConfig,
  ParamsConfig,
  ScrollPosition,
  Serializer,
  TrackingConfig,
  UseSearchParamsOptions,
} from './types';

const defaultSerializers: Record<string, Serializer<unknown>> = {
  string: {
    serialize: (value) => String(value),
    deserialize: (value) => value,
  },
  number: {
    serialize: (value) => String(value),
    deserialize: (value) => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    },
  },
  boolean: {
    serialize: (value) => (value ? 'true' : 'false'),
    deserialize: (value) => value === 'true',
  },
  array: {
    serialize: (value) => (Array.isArray(value) ? value.join(',') : ''),
    deserialize: (value) => (value ? value.split(',') : []),
  },
  json: {
    serialize: (value) => JSON.stringify(value),
    deserialize: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },
  },
};

const getSerializerForType = (value: unknown): Serializer<unknown> => {
  if (typeof value === 'number') return defaultSerializers['number']!;
  if (typeof value === 'boolean') return defaultSerializers['boolean']!;
  if (Array.isArray(value)) return defaultSerializers['array']!;
  if (typeof value === 'object' && value !== null)
    return defaultSerializers['json']!;
  return defaultSerializers['string']!;
};

export const useSearchParamsState = <C extends ParamsConfig>(
  config: C,
  options: UseSearchParamsOptions = {}
): {
  params: InferParamsFromConfig<C>;
  setParams: (updates: Partial<InferParamsFromConfig<C>>) => void;
  setParam: <K extends keyof C>(
    key: K,
    value: C[K] extends ParamConfig<infer T> ? T : never
  ) => void;
  removeParam: <K extends keyof C>(key: K) => void;
  removeParams: (keys: Array<keyof C>) => void;
  resetParams: () => void;
  getQueryString: () => string;
} => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { scroll = false, replace = true } = options;

  const getParams = useCallback((): InferParamsFromConfig<C> => {
    const result: Record<string, unknown> = {};

    for (const [key, paramConfig] of Object.entries(config)) {
      const urlValue = searchParams.get(key);

      if (urlValue === null) {
        result[key] = paramConfig.defaultValue;
      } else {
        const serializer =
          paramConfig.serializer ??
          getSerializerForType(paramConfig.defaultValue);
        result[key] = serializer.deserialize(urlValue);
      }
    }

    return result as InferParamsFromConfig<C>;
  }, [config, searchParams]);

  const params = useMemo(() => getParams(), [getParams]);

  const updateUrl = useCallback(
    (newParams: Record<string, unknown>) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(newParams)) {
        const paramConfig = config[key];
        if (!paramConfig) continue;

        if (
          value === undefined ||
          value === null ||
          JSON.stringify(value) === JSON.stringify(paramConfig.defaultValue)
        ) {
          currentParams.delete(key);
        } else {
          const serializer =
            paramConfig.serializer ??
            getSerializerForType(paramConfig.defaultValue);
          currentParams.set(key, serializer.serialize(value));
        }
      }

      const queryString = currentParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      if (replace) {
        router.replace(newUrl, { scroll });
      } else {
        router.push(newUrl, { scroll });
      }
    },
    [config, pathname, replace, router, scroll, searchParams]
  );

  const setParams = useCallback(
    (updates: Partial<InferParamsFromConfig<C>>) => {
      updateUrl({ ...params, ...updates });
    },
    [params, updateUrl]
  );

  const setParam = useCallback(
    <K extends keyof C>(
      key: K,
      value: C[K] extends ParamConfig<infer T> ? T : never
    ) => {
      updateUrl({ ...params, [key]: value });
    },
    [params, updateUrl]
  );

  const removeParam = useCallback(
    <K extends keyof C>(key: K) => {
      const newParams = { ...params };
      delete newParams[key as keyof typeof newParams];
      newParams[key as keyof typeof newParams] = config[key]
        ?.defaultValue as (typeof newParams)[keyof typeof newParams];
      updateUrl(newParams);
    },
    [config, params, updateUrl]
  );

  const removeParams = useCallback(
    (keys: Array<keyof C>) => {
      const newParams = { ...params };
      for (const key of keys) {
        newParams[key as keyof typeof newParams] = config[key]
          ?.defaultValue as (typeof newParams)[keyof typeof newParams];
      }
      updateUrl(newParams);
    },
    [config, params, updateUrl]
  );

  const resetParams = useCallback(() => {
    router.replace(pathname, { scroll });
  }, [pathname, router, scroll]);

  const getQueryString = useCallback(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    return currentParams.toString();
  }, [searchParams]);

  return {
    params,
    setParams,
    setParam,
    removeParam,
    removeParams,
    resetParams,
    getQueryString,
  };
};

export const useQueryParam = <T,>(
  key: string,
  defaultValue: T,
  serializer?: Serializer<T> | undefined
): [T, (value: T | undefined) => void] => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const effectiveSerializer = useMemo(
    () => serializer ?? (getSerializerForType(defaultValue) as Serializer<T>),
    [defaultValue, serializer]
  );

  const value = useMemo(() => {
    const urlValue = searchParams.get(key);
    if (urlValue === null) {
      return defaultValue;
    }
    return effectiveSerializer.deserialize(urlValue);
  }, [defaultValue, effectiveSerializer, key, searchParams]);

  const setValue = useCallback(
    (newValue: T | undefined) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      if (
        newValue === undefined ||
        newValue === null ||
        JSON.stringify(newValue) === JSON.stringify(defaultValue)
      ) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, effectiveSerializer.serialize(newValue));
      }

      const queryString = currentParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [defaultValue, effectiveSerializer, key, pathname, router, searchParams]
  );

  return [value, setValue];
};

export const useHash = (): [string, (hash: string) => void] => {
  const [hash, setHashState] = useState('');

  useEffect(() => {
    const updateHash = () => {
      setHashState(window.location.hash.slice(1));
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);

    return () => {
      window.removeEventListener('hashchange', updateHash);
    };
  }, []);

  const setHash = useCallback((newHash: string) => {
    const hashValue = newHash.startsWith('#') ? newHash : `#${newHash}`;
    window.location.hash = hashValue;
    setHashState(newHash.startsWith('#') ? newHash.slice(1) : newHash);
  }, []);

  return [hash, setHash];
};

export const useRouteMatch = <
  P extends Record<string, string> = Record<string, string>,
>(
  pattern: string
): { matched: boolean; params: P } | null => {
  const pathname = usePathname();

  return useMemo(() => {
    const result = matchRoute<P>(pathname, pattern);
    return result ? { matched: true, params: result.params } : null;
  }, [pathname, pattern]);
};

export const useIsActiveRoute = (
  targetPath: string,
  exact = false
): boolean => {
  const pathname = usePathname();
  return useMemo(
    () => isActiveRoute(pathname, targetPath, exact),
    [pathname, targetPath, exact]
  );
};

export const useNavigate = (): {
  push: (url: string, options?: NavigateOptions) => void;
  replace: (url: string, options?: NavigateOptions) => void;
  back: () => void;
  forward: () => void;
} => {
  const router = useRouter();

  const push = useCallback(
    (url: string, options: NavigateOptions = {}) => {
      router.push(url, { scroll: options.scroll ?? true });
    },
    [router]
  );

  const replace = useCallback(
    (url: string, options: NavigateOptions = {}) => {
      router.replace(url, { scroll: options.scroll ?? true });
    },
    [router]
  );

  const back = useCallback(() => {
    router.back();
  }, [router]);

  const forward = useCallback(() => {
    router.forward();
  }, [router]);

  return { push, replace, back, forward };
};

export const useCampaignParams = (
  config: TrackingConfig = {}
): CampaignParams => {
  const searchParams = useSearchParams();
  const {
    persistKey = 'utm_params',
    persistDuration = 30 * 24 * 60 * 60 * 1000,
    params = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
    ],
  } = config;

  const campaignParams = useMemo((): CampaignParams => {
    const result: CampaignParams = {};

    for (const param of params) {
      const value = searchParams.get(param);
      if (value) {
        result[param as keyof CampaignParams] = value;
      }
    }

    return result;
  }, [params, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasParams = Object.keys(campaignParams).length > 0;

    if (hasParams) {
      const data = {
        params: campaignParams,
        timestamp: Date.now(),
        expiry: Date.now() + persistDuration,
      };
      localStorage.setItem(persistKey, JSON.stringify(data));
    }
  }, [campaignParams, persistDuration, persistKey]);

  return useMemo(() => {
    if (typeof window === 'undefined') return campaignParams;

    if (Object.keys(campaignParams).length > 0) {
      return campaignParams;
    }

    try {
      const stored = localStorage.getItem(persistKey);
      if (stored) {
        const data = JSON.parse(stored) as {
          params: CampaignParams;
          expiry: number;
        };
        if (data.expiry > Date.now()) {
          return data.params;
        }
        localStorage.removeItem(persistKey);
      }
    } catch {
      // Ignore storage errors
    }

    return {};
  }, [campaignParams, persistKey]);
};

export const useScrollRestoration = (
  mode: 'auto' | 'manual' = 'auto'
): {
  savePosition: () => void;
  restorePosition: () => void;
  scrollTo: (position: ScrollPosition) => void;
} => {
  const pathname = usePathname();
  const positionsRef = useRef<Map<string, ScrollPosition>>(new Map());

  useEffect(() => {
    if (mode !== 'auto') return;

    const saveCurrentPosition = () => {
      positionsRef.current.set(pathname, {
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('beforeunload', saveCurrentPosition);

    return () => {
      saveCurrentPosition();
      window.removeEventListener('beforeunload', saveCurrentPosition);
    };
  }, [mode, pathname]);

  useEffect(() => {
    if (mode !== 'auto') return;

    const savedPosition = positionsRef.current.get(pathname);
    if (savedPosition) {
      window.scrollTo(savedPosition.x, savedPosition.y);
    }
  }, [mode, pathname]);

  const savePosition = useCallback(() => {
    positionsRef.current.set(pathname, {
      x: window.scrollX,
      y: window.scrollY,
    });
  }, [pathname]);

  const restorePosition = useCallback(() => {
    const savedPosition = positionsRef.current.get(pathname);
    if (savedPosition) {
      window.scrollTo(savedPosition.x, savedPosition.y);
    }
  }, [pathname]);

  const scrollTo = useCallback((position: ScrollPosition) => {
    window.scrollTo(position.x, position.y);
  }, []);

  return { savePosition, restorePosition, scrollTo };
};

export const useUrlState = <T extends Record<string, unknown>>(
  initialState: T
): [T, (updates: Partial<T>) => void] => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo((): T => {
    const result: Record<string, unknown> = { ...initialState };

    for (const [key, defaultValue] of Object.entries(initialState)) {
      const urlValue = searchParams.get(key);

      if (urlValue !== null) {
        const serializer = getSerializerForType(defaultValue);
        result[key] = serializer.deserialize(urlValue);
      }
    }

    return result as T;
  }, [initialState, searchParams]);

  const setState = useCallback(
    (updates: Partial<T>) => {
      const newState = { ...state, ...updates };
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(newState)) {
        const defaultValue = initialState[key];

        if (
          value !== undefined &&
          value !== null &&
          JSON.stringify(value) !== JSON.stringify(defaultValue)
        ) {
          const serializer = getSerializerForType(defaultValue);
          params.set(key, serializer.serialize(value));
        }
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [initialState, pathname, router, state]
  );

  return [state, setState];
};

export const usePreserveQueryParams = (
  keys: string[]
): Record<string, string | null> => {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const result: Record<string, string | null> = {};
    for (const key of keys) {
      result[key] = searchParams.get(key);
    }
    return result;
  }, [keys, searchParams]);
};

export const useHistoryLength = (): number => {
  const [length, setLength] = useState(
    typeof window !== 'undefined' ? window.history.length : 0
  );

  useEffect(() => {
    setLength(window.history.length);
  }, []);

  return length;
};

export const useCanGoBack = (): boolean => {
  const length = useHistoryLength();
  return length > 1;
};
