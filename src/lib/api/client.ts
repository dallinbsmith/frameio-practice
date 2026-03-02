import type {
  ApiClientConfig,
  ApiError,
  ApiResponse,
  RequestConfig,
  RetryConfig,
} from './types';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOn: [408, 429, 500, 502, 503, 504],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateBackoff = (
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = delay * 0.1 * Math.random();
  return delay + jitter;
};

const buildUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const parseError = async (response: Response): Promise<ApiError> => {
  try {
    const data = await response.json();
    return {
      code: data.code || 'UNKNOWN_ERROR',
      message: data.message || response.statusText,
      status: response.status,
      details: data.details,
    };
  } catch {
    return {
      code: 'PARSE_ERROR',
      message: response.statusText || 'An error occurred',
      status: response.status,
    };
  }
};

export class ApiClient {
  private config: ApiClientConfig;
  private retryConfig: RetryConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retry };
  }

  private async executeRequest<T>(
    path: string,
    config: RequestConfig = {},
    attempt = 0
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      signal,
      cache,
      revalidate,
      tags,
    } = config;

    const url = buildUrl(this.config.baseUrl, path, params);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
      ...headers,
    };

    const controller = new AbortController();
    const timeoutId = this.config.timeout
      ? setTimeout(() => controller.abort(), this.config.timeout)
      : null;

    const fetchOptions: RequestInit & {
      next?: { revalidate?: number; tags?: string[] };
    } = {
      method,
      headers: requestHeaders,
      signal: signal ?? controller.signal,
    };

    if (cache) {
      fetchOptions.cache = cache;
    }

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    if (revalidate !== undefined || tags) {
      const nextConfig: { revalidate?: number; tags?: string[] } = {};
      if (revalidate !== undefined) nextConfig.revalidate = revalidate;
      if (tags) nextConfig.tags = tags;
      fetchOptions.next = nextConfig;
    }

    this.config.onRequest?.(url, config);

    try {
      const response = await fetch(url, fetchOptions);

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await parseError(response);

        if (
          attempt < this.retryConfig.maxRetries &&
          this.retryConfig.retryOn.includes(response.status)
        ) {
          const delay = calculateBackoff(
            attempt,
            this.retryConfig.baseDelay,
            this.retryConfig.maxDelay
          );
          await sleep(delay);
          return this.executeRequest<T>(path, config, attempt + 1);
        }

        this.config.onError?.(error);
        throw error;
      }

      const data = await response.json();
      const result: ApiResponse<T> = { data };

      const totalCount = response.headers.get('X-Total-Count');
      if (totalCount) {
        result.meta = {
          total: parseInt(totalCount, 10),
        };
      }

      this.config.onResponse?.(result);
      return result;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        const abortError: ApiError = {
          code: 'REQUEST_ABORTED',
          message: 'Request was aborted',
          status: 0,
        };
        this.config.onError?.(abortError);
        throw abortError;
      }

      if ((error as ApiError).code) {
        throw error;
      }

      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: (error as Error).message || 'Network error occurred',
        status: 0,
      };

      if (attempt < this.retryConfig.maxRetries) {
        const delay = calculateBackoff(
          attempt,
          this.retryConfig.baseDelay,
          this.retryConfig.maxDelay
        );
        await sleep(delay);
        return this.executeRequest<T>(path, config, attempt + 1);
      }

      this.config.onError?.(networkError);
      throw networkError;
    }
  }

  async get<T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.executeRequest<T>(path, { ...config, method: 'GET' });
  }

  async post<T>(
    path: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method'>
  ) {
    return this.executeRequest<T>(path, { ...config, method: 'POST', body });
  }

  async put<T>(
    path: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method'>
  ) {
    return this.executeRequest<T>(path, { ...config, method: 'PUT', body });
  }

  async patch<T>(
    path: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method'>
  ) {
    return this.executeRequest<T>(path, { ...config, method: 'PATCH', body });
  }

  async delete<T>(
    path: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ) {
    return this.executeRequest<T>(path, { ...config, method: 'DELETE' });
  }
}

export const createApiClient = (config: ApiClientConfig) =>
  new ApiClient(config);
