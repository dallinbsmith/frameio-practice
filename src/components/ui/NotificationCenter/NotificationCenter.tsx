'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { useClickOutside } from '@/hooks';

import { useNotificationCenter } from './context';

import type { Notification, NotificationType } from './types';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  position: relative;
`;

const TriggerButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-fg-secondary);
  cursor: pointer;
  transition: var(--transition-interactive);

  &:hover {
    background-color: var(--color-bg-surface-hover);
    color: var(--color-fg-primary);
  }

  &:focus-visible {
    box-shadow: var(--shadow-focus);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: white;
  background-color: var(--color-status-error);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  width: 380px;
  max-height: 480px;
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: ${fadeIn} var(--duration-normal) var(--ease-out-expo);
  z-index: var(--z-dropdown);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-subtle);
`;

const HeaderTitle = styled.h3`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const HeaderButton = styled.button`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  transition: var(--transition-colors);

  &:hover {
    color: var(--color-fg-primary);
    background-color: var(--color-bg-surface-hover);
  }
`;

const List = styled.div`
  max-height: 380px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  padding: var(--spacing-8);
  text-align: center;
  color: var(--color-fg-tertiary);
  font-size: var(--font-size-sm);
`;

const NotificationItem = styled.div<{ $read: boolean }>`
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: ${({ $read }) =>
    $read ? 'transparent' : 'var(--color-bg-surface)'};
  border-bottom: 1px solid var(--color-border-subtle);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default);

  &:hover {
    background-color: var(--color-bg-surface-hover);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const IconContainer = styled.div<{ $type: NotificationType }>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $type }) => {
    switch ($type) {
      case 'success':
        return 'var(--color-status-success-bg)';
      case 'warning':
        return 'var(--color-status-warning-bg)';
      case 'error':
        return 'var(--color-status-error-bg)';
      default:
        return 'var(--color-status-info-bg)';
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case 'success':
        return 'var(--color-status-success)';
      case 'warning':
        return 'var(--color-status-warning)';
      case 'error':
        return 'var(--color-status-error)';
      default:
        return 'var(--color-status-info)';
    }
  }};
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
  margin-bottom: 2px;
`;

const Message = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-fg-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Timestamp = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  margin-top: var(--spacing-1);
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-fg-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: var(--transition-interactive);

  ${NotificationItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background-color: var(--color-bg-surface-active);
    color: var(--color-fg-primary);
  }
`;

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 6.5a5 5 0 0 0-10 0c0 5-2 7-2 7h14s-2-2-2-7" />
    <path d="M11.73 17a2 2 0 0 1-3.46 0" />
  </svg>
);

const TypeIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'success':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.78 5.97l-4.5 5.5a.75.75 0 0 1-1.14.02L4.22 9.22a.75.75 0 1 1 1.06-1.06l1.38 1.38 3.97-4.85a.75.75 0 1 1 1.15.97z" />
        </svg>
      );
    case 'warning':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5a.75.75 0 0 1 .65.38l6.5 11.5A.75.75 0 0 1 14.5 15h-13a.75.75 0 0 1-.65-1.12l6.5-11.5A.75.75 0 0 1 8 1.5zM7.25 10V7a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0zm.75 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        </svg>
      );
    case 'error':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.03 10.03l-.72.72a.75.75 0 0 1-1.06 0L8 9.5l-1.25 1.25a.75.75 0 0 1-1.06-1.06L6.94 8.5 5.69 7.25a.75.75 0 0 1 1.06-1.06L8 7.44l1.25-1.25a.75.75 0 0 1 1.06 1.06L9.06 8.5l1.25 1.25a.75.75 0 0 1-.28 1.28z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 4v5a.75.75 0 0 1-1.5 0V4a.75.75 0 0 1 1.5 0zM8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </svg>
      );
  }
};

const NotificationRow = ({
  notification,
  onRead,
  onRemove,
}: {
  notification: Notification;
  onRead: () => void;
  onRemove: () => void;
}) => (
  <NotificationItem $read={notification.read} onClick={onRead}>
    <IconContainer $type={notification.type}>
      {notification.icon ?? <TypeIcon type={notification.type} />}
    </IconContainer>
    <Content>
      <Title>{notification.title}</Title>
      {notification.message && <Message>{notification.message}</Message>}
      <Timestamp>{formatTime(notification.timestamp)}</Timestamp>
    </Content>
    {notification.dismissible !== false && (
      <CloseButton
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Dismiss notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" />
        </svg>
      </CloseButton>
    )}
  </NotificationItem>
);

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(
    () => setIsOpen(false),
    isOpen
  );
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationCenter();

  return (
    <Container ref={containerRef}>
      <TriggerButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
        )}
      </TriggerButton>

      {isOpen && (
        <Panel>
          <Header>
            <HeaderTitle>Notifications</HeaderTitle>
            <HeaderActions>
              {unreadCount > 0 && (
                <HeaderButton onClick={markAllAsRead}>
                  Mark all read
                </HeaderButton>
              )}
              {notifications.length > 0 && (
                <HeaderButton onClick={clearAll}>Clear all</HeaderButton>
              )}
            </HeaderActions>
          </Header>
          <List>
            {notifications.length === 0 ? (
              <EmptyState>No notifications yet</EmptyState>
            ) : (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onRemove={() => removeNotification(notification.id)}
                />
              ))
            )}
          </List>
        </Panel>
      )}
    </Container>
  );
};

export default NotificationCenter;
