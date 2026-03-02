'use client';

import { useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import { Button } from '@/components/ui/Button';
import { useFieldArray } from '@/lib/forms';

import type { FieldArrayProps } from './types';

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
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-3);
`;

const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
`;

const Description = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  margin: 0;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const ItemContainer = styled.div`
  animation: ${fadeIn} var(--duration-fast) var(--ease-default);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border-subtle);
`;

const EmptyText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
  margin: 0 0 var(--spacing-4) 0;
  text-align: center;
`;

const ErrorText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-status-error);
  margin-top: var(--spacing-2);
`;

const AddButton = styled(Button)`
  align-self: flex-start;
`;

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const FieldArray = <T,>({
  label,
  description,
  addLabel = 'Add Item',
  emptyMessage = 'No items added yet',
  minItems = 0,
  maxItems = Infinity,
  initialValues = [],
  renderItem,
  getDefaultValue,
  onChange,
  error,
  className,
}: FieldArrayProps<T>) => {
  const {
    fields,
    canAdd,
    canRemove,
    isEmpty,
    errors,
    append,
    remove,
    replace,
    setError,
  } = useFieldArray<T>({
    initialValues,
    minItems,
    maxItems,
  });

  useEffect(() => {
    if (onChange) {
      onChange(fields.map((f) => f.value));
    }
  }, [fields, onChange]);

  const handleAdd = useCallback(() => {
    if (canAdd) {
      append(getDefaultValue());
    }
  }, [canAdd, append, getDefaultValue]);

  const handleRemove = useCallback(
    (index: number) => {
      if (canRemove) {
        remove(index);
      }
    },
    [canRemove, remove]
  );

  const handleChange = useCallback(
    (index: number, value: T) => {
      replace(index, value);
      setError(fields[index]?.id ?? '', null);
    },
    [replace, setError, fields]
  );

  return (
    <Container className={className}>
      <Header>
        <LabelContainer>
          {label && <Label>{label}</Label>}
          {description && <Description>{description}</Description>}
        </LabelContainer>
        {canAdd && !isEmpty && (
          <AddButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAdd}
          >
            <PlusIcon />
            {addLabel}
          </AddButton>
        )}
      </Header>

      {isEmpty ? (
        <EmptyState>
          <EmptyText>{emptyMessage}</EmptyText>
          <AddButton type="button" variant="secondary" onClick={handleAdd}>
            <PlusIcon />
            {addLabel}
          </AddButton>
        </EmptyState>
      ) : (
        <ItemsList>
          {fields.map((field, index) => (
            <ItemContainer key={field.id}>
              {renderItem({
                index,
                value: field.value,
                id: field.id,
                error: errors.get(field.id),
                canRemove,
                onRemove: () => handleRemove(index),
                onChange: (value: T) => handleChange(index, value),
              })}
            </ItemContainer>
          ))}
        </ItemsList>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default FieldArray;
