'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeStyles = {
  sm: css`
    padding: var(--spacing-2) var(--spacing-4);
    font-size: var(--font-size-sm);
    gap: var(--spacing-1-5);
  `,
  md: css`
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--font-size-base);
    gap: var(--spacing-2);
  `,
  lg: css`
    padding: var(--spacing-4) var(--spacing-8);
    font-size: var(--font-size-lg);
    gap: var(--spacing-2-5);
  `,
};

const variantStyles = {
  primary: css`
    background-color: var(--color-interactive-primary);
    color: var(--color-fg-primary);
    box-shadow: var(--shadow-button-primary);

    &:hover:not(:disabled) {
      background-color: var(--color-interactive-primary-hover);
      box-shadow: var(--shadow-button-primary-hover);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: var(--color-interactive-primary-active);
      transform: translateY(0);
    }
  `,
  secondary: css`
    background-color: var(--color-bg-surface);
    color: var(--color-fg-primary);
    border: 1px solid var(--color-border-emphasis);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-surface-hover);
      border-color: var(--color-border-strong);
    }

    &:active:not(:disabled) {
      background-color: var(--color-bg-surface-active);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--color-fg-secondary);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-surface-hover);
      color: var(--color-fg-primary);
    }

    &:active:not(:disabled) {
      background-color: var(--color-bg-surface-active);
    }
  `,
  outline: css`
    background-color: transparent;
    color: var(--color-fg-primary);
    border: 1px solid var(--color-border-emphasis);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-surface-hover);
      border-color: var(--color-border-strong);
    }

    &:active:not(:disabled) {
      background-color: var(--color-bg-surface-active);
    }
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  border-radius: var(--radius-button);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition-button);
  white-space: nowrap;
  user-select: none;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  &:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-brand);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledLink = styled(Link)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  border-radius: var(--radius-button);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition-button);
  white-space: nowrap;
  user-select: none;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  &:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-brand);
  }
`;

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}: ButtonProps) => {
  if ('href' in props && props.href) {
    return (
      <StyledLink
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        {...(props as Omit<ButtonAsLink, 'variant' | 'size' | 'fullWidth'>)}
      >
        {children}
      </StyledLink>
    );
  }

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...(props as Omit<ButtonAsButton, 'variant' | 'size' | 'fullWidth'>)}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
