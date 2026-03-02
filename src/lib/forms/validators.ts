import type { ValidationResult, ValidatorFn } from './types';

export const required =
  (message = 'This field is required'): ValidatorFn<unknown> =>
  (value) => {
    const isEmpty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    return {
      valid: !isEmpty,
      message: isEmpty ? message : undefined,
    };
  };

export const minLength =
  (min: number, message?: string): ValidatorFn<string> =>
  (value) => {
    const valid = typeof value === 'string' && value.length >= min;
    return {
      valid,
      message: valid
        ? undefined
        : (message ?? `Must be at least ${min} characters`),
    };
  };

export const maxLength =
  (max: number, message?: string): ValidatorFn<string> =>
  (value) => {
    const valid = typeof value === 'string' && value.length <= max;
    return {
      valid,
      message: valid
        ? undefined
        : (message ?? `Must be at most ${max} characters`),
    };
  };

export const pattern =
  (regex: RegExp, message = 'Invalid format'): ValidatorFn<string> =>
  (value) => {
    const valid = typeof value === 'string' && regex.test(value);
    return {
      valid,
      message: valid ? undefined : message,
    };
  };

export const email =
  (message = 'Invalid email address'): ValidatorFn<string> =>
  (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid =
      typeof value === 'string' && (value === '' || emailRegex.test(value));
    return {
      valid,
      message: valid ? undefined : message,
    };
  };

export const phone =
  (message = 'Invalid phone number'): ValidatorFn<string> =>
  (value) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    const valid =
      typeof value === 'string' && (value === '' || phoneRegex.test(value));
    return {
      valid,
      message: valid ? undefined : message,
    };
  };

export const url =
  (message = 'Invalid URL'): ValidatorFn<string> =>
  (value) => {
    if (typeof value !== 'string' || value === '') {
      return { valid: true };
    }
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message };
    }
  };

export const min =
  (minValue: number, message?: string): ValidatorFn<number> =>
  (value) => {
    const valid = typeof value === 'number' && value >= minValue;
    return {
      valid,
      message: valid ? undefined : (message ?? `Must be at least ${minValue}`),
    };
  };

export const max =
  (maxValue: number, message?: string): ValidatorFn<number> =>
  (value) => {
    const valid = typeof value === 'number' && value <= maxValue;
    return {
      valid,
      message: valid ? undefined : (message ?? `Must be at most ${maxValue}`),
    };
  };

export const integer =
  (message = 'Must be a whole number'): ValidatorFn<number> =>
  (value) => {
    const valid = typeof value === 'number' && Number.isInteger(value);
    return {
      valid,
      message: valid ? undefined : message,
    };
  };

export const matches =
  <T>(fieldName: string, message?: string): ValidatorFn<T> =>
  (value, formValues) => {
    const otherValue = formValues?.[fieldName];
    const valid = value === otherValue;
    return {
      valid,
      message: valid ? undefined : (message ?? `Must match ${fieldName}`),
    };
  };

export const oneOf =
  <T>(values: T[], message?: string): ValidatorFn<T> =>
  (value) => {
    const valid = values.includes(value);
    return {
      valid,
      message: valid
        ? undefined
        : (message ?? `Must be one of: ${values.join(', ')}`),
    };
  };

export const custom =
  <T>(
    validateFn: (value: T, formValues?: Record<string, unknown>) => boolean,
    message: string
  ): ValidatorFn<T> =>
  (value, formValues) => {
    const valid = validateFn(value, formValues);
    return {
      valid,
      message: valid ? undefined : message,
    };
  };

export const asyncValidator =
  <T>(
    validateFn: (
      value: T,
      formValues?: Record<string, unknown>
    ) => Promise<boolean>,
    message: string
  ): ValidatorFn<T> =>
  async (value, formValues) => {
    const valid = await validateFn(value, formValues);
    return {
      valid,
      message: valid ? undefined : message,
    };
  };

export const compose =
  <T>(...validators: ValidatorFn<T>[]): ValidatorFn<T> =>
  async (value, formValues) => {
    for (const validator of validators) {
      const result = await validator(value, formValues);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };

export const when =
  <T>(
    condition: (formValues: Record<string, unknown>) => boolean,
    validator: ValidatorFn<T>
  ): ValidatorFn<T> =>
  async (value, formValues) => {
    if (!formValues || !condition(formValues)) {
      return { valid: true };
    }
    return validator(value, formValues);
  };

export const runValidators = async <T>(
  value: T,
  validators: ValidatorFn<T>[],
  formValues?: Record<string, unknown>
): Promise<ValidationResult> => {
  for (const validator of validators) {
    const result = await validator(value, formValues);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};
