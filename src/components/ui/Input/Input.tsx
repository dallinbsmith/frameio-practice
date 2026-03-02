'use client';

import { forwardRef, useId } from 'react';
import styled, { css } from 'styled-components';

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';

type InputSize = 'sm' | 'md' | 'lg';

type BaseInputProps = {
  label?: string;
  error?: string | undefined;
  hint?: string;
  icon?: ReactNode;
  size?: InputSize;
};

type InputProps = BaseInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type TextAreaProps = BaseInputProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
    rows?: number;
  };

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
`;

const RequiredAsterisk = styled.span`
  color: var(--color-status-error);
  margin-left: var(--spacing-1);
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-fg-tertiary);
  pointer-events: none;
`;

const sizeStyles = {
  sm: css`
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
  `,
  md: css`
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-base);
  `,
  lg: css`
    padding: var(--spacing-4) var(--spacing-5);
    font-size: var(--font-size-lg);
  `,
};

const baseInputStyles = css<{
  $size: InputSize;
  $hasIcon: boolean;
  $hasError: boolean;
}>`
  width: 100%;
  font-family: var(--font-sans);
  color: var(--color-fg-primary);
  background-color: var(--color-bg-surface);
  border: 1px solid
    ${({ $hasError }) =>
      $hasError ? 'var(--color-status-error)' : 'var(--color-border-default)'};
  border-radius: var(--radius-md);
  transition: var(--transition-interactive);
  outline: none;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $hasIcon, $size }) =>
    $hasIcon &&
    css`
      padding-left: ${$size === 'sm'
        ? 'var(--spacing-8)'
        : $size === 'lg'
          ? 'var(--spacing-12)'
          : 'var(--spacing-10)'};
    `}

  &::placeholder {
    color: var(--color-fg-muted);
  }

  &:hover:not(:disabled) {
    border-color: ${({ $hasError }) =>
      $hasError ? 'var(--color-status-error)' : 'var(--color-border-emphasis)'};
  }

  &:focus {
    border-color: ${({ $hasError }) =>
      $hasError
        ? 'var(--color-status-error)'
        : 'var(--color-interactive-primary)'};
    box-shadow: ${({ $hasError }) =>
      $hasError ? 'var(--shadow-focus-error)' : 'var(--shadow-focus-brand)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-bg-tertiary);
  }
`;

const StyledInput = styled.input<{
  $size: InputSize;
  $hasIcon: boolean;
  $hasError: boolean;
}>`
  ${baseInputStyles}
`;

const StyledTextArea = styled.textarea<{
  $size: InputSize;
  $hasIcon: boolean;
  $hasError: boolean;
}>`
  ${baseInputStyles}
  resize: vertical;
  min-height: 100px;
`;

const Hint = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
`;

const ErrorMessage = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-status-error);
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      size = 'md',
      id,
      required,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <Wrapper className={className}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <RequiredAsterisk>*</RequiredAsterisk>}
          </Label>
        )}
        <InputContainer>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <StyledInput
            ref={ref}
            id={inputId}
            $size={size}
            $hasIcon={Boolean(icon)}
            $hasError={hasError}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            required={required}
            {...props}
          />
        </InputContainer>
        {error && <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage>}
        {hint && !error && <Hint id={`${inputId}-hint`}>{hint}</Hint>}
      </Wrapper>
    );
  }
);

Input.displayName = 'Input';

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      size = 'md',
      id,
      required,
      className,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <Wrapper className={className}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <RequiredAsterisk>*</RequiredAsterisk>}
          </Label>
        )}
        <InputContainer>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <StyledTextArea
            ref={ref}
            id={inputId}
            rows={rows}
            $size={size}
            $hasIcon={Boolean(icon)}
            $hasError={hasError}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            required={required}
            {...props}
          />
        </InputContainer>
        {error && <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage>}
        {hint && !error && <Hint id={`${inputId}-hint`}>{hint}</Hint>}
      </Wrapper>
    );
  }
);

TextArea.displayName = 'TextArea';

type SelectProps = Omit<BaseInputProps, 'icon'> &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      id,
      required,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <Wrapper className={className}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <RequiredAsterisk>*</RequiredAsterisk>}
          </Label>
        )}
        <StyledSelect
          ref={ref}
          id={inputId}
          $size={size}
          $hasError={hasError}
          aria-invalid={hasError}
          required={required}
          {...props}
        >
          {children}
        </StyledSelect>
        {error && <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage>}
        {hint && !error && <Hint id={`${inputId}-hint`}>{hint}</Hint>}
      </Wrapper>
    );
  }
);

Select.displayName = 'Select';

const StyledSelect = styled.select<{ $size: InputSize; $hasError: boolean }>`
  width: 100%;
  font-family: var(--font-sans);
  color: var(--color-fg-primary);
  background-color: var(--color-bg-surface);
  border: 1px solid
    ${({ $hasError }) =>
      $hasError ? 'var(--color-status-error)' : 'var(--color-border-default)'};
  border-radius: var(--radius-md);
  transition: var(--transition-interactive);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  padding-right: var(--spacing-10);

  ${({ $size }) => sizeStyles[$size]}

  &:hover:not(:disabled) {
    border-color: ${({ $hasError }) =>
      $hasError ? 'var(--color-status-error)' : 'var(--color-border-emphasis)'};
  }

  &:focus {
    border-color: ${({ $hasError }) =>
      $hasError
        ? 'var(--color-status-error)'
        : 'var(--color-interactive-primary)'};
    box-shadow: ${({ $hasError }) =>
      $hasError ? 'var(--shadow-focus-error)' : 'var(--shadow-focus-brand)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-bg-tertiary);
  }
`;

export default Input;
