'use client';

import { Component, Suspense } from 'react';
import styled from 'styled-components';

import { Spinner } from '@/components/ui/Spinner';

import type { AsyncBoundaryProps } from './types';

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

const DefaultFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  min-height: 100px;
`;

const DefaultErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  text-align: center;
  color: var(--color-fg-secondary);
`;

const ErrorMessage = styled.p`
  margin-bottom: var(--spacing-4);
`;

const RetryButton = styled.button`
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-fg-primary);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--color-bg-tertiary);
  }
`;

class ErrorBoundaryInner extends Component<
  {
    children: React.ReactNode;
    fallback?:
      | React.ReactNode
      | ((props: { error: Error; reset: () => void }) => React.ReactNode)
      | undefined;
    onError?: ((error: Error) => void) | undefined;
  },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    this.props.onError?.(error);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            reset: this.reset,
          });
        }
        return this.props.fallback;
      }

      return (
        <DefaultErrorContainer>
          <ErrorMessage>Something went wrong</ErrorMessage>
          <RetryButton onClick={this.reset}>Try Again</RetryButton>
        </DefaultErrorContainer>
      );
    }

    return this.props.children;
  }
}

export const AsyncBoundary = ({
  children,
  fallback,
  errorFallback,
  onError,
  suspenseKey,
}: AsyncBoundaryProps): React.ReactNode => {
  const suspenseFallback = fallback ?? (
    <DefaultFallback>
      <Spinner size="md" />
    </DefaultFallback>
  );

  return (
    <ErrorBoundaryInner fallback={errorFallback} onError={onError}>
      <Suspense key={suspenseKey} fallback={suspenseFallback}>
        {children}
      </Suspense>
    </ErrorBoundaryInner>
  );
};

export default AsyncBoundary;
