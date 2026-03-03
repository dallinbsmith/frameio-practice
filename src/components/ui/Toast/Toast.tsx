'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: calc(var(--header-height) + var(--spacing-4));
  right: var(--spacing-4);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-width: 400px;
  width: 100%;
  pointer-events: none;

  @media (max-width: 640px) {
    right: var(--spacing-2);
    left: var(--spacing-2);
    max-width: none;
  }
`;

const typeStyles = {
  success: `
    background-color: var(--color-status-success-bg);
    border-color: var(--color-status-success);
    color: var(--color-status-success);
  `,
  error: `
    background-color: var(--color-status-error-bg);
    border-color: var(--color-status-error);
    color: var(--color-status-error);
  `,
  warning: `
    background-color: var(--color-status-warning-bg);
    border-color: var(--color-status-warning);
    color: var(--color-status-warning);
  `,
  info: `
    background-color: var(--color-status-info-bg);
    border-color: var(--color-status-info);
    color: var(--color-status-info);
  `,
};

const ToastItem = styled.div<{ $type: ToastType; $isExiting: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid;
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  animation: ${({ $isExiting }) => ($isExiting ? slideOut : slideIn)}
    var(--duration-moderate) var(--ease-out-expo) forwards;

  ${({ $type }) => typeStyles[$type]}
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
`;

const Message = styled.p`
  flex: 1;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: var(--transition-opacity);

  &:hover {
    opacity: 1;
  }
`;

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setExitingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {mounted &&
        createPortal(
          <ToastContainer>
            {toasts.map((toast) => (
              <ToastItemComponent
                key={toast.id}
                toast={toast}
                isExiting={exitingIds.has(toast.id)}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </ToastContainer>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

type ToastItemComponentProps = {
  toast: Toast;
  isExiting: boolean;
  onClose: () => void;
};

const ToastItemComponent = ({
  toast,
  isExiting,
  onClose,
}: ToastItemComponentProps) => {
  const { duration = 5000 } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, onClose]);

  return (
    <ToastItem $type={toast.type} $isExiting={isExiting}>
      <IconWrapper>{icons[toast.type]}</IconWrapper>
      <Message>{toast.message}</Message>
      <CloseButton onClick={onClose} aria-label="Dismiss notification">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 4L4 12M4 4l8 8" />
        </svg>
      </CloseButton>
    </ToastItem>
  );
};

export default ToastProvider;
