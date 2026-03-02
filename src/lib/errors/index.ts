'use client';

export {
  AppError,
  NetworkError,
  TimeoutError,
  ValidationError,
  AuthError,
  NotFoundError,
  RateLimitError,
  isAppError,
  isNetworkError,
  isTimeoutError,
  isValidationError,
  isAuthError,
  isRetryableError,
  normalizeError,
} from './errors';

export { useRetry, retryAsync } from './useRetry';

export {
  useNetworkStatus,
  useIsOnline,
  useIsSlowConnection,
  useOnlineCallback,
} from './useNetworkStatus';

export { AsyncBoundary } from './AsyncBoundary';

export {
  OfflineFallback,
  OnlineOnly,
  SafeComponent,
  EmptyState,
} from './Fallbacks';

export {
  getErrorMessage,
  getErrorTitle,
  getErrorDescription,
  getErrorAction,
  getHttpErrorMessage,
  formatErrorForUser,
  formatValidationErrors,
  createUserFriendlyError,
} from './messages';

export {
  useAsyncError,
  useThrowError,
  useAsyncState,
  useAsyncCallback,
} from './useAsyncError';

export type {
  ErrorSeverity,
  ErrorCode,
  RetryConfig,
  RetryState,
  UseRetryOptions,
  UseRetryReturn,
  AsyncBoundaryProps,
  NetworkStatus,
  SafeComponentProps,
} from './types';
