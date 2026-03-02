'use client';

import { AppError } from './errors';

import type { ErrorCode } from './types';

type ErrorMessages = {
  title: string;
  description: string;
  action?: string;
};

const ERROR_MESSAGES: Record<ErrorCode, ErrorMessages> = {
  NETWORK_ERROR: {
    title: 'Connection Error',
    description:
      'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'Retry',
  },
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    description:
      'The request took too long to complete. Please try again in a moment.',
    action: 'Retry',
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    description: 'Please check your input and try again.',
    action: 'Fix & Retry',
  },
  AUTH_ERROR: {
    title: 'Authentication Required',
    description: 'Please sign in to continue.',
    action: 'Sign In',
  },
  NOT_FOUND: {
    title: 'Not Found',
    description: "The requested resource couldn't be found.",
    action: 'Go Back',
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    description:
      "You've made too many requests. Please wait a moment before trying again.",
    action: 'Wait',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    description: "Something went wrong on our end. We're working on fixing it.",
    action: 'Retry Later',
  },
  CLIENT_ERROR: {
    title: 'Request Error',
    description:
      'There was a problem with your request. Please try again or contact support.',
    action: 'Contact Support',
  },
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
  },
};

export const getErrorMessage = (error: unknown): ErrorMessages => {
  if (error instanceof AppError) {
    const messages = ERROR_MESSAGES[error.code];
    if (error.message && error.message !== error.code) {
      return {
        ...messages,
        description: error.message,
      };
    }
    return messages;
  }

  if (error instanceof TypeError) {
    if (error.message.includes('Failed to fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return {
        title: 'Request Cancelled',
        description: 'The request was cancelled.',
        action: 'Retry',
      };
    }

    return {
      ...ERROR_MESSAGES.UNKNOWN_ERROR,
      description: error.message || ERROR_MESSAGES.UNKNOWN_ERROR.description,
    };
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const getErrorTitle = (error: unknown): string => {
  return getErrorMessage(error).title;
};

export const getErrorDescription = (error: unknown): string => {
  return getErrorMessage(error).description;
};

export const getErrorAction = (error: unknown): string | undefined => {
  return getErrorMessage(error).action;
};

export const getHttpErrorMessage = (statusCode: number): ErrorMessages => {
  switch (statusCode) {
    case 400:
      return {
        title: 'Bad Request',
        description: 'The server could not understand the request.',
        action: 'Check Input',
      };
    case 401:
      return ERROR_MESSAGES.AUTH_ERROR;
    case 403:
      return {
        title: 'Access Denied',
        description: "You don't have permission to access this resource.",
        action: 'Contact Support',
      };
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 408:
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    case 429:
      return ERROR_MESSAGES.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      if (statusCode >= 400 && statusCode < 500) {
        return ERROR_MESSAGES.CLIENT_ERROR;
      }
      if (statusCode >= 500) {
        return ERROR_MESSAGES.SERVER_ERROR;
      }
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

export const formatErrorForUser = (error: unknown): string => {
  const { description } = getErrorMessage(error);
  return description;
};

export const formatValidationErrors = (
  errors: Array<{ field: string; message: string }>
): string => {
  if (errors.length === 0) {
    return 'Please check your input.';
  }

  if (errors.length === 1) {
    const error = errors[0];
    return error ? error.message : 'Please check your input.';
  }

  return `Please fix the following issues:\n${errors.map((e) => `• ${e.message}`).join('\n')}`;
};

export const createUserFriendlyError = (
  error: unknown,
  context?: string
): Error => {
  const { description } = getErrorMessage(error);
  const message = context ? `${context}: ${description}` : description;
  return new Error(message);
};
