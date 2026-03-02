'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

import { Button } from '@/components/ui/Button';
import { useLockBodyScroll } from '@/hooks';

import type { ReactNode } from 'react';

type ConfirmDialogVariant = 'default' | 'danger';

type ConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} var(--duration-fast) var(--ease-default);
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  animation: ${scaleIn} var(--duration-normal) var(--ease-out-expo);
`;

const Content = styled.div`
  padding: var(--spacing-6);
`;

const IconContainer = styled.div<{ $variant: ConfirmDialogVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-4);
  border-radius: var(--radius-full);
  background-color: ${({ $variant }) =>
    $variant === 'danger'
      ? 'var(--color-status-error-bg)'
      : 'var(--color-brand-100)'};
  color: ${({ $variant }) =>
    $variant === 'danger'
      ? 'var(--color-status-error)'
      : 'var(--color-brand-600)'};
`;

const Title = styled.h3`
  font-size: var(--text-heading-sm-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const Description = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  line-height: var(--line-height-relaxed);
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border-subtle);
  background-color: var(--color-bg-secondary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
`;

const DangerButton = styled(Button)`
  background-color: var(--color-status-error);

  &:hover:not(:disabled) {
    background-color: var(--color-red-600);
  }
`;

const WarningIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const QuestionIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) => {
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onCancel();
      }
    },
    [isLoading, onCancel]
  );

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  const ConfirmButton = variant === 'danger' ? DangerButton : Button;

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Dialog
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-description' : undefined}
      >
        <Content>
          <IconContainer $variant={variant}>
            {variant === 'danger' ? <WarningIcon /> : <QuestionIcon />}
          </IconContainer>
          <Title id="confirm-title">{title}</Title>
          {description && (
            <Description id="confirm-description">{description}</Description>
          )}
        </Content>
        <Actions>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <ConfirmButton onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </ConfirmButton>
        </Actions>
      </Dialog>
    </Overlay>,
    document.body
  );
};

export default ConfirmDialog;
