'use client';

import { Component } from 'react';
import styled from 'styled-components';

import { useIsOnline } from './useNetworkStatus';

import type { SafeComponentProps } from './types';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
`;

const OfflineIcon = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  color: var(--color-fg-secondary);
`;

const OfflineTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const OfflineMessage = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-fg-secondary);
  max-width: 300px;
`;

const WifiOffIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

export type OfflineFallbackProps = {
  title?: string;
  message?: string;
  className?: string;
};

export const OfflineFallback = ({
  title = "You're offline",
  message = 'Please check your internet connection and try again.',
  className,
}: OfflineFallbackProps) => (
  <OfflineContainer className={className}>
    <OfflineIcon>
      <WifiOffIcon />
    </OfflineIcon>
    <OfflineTitle>{title}</OfflineTitle>
    <OfflineMessage>{message}</OfflineMessage>
  </OfflineContainer>
);

export type OnlineOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const OnlineOnly = ({
  children,
  fallback = <OfflineFallback />,
}: OnlineOnlyProps): React.ReactNode => {
  const isOnline = useIsOnline();

  if (!isOnline) {
    return fallback;
  }

  return children;
};

type SafeComponentState = {
  hasError: boolean;
};

export class SafeComponent extends Component<
  SafeComponentProps,
  SafeComponentState
> {
  state: SafeComponentState = {
    hasError: false,
  };

  static getDerivedStateFromError(): SafeComponentState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    if (!this.props.silent) {
      console.error('SafeComponent caught error:', error);
    }
    this.props.onError?.(error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  color: var(--color-fg-tertiary);
`;

const EmptyTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const EmptyDescription = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-fg-secondary);
  max-width: 400px;
`;

const InboxIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon,
  title = 'No items found',
  description,
  action,
  className,
}: EmptyStateProps) => (
  <EmptyStateContainer className={className}>
    <EmptyIcon>{icon ?? <InboxIcon />}</EmptyIcon>
    <EmptyTitle>{title}</EmptyTitle>
    {description && <EmptyDescription>{description}</EmptyDescription>}
    {action && <div style={{ marginTop: 'var(--spacing-4)' }}>{action}</div>}
  </EmptyStateContainer>
);
