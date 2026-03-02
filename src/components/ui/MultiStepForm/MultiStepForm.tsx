'use client';

import { useCallback, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { Button } from '@/components/ui/Button';

import type {
  StepContentProps,
  StepIndicatorProps,
  StepIndicatorVariant,
  StepNavigationProps,
} from './types';
import type { ReactNode } from 'react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const IndicatorContainer = styled.div<{ $variant: StepIndicatorVariant }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $variant }) =>
    $variant === 'progress' ? 'stretch' : 'space-between'};
  margin-bottom: var(--spacing-8);
  ${({ $variant }) =>
    $variant === 'progress' &&
    css`
      flex-direction: column;
      gap: var(--spacing-2);
    `}
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const StepItem = styled.button<{
  $isActive: boolean;
  $isComplete: boolean;
  $isClickable: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  background: none;
  border: none;
  padding: var(--spacing-2);
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  flex: 1;
  min-width: 0;
  transition: opacity var(--duration-fast) var(--ease-default);

  &:hover {
    opacity: ${({ $isClickable }) => ($isClickable ? 0.8 : 1)};
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    border-radius: var(--radius-md);
  }
`;

const StepCircle = styled.div<{
  $isActive: boolean;
  $isComplete: boolean;
}>`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  transition: all var(--duration-normal) var(--ease-default);

  ${({ $isActive, $isComplete }) => {
    if ($isComplete) {
      return css`
        background-color: var(--color-status-success);
        color: white;
      `;
    }
    if ($isActive) {
      return css`
        background-color: var(--color-brand-500);
        color: white;
      `;
    }
    return css`
      background-color: var(--color-bg-tertiary);
      color: var(--color-fg-secondary);
    `;
  }}
`;

const StepLabel = styled.span<{ $isActive: boolean }>`
  font-size: var(--font-size-sm);
  color: ${({ $isActive }) =>
    $isActive ? 'var(--color-fg-primary)' : 'var(--color-fg-secondary)'};
  font-weight: ${({ $isActive }) =>
    $isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const StepDescription = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const Connector = styled.div<{ $isComplete: boolean }>`
  flex: 1;
  height: 2px;
  margin: 0 var(--spacing-2);
  background-color: ${({ $isComplete }) =>
    $isComplete ? 'var(--color-status-success)' : 'var(--color-border-subtle)'};
  transition: background-color var(--duration-normal) var(--ease-default);
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background-color: var(--color-brand-500);
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) var(--ease-out-expo);
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
`;

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const StepIndicator = ({
  currentStep,
  totalSteps,
  completedSteps,
  steps,
  variant = 'circles',
  onStepClick,
  allowNavigation = false,
}: StepIndicatorProps) => {
  const handleStepClick = useCallback(
    (step: number) => {
      if (allowNavigation && onStepClick) {
        onStepClick(step);
      }
    },
    [allowNavigation, onStepClick]
  );

  const progress = useMemo(() => {
    return Math.round((currentStep / Math.max(totalSteps - 1, 1)) * 100);
  }, [currentStep, totalSteps]);

  if (variant === 'progress') {
    return (
      <IndicatorContainer $variant={variant}>
        <ProgressLabel>
          <span>{steps[currentStep]?.title}</span>
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
        </ProgressLabel>
        <ProgressBarContainer>
          <ProgressBarFill $progress={progress} />
        </ProgressBarContainer>
      </IndicatorContainer>
    );
  }

  return (
    <IndicatorContainer $variant={variant}>
      <StepsContainer>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = completedSteps.includes(index);
          const isClickable =
            allowNavigation && (isComplete || index === currentStep + 1);

          return (
            <div
              key={step.title}
              style={{ display: 'flex', alignItems: 'center', flex: 1 }}
            >
              <StepItem
                $isActive={isActive}
                $isComplete={isComplete}
                $isClickable={isClickable}
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                type="button"
                aria-current={isActive ? 'step' : undefined}
              >
                <StepCircle $isActive={isActive} $isComplete={isComplete}>
                  {isComplete ? (
                    <CheckIcon />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </StepCircle>
                <StepLabel $isActive={isActive}>{step.title}</StepLabel>
                {step.description && (
                  <StepDescription>{step.description}</StepDescription>
                )}
              </StepItem>
              {index < steps.length - 1 && (
                <Connector $isComplete={completedSteps.includes(index)} />
              )}
            </div>
          );
        })}
      </StepsContainer>
    </IndicatorContainer>
  );
};

const ContentContainer = styled.div<{ $animate: boolean }>`
  ${({ $animate }) =>
    $animate &&
    css`
      animation: ${fadeIn} var(--duration-normal) var(--ease-out-expo);
    `}
`;

export const StepContent = ({
  children,
  isActive,
  animate = true,
}: StepContentProps) => {
  if (!isActive) return null;

  return <ContentContainer $animate={animate}>{children}</ContentContainer>;
};

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-border-subtle);
  margin-top: var(--spacing-6);
`;

const NavigationGroup = styled.div`
  display: flex;
  gap: var(--spacing-3);
`;

export const StepNavigation = ({
  onNext,
  onPrev,
  onSubmit,
  canGoNext,
  canGoPrev,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  nextLabel = 'Continue',
  prevLabel = 'Back',
  submitLabel = 'Submit',
}: StepNavigationProps) => {
  return (
    <NavigationContainer>
      <NavigationGroup>
        {!isFirstStep && (
          <Button
            variant="secondary"
            onClick={onPrev}
            disabled={!canGoPrev || isSubmitting}
          >
            {prevLabel}
          </Button>
        )}
      </NavigationGroup>
      <NavigationGroup>
        {isLastStep ? (
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canGoNext || isSubmitting}>
            {nextLabel}
          </Button>
        )}
      </NavigationGroup>
    </NavigationContainer>
  );
};

type MultiStepFormProps = {
  children: ReactNode;
  className?: string;
  onSubmit?: (e?: React.FormEvent) => void;
};

const FormContainer = styled.form`
  width: 100%;
`;

export const MultiStepForm = ({
  children,
  className,
  onSubmit,
}: MultiStepFormProps) => {
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(e);
    },
    [onSubmit]
  );

  return (
    <FormContainer className={className} onSubmit={handleSubmit}>
      {children}
    </FormContainer>
  );
};
