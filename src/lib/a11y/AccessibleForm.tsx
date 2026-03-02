'use client';

import { createContext, useContext, useMemo } from 'react';
import styled from 'styled-components';

import { useAriaIds } from './aria';
import { VisuallyHidden } from './VisuallyHidden';

type FieldContextValue = {
  id: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  hasError: boolean;
  hasDescription: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

const useFieldContext = (): FieldContextValue => {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error('Field components must be used within a Field');
  }
  return context;
};

export type FieldProps = {
  children: React.ReactNode;
  name: string;
  hasError?: boolean;
  hasDescription?: boolean;
};

export const Field = ({
  children,
  name,
  hasError = false,
  hasDescription = false,
}: FieldProps) => {
  const { labelId, descriptionId, errorId } = useAriaIds(`field-${name}`);

  const value = useMemo(
    () => ({
      id: `field-${name}-input`,
      labelId,
      descriptionId,
      errorId,
      hasError,
      hasDescription,
    }),
    [name, labelId, descriptionId, errorId, hasError, hasDescription]
  );

  return (
    <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
  );
};

const StyledLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: var(--spacing-1);
  color: var(--color-fg-primary);
`;

export type FieldLabelProps = {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export const FieldLabel = ({
  children,
  required = false,
  className,
}: FieldLabelProps) => {
  const { id, labelId } = useFieldContext();

  return (
    <StyledLabel id={labelId} htmlFor={id} className={className}>
      {children}
      {required && (
        <>
          <span aria-hidden="true" style={{ color: 'var(--color-fg-error)' }}>
            {' '}
            *
          </span>
          <VisuallyHidden> (required)</VisuallyHidden>
        </>
      )}
    </StyledLabel>
  );
};

const StyledDescription = styled.div`
  font-size: 0.875rem;
  color: var(--color-fg-secondary);
  margin-top: var(--spacing-1);
`;

export type FieldDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export const FieldDescription = ({
  children,
  className,
}: FieldDescriptionProps) => {
  const { descriptionId } = useFieldContext();

  return (
    <StyledDescription id={descriptionId} className={className}>
      {children}
    </StyledDescription>
  );
};

const StyledError = styled.div`
  font-size: 0.875rem;
  color: var(--color-fg-error);
  margin-top: var(--spacing-1);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const ErrorIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 4v4M8 10.5v.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export type FieldErrorProps = {
  children: React.ReactNode;
  className?: string;
};

export const FieldError = ({ children, className }: FieldErrorProps) => {
  const { errorId, hasError } = useFieldContext();

  if (!hasError) return null;

  return (
    <StyledError
      id={errorId}
      role="alert"
      aria-live="polite"
      className={className}
    >
      <ErrorIcon />
      {children}
    </StyledError>
  );
};

export type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid
    ${({ $hasError }) =>
      $hasError ? 'var(--color-border-error)' : 'var(--color-border)'};
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-fg-primary);
  font-size: 1rem;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px var(--color-ring-focus);
  }

  &::placeholder {
    color: var(--color-fg-tertiary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FieldInput = ({ className, ...props }: FieldInputProps) => {
  const { id, labelId, descriptionId, errorId, hasError, hasDescription } =
    useFieldContext();

  const ariaDescribedBy = [
    hasDescription ? descriptionId : null,
    hasError ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <StyledInput
      id={id}
      aria-labelledby={labelId}
      aria-describedby={ariaDescribedBy || undefined}
      aria-invalid={hasError}
      $hasError={hasError}
      className={className}
      {...props}
    />
  );
};

export type AccessibleFormGroupProps = {
  children: React.ReactNode;
  legend: string;
  description?: string;
  className?: string;
};

const StyledFieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
`;

const StyledLegend = styled.legend`
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: var(--spacing-3);
  color: var(--color-fg-primary);
`;

const GroupDescription = styled.div`
  font-size: 0.875rem;
  color: var(--color-fg-secondary);
  margin-bottom: var(--spacing-4);
`;

export const AccessibleFormGroup = ({
  children,
  legend,
  description,
  className,
}: AccessibleFormGroupProps) => {
  const descriptionId = description
    ? `group-${legend.replace(/\s+/g, '-')}-desc`
    : undefined;

  return (
    <StyledFieldset className={className} aria-describedby={descriptionId}>
      <StyledLegend>{legend}</StyledLegend>
      {description && (
        <GroupDescription id={descriptionId}>{description}</GroupDescription>
      )}
      {children}
    </StyledFieldset>
  );
};
