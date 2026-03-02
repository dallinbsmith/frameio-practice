'use client';

import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

type FormData = {
  name: string;
  email: string;
  company: string;
  inquiryType: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type ContactFormProps = {
  onSuccess?: () => void;
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const FormRow = styled.div`
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SuccessMessage = styled.div`
  padding: var(--spacing-6);
  background-color: var(--color-status-success-bg);
  border: 1px solid var(--color-status-success);
  border-radius: var(--radius-lg);
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-status-success);
  border-radius: 50%;
  color: white;
`;

const SuccessTitle = styled.h3`
  font-size: var(--text-heading-md-size);
  font-weight: var(--text-heading-md-weight);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const SuccessText = styled.p`
  color: var(--color-fg-secondary);
`;

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const ContactForm = ({ onSuccess }: ContactFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    inquiryType: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.inquiryType) {
      newErrors.inquiryType = 'Please select an inquiry type';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    onSuccess?.();
  };

  if (isSuccess) {
    return (
      <SuccessMessage>
        <SuccessIcon>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </SuccessIcon>
        <SuccessTitle>Message Sent!</SuccessTitle>
        <SuccessText>
          Thank you for reaching out. Our team will get back to you within 24
          hours.
        </SuccessText>
      </SuccessMessage>
    );
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <FormRow>
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="John Doe"
          required
          disabled={isSubmitting}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="john@company.com"
          required
          disabled={isSubmitting}
        />
      </FormRow>

      <FormRow>
        <Input
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Acme Inc."
          hint="Optional"
          disabled={isSubmitting}
        />
        <Select
          label="Inquiry Type"
          name="inquiryType"
          value={formData.inquiryType}
          onChange={handleChange}
          error={errors.inquiryType}
          required
          disabled={isSubmitting}
        >
          <option value="">Select an option...</option>
          <option value="sales">Sales Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="partnership">Partnership</option>
          <option value="press">Press / Media</option>
          <option value="other">Other</option>
        </Select>
      </FormRow>

      <TextArea
        label="Message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
        placeholder="Tell us how we can help..."
        rows={5}
        required
        disabled={isSubmitting}
      />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner size="sm" color="currentColor" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>
    </Form>
  );
};

export default ContactForm;
