'use client';

import type { ErrorCode, ErrorSeverity } from './types';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly severity: ErrorSeverity;
  readonly timestamp: number;
  readonly metadata: Record<string, unknown>;
  readonly isOperational: boolean;

  constructor(
    message: string,
    options: {
      code?: ErrorCode | undefined;
      severity?: ErrorSeverity | undefined;
      cause?: Error | undefined;
      metadata?: Record<string, unknown> | undefined;
      isOperational?: boolean | undefined;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options.code ?? 'UNKNOWN_ERROR';
    this.severity = options.severity ?? 'medium';
    this.timestamp = Date.now();
    this.metadata = options.metadata ?? {};
    this.isOperational = options.isOperational ?? true;

    if (options.cause) {
      this.cause = options.cause;
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

export class NetworkError extends AppError {
  readonly statusCode?: number | undefined;
  readonly url?: string | undefined;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      url?: string;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'NETWORK_ERROR',
      severity: 'high',
      cause: options.cause,
      metadata: {
        ...options.metadata,
        statusCode: options.statusCode,
        url: options.url,
      },
    });
    this.name = 'NetworkError';
    this.statusCode = options.statusCode;
    this.url = options.url;

    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends AppError {
  readonly timeout: number;

  constructor(
    message: string,
    options: {
      timeout: number;
      cause?: Error;
      metadata?: Record<string, unknown>;
    }
  ) {
    super(message, {
      code: 'TIMEOUT_ERROR',
      severity: 'medium',
      cause: options.cause,
      metadata: { ...options.metadata, timeout: options.timeout },
    });
    this.name = 'TimeoutError';
    this.timeout = options.timeout;

    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ValidationError extends AppError {
  readonly field?: string | undefined;
  readonly value?: unknown;

  constructor(
    message: string,
    options: {
      field?: string;
      value?: unknown;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      severity: 'low',
      cause: options.cause,
      metadata: {
        ...options.metadata,
        field: options.field,
        value: options.value,
      },
    });
    this.name = 'ValidationError';
    this.field = options.field;
    this.value = options.value;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthError extends AppError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'AUTH_ERROR',
      severity: 'high',
      cause: options.cause,
      metadata: options.metadata,
    });
    this.name = 'AuthError';

    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class NotFoundError extends AppError {
  readonly resource?: string | undefined;

  constructor(
    message: string,
    options: {
      resource?: string;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'NOT_FOUND',
      severity: 'low',
      cause: options.cause,
      metadata: { ...options.metadata, resource: options.resource },
    });
    this.name = 'NotFoundError';
    this.resource = options.resource;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends AppError {
  readonly retryAfter?: number | undefined;

  constructor(
    message: string,
    options: {
      retryAfter?: number;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'RATE_LIMIT',
      severity: 'medium',
      cause: options.cause,
      metadata: { ...options.metadata, retryAfter: options.retryAfter },
    });
    this.name = 'RateLimitError';
    this.retryAfter = options.retryAfter;

    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isTimeoutError = (error: unknown): error is TimeoutError => {
  return error instanceof TimeoutError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

export const isRetryableError = (error: unknown): boolean => {
  if (isNetworkError(error)) {
    const status = error.statusCode;
    if (
      status &&
      status >= 400 &&
      status < 500 &&
      status !== 408 &&
      status !== 429
    ) {
      return false;
    }
    return true;
  }

  if (isTimeoutError(error)) {
    return true;
  }

  if (error instanceof RateLimitError) {
    return true;
  }

  return false;
};

export const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null) {
    const message =
      'message' in error && typeof error.message === 'string'
        ? error.message
        : JSON.stringify(error);
    return new Error(message);
  }

  return new Error('An unknown error occurred');
};
