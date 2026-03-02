'use client';

import type { ReactNode } from 'react';

export type ValidationResult = {
  valid: boolean;
  message?: string | undefined;
};

export type ValidatorFn<T = unknown> = (
  value: T,
  formValues?: Record<string, unknown>
) => ValidationResult | Promise<ValidationResult>;

export type FieldConfig<T = unknown> = {
  name: string;
  initialValue: T;
  validators?: ValidatorFn<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  transform?: (value: unknown) => T;
};

export type FieldState<T = unknown> = {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
};

export type FormState<T extends Record<string, unknown>> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
};

export type FormActions<T extends Record<string, unknown>> = {
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error: string | null) => void;
  setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  validateField: <K extends keyof T>(field: K) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: (nextValues?: Partial<T>) => void;
  resetField: <K extends keyof T>(field: K) => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>
  ) => (e?: React.FormEvent) => void;
};

export type UseFormReturn<T extends Record<string, unknown>> = FormState<T> &
  FormActions<T> & {
    register: <K extends keyof T>(
      field: K
    ) => {
      name: K;
      value: T[K];
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => void;
      onBlur: () => void;
    };
    getFieldState: <K extends keyof T>(
      field: K
    ) => {
      value: T[K];
      error: string | null;
      touched: boolean;
      dirty: boolean;
    };
  };

export type StepConfig = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  fields: string[];
  optional?: boolean;
};

export type MultiStepFormState = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
};

export type MultiStepFormActions = {
  goToStep: (step: number) => void;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  markStepComplete: (step: number) => void;
  resetSteps: () => void;
};

export type FieldArrayItem<T = unknown> = {
  id: string;
  value: T;
};

export type FieldArrayState<T = unknown> = {
  fields: FieldArrayItem<T>[];
  length: number;
};

export type FieldArrayActions<T = unknown> = {
  append: (value: T) => void;
  prepend: (value: T) => void;
  insert: (index: number, value: T) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  replace: (index: number, value: T) => void;
  clear: () => void;
};

export type FileUploadState = {
  files: UploadedFile[];
  isUploading: boolean;
  progress: number;
  error: string | null;
  isDragOver: boolean;
};

export type UploadedFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string | undefined;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string | undefined;
};

export type FileUploadConfig = {
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
};
