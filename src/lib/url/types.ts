'use client';

export type Serializer<T> = {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
};

export type ParamConfig<T> = {
  defaultValue: T;
  serializer?: Serializer<T> | undefined;
};

export type ParamsConfig = Record<string, ParamConfig<unknown>>;

export type InferParamsFromConfig<C extends ParamsConfig> = {
  [K in keyof C]: C[K] extends ParamConfig<infer T> ? T : never;
};

export type SearchParamsState<T> = {
  params: T;
  setParams: (updates: Partial<T>) => void;
  setParam: <K extends keyof T>(key: K, value: T[K]) => void;
  removeParam: <K extends keyof T>(key: K) => void;
  removeParams: (keys: Array<keyof T>) => void;
  resetParams: () => void;
  getQueryString: () => string;
};

export type UseSearchParamsOptions = {
  shallow?: boolean | undefined;
  scroll?: boolean | undefined;
  replace?: boolean | undefined;
};

export type RoutePattern = {
  pattern: string;
  regex: RegExp;
  paramNames: string[];
};

export type RouteMatch<P = Record<string, string>> = {
  matched: boolean;
  params: P;
  path: string;
  query: Record<string, string>;
  hash: string;
};

export type RouteGuard = (
  to: RouteMatch,
  from: RouteMatch | null
) => boolean | string | Promise<boolean | string>;

export type RouteConfig = {
  path: string;
  guards?: RouteGuard[] | undefined;
  meta?: Record<string, unknown> | undefined;
};

export type RouterState = {
  current: RouteMatch;
  previous: RouteMatch | null;
  isNavigating: boolean;
};

export type NavigateOptions = {
  replace?: boolean | undefined;
  scroll?: boolean | undefined;
  state?: unknown | undefined;
};

export type BreadcrumbItem = {
  label: string;
  href: string;
  current?: boolean | undefined;
};

export type BreadcrumbConfig = {
  path: string;
  label: string | ((params: Record<string, string>) => string);
};

export type QueryStringOptions = {
  arrayFormat?: 'bracket' | 'index' | 'comma' | 'separator' | undefined;
  arraySeparator?: string | undefined;
  skipNull?: boolean | undefined;
  skipEmptyString?: boolean | undefined;
  encode?: boolean | undefined;
};

export type ParsedQuery = Record<string, string | string[] | undefined>;

export type UrlParts = {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
};

export type CampaignParams = {
  utm_source?: string | undefined;
  utm_medium?: string | undefined;
  utm_campaign?: string | undefined;
  utm_term?: string | undefined;
  utm_content?: string | undefined;
  ref?: string | undefined;
};

export type TrackingConfig = {
  persistKey?: string | undefined;
  persistDuration?: number | undefined;
  params?: string[] | undefined;
};

export type ScrollRestorationMode = 'auto' | 'manual';

export type ScrollPosition = {
  x: number;
  y: number;
};

export type HistoryEntry = {
  key: string;
  url: string;
  state: unknown;
  scroll?: ScrollPosition | undefined;
  timestamp: number;
};
