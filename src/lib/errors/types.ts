'use client';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'CLIENT_ERROR'
  | 'UNKNOWN_ERROR';

export type RetryConfig = {
  maxAttempts?: number | undefined;
  initialDelay?: number | undefined;
  maxDelay?: number | undefined;
  backoffFactor?: number | undefined;
  retryCondition?: ((error: Error, attempt: number) => boolean) | undefined;
  onRetry?: ((error: Error, attempt: number) => void) | undefined;
};

export type RetryState = {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
  nextRetryIn: number | null;
};

export type UseRetryOptions<T> = RetryConfig & {
  onSuccess?: ((data: T) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
  onGiveUp?: ((error: Error, attempts: number) => void) | undefined;
};

export type UseRetryReturn<T> = {
  execute: () => Promise<T | undefined>;
  reset: () => void;
  cancel: () => void;
  state: RetryState;
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
};

export type AsyncBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode | undefined;
  errorFallback?:
    | React.ReactNode
    | ((props: { error: Error; reset: () => void }) => React.ReactNode)
    | undefined;
  onError?: ((error: Error) => void) | undefined;
  suspenseKey?: string | undefined;
};

export type NetworkStatus = {
  isOnline: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | undefined;
  downlink?: number | undefined;
  rtt?: number | undefined;
  saveData?: boolean | undefined;
};

export type SafeComponentProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode | undefined;
  silent?: boolean | undefined;
  onError?: ((error: Error) => void) | undefined;
};
