'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';

import { useKeyPress, useLockBodyScroll, useClickOutside } from '@/hooks';

import type { ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
`;

const Overlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation: ${({ $isClosing }) => ($isClosing ? fadeOut : fadeIn)}
    var(--duration-normal) var(--ease-default) forwards;
`;

const sizeStyles = {
  sm: css`
    max-width: 400px;
  `,
  md: css`
    max-width: 500px;
  `,
  lg: css`
    max-width: 700px;
  `,
  xl: css`
    max-width: 900px;
  `,
  full: css`
    max-width: calc(100vw - var(--spacing-8));
    max-height: calc(100vh - var(--spacing-8));
  `,
};

const Content = styled.div<{ $size: ModalSize; $isClosing: boolean }>`
  position: relative;
  width: 100%;
  max-height: calc(100vh - var(--spacing-8));
  overflow-y: auto;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-overlay);
  animation: ${({ $isClosing }) => ($isClosing ? scaleOut : scaleIn)}
    var(--duration-moderate) var(--ease-out-expo) forwards;

  ${({ $size }) => sizeStyles[$size]}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-subtle);
`;

const Title = styled.h2`
  font-size: var(--text-heading-md-size);
  font-weight: var(--text-heading-md-weight);
  color: var(--color-fg-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
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

const Body = styled.div`
  padding: var(--spacing-6);
`;

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M15 5L5 15M5 5l10 10" />
  </svg>
);

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) => {
  const titleId = useId();
  const isClosingRef = useRef(false);
  const contentRef = useClickOutside<HTMLDivElement>(() => {
    if (closeOnOverlayClick) handleClose();
  }, isOpen);

  useLockBodyScroll(isOpen);
  useKeyPress(
    'Escape',
    () => {
      if (closeOnEscape) handleClose();
    },
    { enabled: isOpen }
  );

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    setTimeout(() => {
      isClosingRef.current = false;
      onClose();
    }, 200);
  };

  useEffect(() => {
    isClosingRef.current = false;
  }, [isOpen]);

  if (!isOpen && !isClosingRef.current) return null;

  const modalContent = (
    <Overlay $isClosing={isClosingRef.current}>
      <Content
        ref={contentRef}
        $size={size}
        $isClosing={isClosingRef.current}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {(title || showCloseButton) && (
          <Header>
            {title && <Title id={titleId}>{title}</Title>}
            {showCloseButton && (
              <CloseButton onClick={handleClose} aria-label="Close modal">
                <CloseIcon />
              </CloseButton>
            )}
          </Header>
        )}
        <Body>{children}</Body>
      </Content>
    </Overlay>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default Modal;
