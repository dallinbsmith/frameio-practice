'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { runValidators } from './validators';

import type { UseFormReturn, ValidatorFn } from './types';

type UseFormConfig<T extends Record<string, unknown>> = {
  initialValues: T;
  validators?: Partial<Record<keyof T, ValidatorFn<any>[]>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => void | Promise<void>;
};

export const useForm = <T extends Record<string, unknown>>({
  initialValues,
  validators = {},
  validateOnChange = false,
  validateOnBlur = true,
  onSubmit,
}: UseFormConfig<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const initialValuesRef = useRef(initialValues);

  const dirty = useMemo(() => {
    return Object.keys(values).some(
      (key) =>
        values[key as keyof T] !== initialValuesRef.current[key as keyof T]
    );
  }, [values]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange && validators[field]) {
        runValidators(
          value,
          validators[field] as ValidatorFn<any>[],
          values
        ).then((result) => {
          setErrors((prev) => {
            if (result.valid) {
              const next = { ...prev };
              delete next[field];
              return next;
            }
            return { ...prev, [field]: result.message };
          });
        });
      }
    },
    [validateOnChange, validators, values]
  );

  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string | null) => {
      setErrors((prev) => {
        if (error === null) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: error };
      });
    },
    []
  );

  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, isTouched: boolean) => {
      setTouched((prev) => ({ ...prev, [field]: isTouched }));
    },
    []
  );

  const validateField = useCallback(
    async <K extends keyof T>(field: K): Promise<boolean> => {
      const fieldValidators = validators[field];
      if (!fieldValidators || fieldValidators.length === 0) {
        return true;
      }

      setIsValidating(true);
      const result = await runValidators(
        values[field],
        fieldValidators as ValidatorFn<any>[],
        values
      );
      setIsValidating(false);

      setErrors((prev) => {
        if (result.valid) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: result.message };
      });

      return result.valid;
    },
    [validators, values]
  );

  const validateForm = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isFormValid = true;

    for (const field of Object.keys(validators) as (keyof T)[]) {
      const fieldValidators = validators[field];
      if (!fieldValidators || fieldValidators.length === 0) continue;

      const result = await runValidators(
        values[field],
        fieldValidators as ValidatorFn<any>[],
        values
      );

      if (!result.valid && result.message) {
        newErrors[field] = result.message;
        isFormValid = false;
      }
    }

    setErrors(newErrors);
    setIsValidating(false);
    return isFormValid;
  }, [validators, values]);

  const resetForm = useCallback((nextValues?: Partial<T>) => {
    const newValues = nextValues
      ? { ...initialValuesRef.current, ...nextValues }
      : initialValuesRef.current;
    setValues(newValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, []);

  const resetField = useCallback(<K extends keyof T>(field: K) => {
    setValues((prev) => ({
      ...prev,
      [field]: initialValuesRef.current[field],
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setTouched((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (submitFn: (values: T) => void | Promise<void>) =>
      async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        setSubmitCount((prev) => prev + 1);

        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Record<keyof T, boolean>
        );
        setTouched(allTouched);

        const formIsValid = await validateForm();
        if (!formIsValid) {
          return;
        }

        setIsSubmitting(true);
        try {
          await (submitFn || onSubmit)?.(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, validateForm, onSubmit]
  );

  const register = useCallback(
    <K extends keyof T>(field: K) => ({
      name: field,
      value: values[field],
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        const target = e.target;
        let newValue: unknown;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
          newValue = target.checked;
        } else if (
          target instanceof HTMLInputElement &&
          target.type === 'number'
        ) {
          newValue = target.value === '' ? '' : Number(target.value);
        } else {
          newValue = target.value;
        }

        setFieldValue(field, newValue as T[K]);
      },
      onBlur: () => {
        setFieldTouched(field, true);
        if (validateOnBlur && validators[field]) {
          validateField(field);
        }
      },
    }),
    [
      values,
      setFieldValue,
      setFieldTouched,
      validateOnBlur,
      validators,
      validateField,
    ]
  );

  const getFieldState = useCallback(
    <K extends keyof T>(field: K) => ({
      value: values[field],
      error: errors[field] ?? null,
      touched: touched[field] ?? false,
      dirty: values[field] !== initialValuesRef.current[field],
    }),
    [values, errors, touched]
  );

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    isValidating,
    submitCount,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    resetField,
    handleSubmit,
    register,
    getFieldState,
  };
};
