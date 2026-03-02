import type { ReactNode } from 'react';

export type StepIndicatorVariant = 'circles' | 'progress' | 'numbered';

export type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  steps: {
    title: string;
    description?: string;
    icon?: ReactNode;
  }[];
  variant?: StepIndicatorVariant;
  onStepClick?: (step: number) => void;
  allowNavigation?: boolean;
};

export type StepContentProps = {
  children: ReactNode;
  isActive: boolean;
  animate?: boolean;
};

export type StepNavigationProps = {
  onNext: () => void;
  onPrev: () => void;
  onSubmit?: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  submitLabel?: string;
};
