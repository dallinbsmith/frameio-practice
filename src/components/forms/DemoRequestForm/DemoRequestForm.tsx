'use client';

import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { FieldArray } from '@/components/ui/FieldArray';
import { FileUpload } from '@/components/ui/FileUpload';
import { Input, Select, TextArea } from '@/components/ui/Input';
import {
  MultiStepForm,
  StepContent,
  StepIndicator,
  StepNavigation,
} from '@/components/ui/MultiStepForm';
import {
  email,
  minLength,
  required,
  useForm,
  useMultiStepForm,
} from '@/lib/forms';

import type { DemoRequestFormProps, DemoRequestFormValues } from './types';
import type { StepConfig } from '@/lib/forms';

const FormContainer = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: var(--spacing-6);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
`;

const FormTitle = styled.h2`
  font-size: var(--text-heading-md-size);
  font-weight: var(--font-weight-bold);
  color: var(--color-fg-primary);
  margin: 0 0 var(--spacing-2) 0;
  text-align: center;
`;

const FormDescription = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-fg-secondary);
  margin: 0 0 var(--spacing-6) 0;
  text-align: center;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div<{ $fullWidth?: boolean }>`
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};
`;

const FieldLabel = styled.label`
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const FieldError = styled.span`
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-status-error);
  margin-top: var(--spacing-1);
`;

const CheckboxField = styled.label`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  cursor: pointer;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--color-brand-500);
  cursor: pointer;
`;

const CheckboxLabel = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
`;

const TeamMemberRow = styled.div`
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
`;

const TeamMemberInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: var(--color-status-error-bg);
  color: var(--color-status-error);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);

  &:hover {
    background-color: var(--color-status-error);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: var(--spacing-8);
`;

const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-4);
  background-color: var(--color-status-success-bg);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-status-success);
`;

const SuccessTitle = styled.h3`
  font-size: var(--text-heading-sm-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
  margin: 0 0 var(--spacing-2) 0;
`;

const SuccessText = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-fg-secondary);
  margin: 0;
`;

const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const INITIAL_VALUES: DemoRequestFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  companySize: '',
  industry: '',
  useCase: '',
  teamMembers: [],
  currentTools: '',
  timeline: '',
  budget: '',
  requirements: '',
  files: [],
  referralSource: '',
  marketingConsent: false,
};

const STEPS: StepConfig[] = [
  {
    id: 'contact',
    title: 'Contact Info',
    description: 'Your details',
    fields: ['firstName', 'lastName', 'email', 'phone'],
  },
  {
    id: 'company',
    title: 'Company',
    description: 'About your organization',
    fields: ['company', 'jobTitle', 'companySize', 'industry'],
  },
  {
    id: 'requirements',
    title: 'Requirements',
    description: 'What you need',
    fields: ['useCase', 'teamMembers', 'currentTools', 'requirements'],
  },
  {
    id: 'details',
    title: 'Details',
    description: 'Additional info',
    fields: [
      'timeline',
      'budget',
      'files',
      'referralSource',
      'marketingConsent',
    ],
    optional: true,
  },
];

