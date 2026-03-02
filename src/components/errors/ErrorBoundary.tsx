'use client';

import { Component } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/ui/Button';
import { trackError } from '@/lib/analytics';
import { createErrorReport, reportError } from '@/lib/monitoring';

import type { ReactNode, ErrorInfo } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?:
    | ReactNode
    | ((props: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  reportToEndpoint?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
};

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
  min-height: 300px;
`;

const ErrorIcon = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-status-error-bg);
  border-radius: var(--radius-full);
  color: var(--color-status-error);
`;

const ErrorTitle = styled.h2`
  font-size: var(--text-heading-md-size);
  font-weight: var(--text-heading-md-weight);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const ErrorMessage = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-fg-secondary);
  margin-bottom: var(--spacing-6);
  max-width: 400px;
`;

const RetryInfo = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
  margin-top: var(--spacing-2);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-3);
`;

const ErrorDetails = styled.details`
  margin-top: var(--spacing-4);
  max-width: 500px;
  text-align: left;

  summary {
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--color-fg-tertiary);
    margin-bottom: var(--spacing-2);

    &:hover {
      color: var(--color-fg-secondary);
    }
  }

  pre {
    background: var(--color-bg-surface);
    padding: var(--spacing-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    overflow-x: auto;
    color: var(--color-fg-secondary);
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({ errorInfo });

    trackError(error, {
      componentStack: errorInfo.componentStack ?? '',
      retryCount: this.state.retryCount,
    });

    if (this.props.reportToEndpoint) {
      const report = createErrorReport(
        error,
        errorInfo.componentStack ?? undefined,
        { retryCount: this.state.retryCount }
      );
      reportError(error, {
        endpoint: this.props.reportToEndpoint,
        onError: () => report,
      });
    }

    this.props.onError?.(error, errorInfo);

    const { maxRetries = 0, retryDelay = 2000 } = this.props;
    if (maxRetries > 0 && this.state.retryCount < maxRetries) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleReset(true);
      }, retryDelay);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleReset = (isAutoRetry = false): void => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: isAutoRetry ? prev.retryCount + 1 : 0,
    }));
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { maxRetries = 0 } = this.props;

    if (hasError && error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error,
            reset: () => this.handleReset(),
          });
        }
        return this.props.fallback;
      }

      const isAutoRetrying = maxRetries > 0 && retryCount < maxRetries;

      return (
        <ErrorContainer>
          <ErrorIcon>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </ErrorIcon>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {isAutoRetrying
              ? `Attempting to recover... (Retry ${retryCount + 1}/${maxRetries})`
              : 'An error occurred while rendering this section. Please try again.'}
          </ErrorMessage>
          {!isAutoRetrying && (
            <>
              <ButtonGroup>
                <Button onClick={() => this.handleReset()}>Try Again</Button>
                <Button variant="secondary" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </ButtonGroup>
              {retryCount > 0 && (
                <RetryInfo>
                  Failed after {retryCount} automatic{' '}
                  {retryCount === 1 ? 'retry' : 'retries'}
                </RetryInfo>
              )}
            </>
          )}
          {process.env.NODE_ENV === 'development' && errorInfo && (
            <ErrorDetails>
              <summary>Error details</summary>
              <pre>{error.stack}</pre>
              <pre>{errorInfo.componentStack}</pre>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
