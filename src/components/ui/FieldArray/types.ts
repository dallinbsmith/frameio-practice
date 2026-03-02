import type { ReactNode } from 'react';

export type FieldArrayItemProps<T> = {
  index: number;
  value: T;
  id: string;
  error?: string | undefined;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (value: T) => void;
};

export type FieldArrayProps<T> = {
  label?: string;
  description?: string;
  addLabel?: string;
  emptyMessage?: string;
  minItems?: number;
  maxItems?: number;
  initialValues?: T[];
  renderItem: (props: FieldArrayItemProps<T>) => ReactNode;
  getDefaultValue: () => T;
  onChange?: (values: T[]) => void;
  error?: string;
  className?: string;
};