const COMPANY_SIZES = [
  { value: '', label: 'Select company size' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

const INDUSTRIES = [
  { value: '', label: 'Select industry' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'advertising', label: 'Advertising & Marketing' },
  { value: 'tech', label: 'Technology' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const TIMELINES = [
  { value: '', label: 'Select timeline' },
  { value: 'immediately', label: 'Immediately' },
  { value: '1-month', label: 'Within 1 month' },
  { value: '1-3-months', label: '1-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: 'evaluating', label: 'Just evaluating' },
];

const BUDGETS = [
  { value: '', label: 'Select budget range' },
  { value: 'under-10k', label: 'Under $10,000' },
  { value: '10k-25k', label: '$10,000 - $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k+', label: '$100,000+' },
];

const REFERRAL_SOURCES = [
  { value: '', label: 'How did you hear about us?' },
  { value: 'search', label: 'Search engine' },
  { value: 'social', label: 'Social media' },
  { value: 'referral', label: 'Friend or colleague' },
  { value: 'event', label: 'Event or conference' },
  { value: 'blog', label: 'Blog or article' },
  { value: 'other', label: 'Other' },
];

export const DemoRequestForm = ({
  onSubmit,
  className,
}: DemoRequestFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<DemoRequestFormValues>({
    initialValues: INITIAL_VALUES,
    validators: {
      firstName: [required('First name is required')],
      lastName: [required('Last name is required')],
      email: [
        required('Email is required'),
        email('Please enter a valid email'),
      ],
      company: [required('Company name is required')],
      jobTitle: [required('Job title is required')],
      companySize: [required('Please select company size')],
      industry: [required('Please select an industry')],
      useCase: [
        required('Please describe your use case'),
        minLength(20, 'Please provide more detail (at least 20 characters)'),
      ],
    },
    validateOnBlur: true,
  });

  const multiStep = useMultiStepForm({
    steps: STEPS,
    form,
    validateStepOnNext: true,
  });

  const handleFormSubmit = useCallback(async () => {
    const isValid = await form.validateForm();
    if (!isValid) return;

    try {
      await onSubmit({
        ...form.values,
        teamMembers,
        files: uploadedFiles,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [form, onSubmit, teamMembers, uploadedFiles]);

  const handleNextStep = useCallback(async () => {
    await multiStep.nextStep();
  }, [multiStep]);

  const stepIndicatorSteps = useMemo(
    () =>
      STEPS.map((step) => {
        const result: { title: string; description?: string } = {
          title: step.title,
        };
        if (step.description) {
          result.description = step.description;
        }
        return result;
      }),
    []
  );

  if (isSubmitted) {
    return (
      <FormContainer className={className}>
        <SuccessMessage>
          <SuccessIcon>
            <CheckIcon />
          </SuccessIcon>
          <SuccessTitle>Demo Request Submitted!</SuccessTitle>
          <SuccessText>
            Thank you for your interest. Our team will review your request and
            contact you within 24 hours to schedule your personalized demo.
          </SuccessText>
        </SuccessMessage>
      </FormContainer>
    );
  }

  return (
    <FormContainer className={className}>
      <FormTitle>Request a Demo</FormTitle>
      <FormDescription>
        See how Frame.io can transform your video workflow
      </FormDescription>

      <MultiStepForm>
        <StepIndicator
          currentStep={multiStep.currentStep}
          totalSteps={multiStep.totalSteps}
          completedSteps={multiStep.completedSteps}
          steps={stepIndicatorSteps}
          variant="circles"
          allowNavigation
          onStepClick={multiStep.goToStep}
        />

        <StepContent isActive={multiStep.currentStep === 0}>
          <FormGrid>
            <FormField>
              <FieldLabel>First Name *</FieldLabel>
              <Input
                {...form.register('firstName')}
                placeholder="John"
                error={
                  form.touched.firstName ? form.errors.firstName : undefined
                }
              />
              {form.touched.firstName && form.errors.firstName && (
                <FieldError>{form.errors.firstName}</FieldError>
              )}
            </FormField>
            <FormField>
              <FieldLabel>Last Name *</FieldLabel>
              <Input
                {...form.register('lastName')}
                placeholder="Doe"
                error={form.touched.lastName ? form.errors.lastName : undefined}
              />
              {form.touched.lastName && form.errors.lastName && (
                <FieldError>{form.errors.lastName}</FieldError>
              )}
            </FormField>
            <FormField>
              <FieldLabel>Email *</FieldLabel>
              <Input
                {...form.register('email')}
                type="email"
                placeholder="john@company.com"
                error={form.touched.email ? form.errors.email : undefined}
              />
              {form.touched.email && form.errors.email && (
                <FieldError>{form.errors.email}</FieldError>
              )}
            </FormField>
            <FormField>
              <FieldLabel>Phone</FieldLabel>
              <Input
                {...form.register('phone')}
                type="tel"
                placeholder="+1 (555) 123-4567"
              />
            </FormField>
          </FormGrid>
        </StepContent>

        <StepContent isActive={multiStep.currentStep === 1}>
          <FormGrid>
            <FormField $fullWidth>
              <FieldLabel>Company Name *</FieldLabel>
              <Input
                {...form.register('company')}
                placeholder="Acme Inc."
                error={form.touched.company ? form.errors.company : undefined}
              />
              {form.touched.company && form.errors.company && (
                <FieldError>{form.errors.company}</FieldError>
              )}
            </FormField>
            <FormField>
              <FieldLabel>Job Title *</FieldLabel>
              <Input
                {...form.register('jobTitle')}
                placeholder="Video Producer"
                error={form.touched.jobTitle ? form.errors.jobTitle : undefined}
              />
              {form.touched.jobTitle && form.errors.jobTitle && (
                <FieldError>{form.errors.jobTitle}</FieldError>
              )}
            </FormField>
            <FormField>
              <FieldLabel>Company Size *</FieldLabel>
              <Select
                {...form.register('companySize')}
                error={
                  form.touched.companySize ? form.errors.companySize : undefined
                }
              >
                {COMPANY_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </Select>
              {form.touched.companySize && form.errors.companySize && (
                <FieldError>{form.errors.companySize}</FieldError>
              )}
            </FormField>
            <FormField $fullWidth>
              <FieldLabel>Industry *</FieldLabel>
              <Select
                {...form.register('industry')}
                error={form.touched.industry ? form.errors.industry : undefined}
              >
                {INDUSTRIES.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </Select>
              {form.touched.industry && form.errors.industry && (
                <FieldError>{form.errors.industry}</FieldError>
              )}
            </FormField>
          </FormGrid>
        </StepContent>

        <StepContent isActive={multiStep.currentStep === 2}>
          <FormGrid>
            <FormField $fullWidth>
              <FieldLabel>Describe Your Use Case *</FieldLabel>
              <TextArea
                {...form.register('useCase')}
                placeholder="Tell us about your video workflow and what challenges you're looking to solve..."
                rows={4}
                error={form.touched.useCase ? form.errors.useCase : undefined}
              />
              {form.touched.useCase && form.errors.useCase && (
                <FieldError>{form.errors.useCase}</FieldError>
              )}
            </FormField>
            <FormField $fullWidth>
              <FieldArray<string>
                label="Team Members"
                description="Add email addresses of team members who should be included"
                addLabel="Add Team Member"
                emptyMessage="No team members added"
                maxItems={10}
                getDefaultValue={() => ''}
                onChange={setTeamMembers}
                renderItem={({ value, canRemove, onRemove, onChange }) => (
                  <TeamMemberRow>
                    <TeamMemberInput
                      type="email"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder="teammate@company.com"
                    />
                    <RemoveButton
                      type="button"
                      onClick={onRemove}
                      disabled={!canRemove}
                      title="Remove team member"
                    >
                      <TrashIcon />
                    </RemoveButton>
                  </TeamMemberRow>
                )}
              />
            </FormField>
            <FormField $fullWidth>
              <FieldLabel>Current Tools</FieldLabel>
              <Input
                {...form.register('currentTools')}
                placeholder="e.g., Dropbox, Google Drive, Vimeo"
              />
            </FormField>
            <FormField $fullWidth>
              <FieldLabel>Additional Requirements</FieldLabel>
              <TextArea
                {...form.register('requirements')}
                placeholder="Any specific features or integrations you're looking for?"
                rows={3}
              />
            </FormField>
          </FormGrid>
        </StepContent>

        <StepContent isActive={multiStep.currentStep === 3}>
          <FormGrid>
            <FormField>
              <FieldLabel>Timeline</FieldLabel>
              <Select {...form.register('timeline')}>
                {TIMELINES.map((timeline) => (
                  <option key={timeline.value} value={timeline.value}>
                    {timeline.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField>
              <FieldLabel>Budget</FieldLabel>
              <Select {...form.register('budget')}>
                {BUDGETS.map((budget) => (
                  <option key={budget.value} value={budget.value}>
                    {budget.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField $fullWidth>
              <FileUpload
                label="Supporting Documents (optional)"
                description="Upload any relevant documents, brand guidelines, or examples"
                accept={['.pdf', '.doc', '.docx', '.ppt', '.pptx', 'image/*']}
                maxSize={25 * 1024 * 1024}
                maxFiles={5}
                multiple
                onFilesChange={setUploadedFiles}
              />
            </FormField>
            <FormField $fullWidth>
              <FieldLabel>Referral Source</FieldLabel>
              <Select {...form.register('referralSource')}>
                {REFERRAL_SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField $fullWidth>
              <CheckboxField>
                <CheckboxInput
                  type="checkbox"
                  checked={form.values.marketingConsent}
                  onChange={(e) =>
                    form.setFieldValue('marketingConsent', e.target.checked)
                  }
                />
                <CheckboxLabel>
                  I agree to receive marketing communications about Frame.io
                  products and services. You can unsubscribe at any time.
                </CheckboxLabel>
              </CheckboxField>
            </FormField>
          </FormGrid>
        </StepContent>

        <StepNavigation
          onNext={handleNextStep}
          onPrev={multiStep.prevStep}
          onSubmit={handleFormSubmit}
          canGoNext={multiStep.canGoNext}
          canGoPrev={multiStep.canGoPrev}
          isFirstStep={multiStep.isFirstStep}
          isLastStep={multiStep.isLastStep}
          isSubmitting={form.isSubmitting}
          nextLabel="Continue"
          prevLabel="Back"
          submitLabel="Request Demo"
        />
      </MultiStepForm>
    </FormContainer>
  );
};

export default DemoRequestForm;
