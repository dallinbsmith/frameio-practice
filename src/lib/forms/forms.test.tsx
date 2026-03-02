import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  email,
  maxLength,
  minLength,
  required,
  runValidators,
  useFieldArray,
  useForm,
} from './index';

describe('Validators', () => {
  describe('required', () => {
    it('should fail for empty values', () => {
      const validator = required();
      expect(validator('').valid).toBe(false);
      expect(validator(null).valid).toBe(false);
      expect(validator(undefined).valid).toBe(false);
      expect(validator([]).valid).toBe(false);
    });

    it('should pass for non-empty values', () => {
      const validator = required();
      expect(validator('hello').valid).toBe(true);
      expect(validator(0).valid).toBe(true);
      expect(validator(['item']).valid).toBe(true);
    });

    it('should use custom message', () => {
      const validator = required('Custom message');
      const result = validator('');
      expect(result.message).toBe('Custom message');
    });
  });

  describe('email', () => {
    it('should validate email format', () => {
      const validator = email();
      expect(validator('test@example.com').valid).toBe(true);
      expect(validator('user.name@domain.co.uk').valid).toBe(true);
      expect(validator('invalid').valid).toBe(false);
      expect(validator('no@tld').valid).toBe(false);
    });

    it('should pass for empty string', () => {
      const validator = email();
      expect(validator('').valid).toBe(true);
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      const validator = minLength(5);
      expect(validator('hello').valid).toBe(true);
      expect(validator('hi').valid).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      const validator = maxLength(5);
      expect(validator('hello').valid).toBe(true);
      expect(validator('hello world').valid).toBe(false);
    });
  });

  describe('runValidators', () => {
    it('should run multiple validators and return first error', async () => {
      const validators = [required(), minLength(5)];
      const result = await runValidators('hi', validators);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 5');
    });

    it('should pass when all validators pass', async () => {
      const validators = [required(), minLength(2)];
      const result = await runValidators('hello', validators);
      expect(result.valid).toBe(true);
    });
  });
});

describe('useForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: '', email: '' },
      })
    );

    expect(result.current.values).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.dirty).toBe(false);
  });

  it('should update field values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: '' },
      })
    );

    act(() => {
      result.current.setFieldValue('name', 'John');
    });

    expect(result.current.values.name).toBe('John');
    expect(result.current.dirty).toBe(true);
  });

  it('should validate fields on blur', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validators: {
          email: [required('Email is required')],
        },
        validateOnBlur: true,
      })
    );

    const registration = result.current.register('email');
    act(() => {
      registration.onBlur();
    });

    await waitFor(() => {
      expect(result.current.errors.email).toBe('Email is required');
    });
  });

  it('should reset form to initial values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'initial' },
      })
    );

    act(() => {
      result.current.setFieldValue('name', 'changed');
    });

    expect(result.current.values.name).toBe('changed');

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values.name).toBe('initial');
    expect(result.current.dirty).toBe(false);
  });

  it('should validate entire form', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: '', email: '' },
        validators: {
          name: [required('Name required')],
          email: [required('Email required')],
        },
      })
    );

    let isValid: boolean;
    await act(async () => {
      isValid = await result.current.validateForm();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBe('Name required');
    expect(result.current.errors.email).toBe('Email required');
  });

  it('should handle form submission', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John' },
        validators: {},
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit(onSubmit)();
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    expect(result.current.submitCount).toBe(1);
  });
});

describe('useFieldArray', () => {
  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useFieldArray<string>());

    expect(result.current.fields).toEqual([]);
    expect(result.current.length).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });

  it('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        initialValues: ['one', 'two'],
      })
    );

    expect(result.current.length).toBe(2);
    expect(result.current.fields[0].value).toBe('one');
    expect(result.current.fields[1].value).toBe('two');
  });

  it('should append items', () => {
    const { result } = renderHook(() => useFieldArray<string>());

    act(() => {
      result.current.append('item1');
    });

    expect(result.current.length).toBe(1);
    expect(result.current.fields[0].value).toBe('item1');
  });

  it('should remove items', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        initialValues: ['one', 'two', 'three'],
      })
    );

    act(() => {
      result.current.remove(1);
    });

    expect(result.current.length).toBe(2);
    expect(result.current.fields.map((f) => f.value)).toEqual(['one', 'three']);
  });

  it('should respect maxItems', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        maxItems: 2,
        initialValues: ['one', 'two'],
      })
    );

    expect(result.current.canAdd).toBe(false);

    act(() => {
      result.current.append('three');
    });

    expect(result.current.length).toBe(2);
  });

  it('should respect minItems', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        minItems: 1,
        initialValues: ['one'],
      })
    );

    expect(result.current.canRemove).toBe(false);

    act(() => {
      result.current.remove(0);
    });

    expect(result.current.length).toBe(1);
  });

  it('should swap items', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        initialValues: ['a', 'b', 'c'],
      })
    );

    act(() => {
      result.current.swap(0, 2);
    });

    expect(result.current.fields.map((f) => f.value)).toEqual(['c', 'b', 'a']);
  });

  it('should move items', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        initialValues: ['a', 'b', 'c'],
      })
    );

    act(() => {
      result.current.move(0, 2);
    });

    expect(result.current.fields.map((f) => f.value)).toEqual(['b', 'c', 'a']);
  });

  it('should replace items', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        initialValues: ['a', 'b'],
      })
    );

    act(() => {
      result.current.replace(0, 'replaced');
    });

    expect(result.current.fields[0].value).toBe('replaced');
  });

  it('should clear items respecting minItems', () => {
    const { result } = renderHook(() =>
      useFieldArray<string>({
        initialValues: ['a', 'b', 'c'],
        minItems: 1,
      })
    );

    act(() => {
      result.current.clear();
    });

    expect(result.current.length).toBe(1);
  });
});
