'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Spinner } from '@/components/ui/Spinner';

type LazyComponentProps<TProps extends object> = {
  loader: () => Promise<{ default: React.ComponentType<TProps> }>;
  props: TProps;
  fallback?: React.ReactNode;
  errorFallback?:
    | React.ReactNode
    | ((error: Error, retry: () => void) => React.ReactNode);
  onLoad?: () => void;
  onError?: (error: Error) => void;
  delay?: number;
};

const DefaultFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  color: var(--color-fg-error);
  text-align: center;
  gap: var(--spacing-4);
`;

const RetryButton = styled.button`
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-fg-primary);

  &:hover {
    background: var(--color-bg-tertiary);
  }
`;

type LazyWrapperProps<TProps extends object> = {
  Component: React.ComponentType<TProps>;
  props: TProps;
  onLoad?: (() => void) | undefined;
};

const LazyWrapper = <TProps extends object>({
  Component,
  props,
  onLoad,
}: LazyWrapperProps<TProps>) => {
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return <Component {...props} />;
};

const DefaultErrorFallback = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => (
  <ErrorContainer>
    <p>Failed to load component</p>
    <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{error.message}</p>
    <RetryButton onClick={onRetry}>Retry</RetryButton>
  </ErrorContainer>
);

export const LazyComponent = <TProps extends object>({
  loader,
  props,
  fallback,
  errorFallback,
  onLoad,
  onError,
  delay = 0,
}: LazyComponentProps<TProps>) => {
  const [Component, setComponent] =
    useState<React.ComponentType<TProps> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadComponent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedModule = await loader();
      setComponent(() => loadedModule.default);
    } catch (err) {
      const loadError = err instanceof Error ? err : new Error('Unknown error');
      setError(loadError);
      onError?.(loadError);
    } finally {
      setLoading(false);
    }
  }, [loader, onError]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent, retryCount]);

  useEffect(() => {
    if (delay > 0 && loading) {
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, delay);
      return () => clearTimeout(timer);
    }
    setShowFallback(loading);
    return undefined;
  }, [delay, loading]);

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  if (error) {
    if (typeof errorFallback === 'function') {
      return <>{errorFallback(error, handleRetry)}</>;
    }
    return (
      <>
        {errorFallback ?? (
          <DefaultErrorFallback error={error} onRetry={handleRetry} />
        )}
      </>
    );
  }

  if (loading && showFallback) {
    return (
      <>
        {fallback ?? (
          <DefaultFallback>
            <Spinner size="md" />
          </DefaultFallback>
        )}
      </>
    );
  }

  if (!Component) {
    return null;
  }

  return (
    <Suspense
      fallback={
        fallback ?? (
          <DefaultFallback>
            <Spinner size="md" />
          </DefaultFallback>
        )
      }
    >
      <LazyWrapper Component={Component} props={props} onLoad={onLoad} />
    </Suspense>
  );
};

export type { LazyComponentProps };
export default LazyComponent;
