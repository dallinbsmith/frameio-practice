export type ApiError = {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
};

export type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
};

export type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryOn: number[];
};

export type ApiClientConfig = {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  onError?: (error: ApiError) => void;
  onRequest?: (url: string, config: RequestConfig) => void;
  onResponse?: <T>(response: ApiResponse<T>) => void;
};
