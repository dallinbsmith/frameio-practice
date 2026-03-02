'use client';

import { useCallback, useMemo, useState } from 'react';

import type {
  MultiStepFormActions,
  MultiStepFormState,
  StepConfig,
  UseFormReturn,
} from './types';

type UseMultiStepFormConfig<T extends Record<string, unknown>> = {
  steps: StepConfig[];
  form: UseFormReturn<T>;
  validateStepOnNext?: boolean;
};

type UseMultiStepFormReturn<T extends Record<string, unknown>> =
  MultiStepFormState &
    MultiStepFormActions & {
      currentStepConfig: StepConfig;
      form: UseFormReturn<T>;
      getStepFields: (stepIndex: number) => string[];
      isStepValid: (stepIndex: number) => boolean;
      isStepTouched: (stepIndex: number) => boolean;
    };

export const useMultiStepForm = <T extends Record<string, unknown>>({
  steps,
  form,
  validateStepOnNext = true,
}: UseMultiStepFormConfig<T>): UseMultiStepFormReturn<T> => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const currentStepConfig: StepConfig = steps[currentStep] ?? {
    id: 'default',
    title: 'Step',
    fields: [],
  };

  const progress = useMemo(() => {
    if (totalSteps <= 1) return 100;
    return Math.round((currentStep / (totalSteps - 1)) * 100);
  }, [currentStep, totalSteps]);

  const getStepFields = useCallback(
    (stepIndex: number): string[] => {
      return steps[stepIndex]?.fields ?? [];
    },
    [steps]
  );

  const isStepValid = useCallback(
    (stepIndex: number): boolean => {
      const stepFields = getStepFields(stepIndex);
      return stepFields.every((field) => {
        const fieldState = form.getFieldState(field as keyof T);
        return !fieldState.error;
      });
    },
    [form, getStepFields]
  );

  const isStepTouched = useCallback(
    (stepIndex: number): boolean => {
      const stepFields = getStepFields(stepIndex);
      return stepFields.some((field) => {
        const fieldState = form.getFieldState(field as keyof T);
        return fieldState.touched;
      });
    },
    [form, getStepFields]
  );

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepFields = getStepFields(currentStep);
    let allValid = true;

    for (const field of stepFields) {
      form.setFieldTouched(field as keyof T, true);
      const isValid = await form.validateField(field as keyof T);
      if (!isValid) {
        allValid = false;
      }
    }

    return allValid;
  }, [currentStep, form, getStepFields]);

  const canGoPrev = !isFirstStep;

  const canGoNext = useMemo(() => {
    if (isLastStep) return false;
    const stepConfig = steps[currentStep];
    if (stepConfig?.optional) return true;
    return isStepValid(currentStep);
  }, [currentStep, isLastStep, isStepValid, steps]);

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= totalSteps) return;

      const canNavigate =
        step < currentStep ||
        completedSteps.includes(step - 1) ||
        step === currentStep + 1;

      if (canNavigate) {
        setCurrentStep(step);
      }
    },
    [currentStep, completedSteps, totalSteps]
  );

  const nextStep = useCallback(async (): Promise<boolean> => {
    if (isLastStep) return false;

    if (validateStepOnNext) {
      const isValid = await validateCurrentStep();
      if (!isValid) return false;
    }

    setCompletedSteps((prev) => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }
      return prev;
    });

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    return true;
  }, [
    currentStep,
    isLastStep,
    totalSteps,
    validateCurrentStep,
    validateStepOnNext,
  ]);

  const prevStep = useCallback(() => {
    if (isFirstStep) return;
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [isFirstStep]);

  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });
  }, []);

  const resetSteps = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps([]);
    form.resetForm();
  }, [form]);

  return {
    currentStep,
    totalSteps,
    completedSteps,
    canGoNext,
    canGoPrev,
    isFirstStep,
    isLastStep,
    progress,
    currentStepConfig,
    form,
    goToStep,
    nextStep,
    prevStep,
    markStepComplete,
    resetSteps,
    getStepFields,
    isStepValid,
    isStepTouched,
  };
};
