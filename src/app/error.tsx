'use client';

import { useEffect } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Section = styled.section`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-20) 0;
  background-color: var(--color-bg-primary);
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-6);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-status-error-bg);
  border-radius: var(--radius-full);
  color: var(--color-status-error);
`;

const Title = styled.h1`
  font-size: var(--text-heading-xl-size);
  font-weight: var(--text-heading-xl-weight);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-4);
`;

const Description = styled.p`
  font-size: var(--text-body-lg-size);
  color: var(--color-fg-secondary);
  margin-bottom: var(--spacing-8);
`;

const ErrorDigest = styled.code`
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
  background-color: var(--color-bg-surface);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-8);
`;

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  flex-wrap: wrap;
`;

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Application error:', error);
  }, [error]);

  return (
    <Section>
      <Container>
        <Content>
          <IconWrapper>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </IconWrapper>
          <Title>Something went wrong</Title>
          <Description>
            We&apos;re sorry, but something unexpected happened. Please try
            again or contact support if the problem persists.
          </Description>
          {error.digest && <ErrorDigest>Error ID: {error.digest}</ErrorDigest>}
          <Actions>
            <Button size="lg" onClick={reset}>
              Try Again
            </Button>
            <Button variant="secondary" size="lg" href="/">
              Go Home
            </Button>
          </Actions>
        </Content>
      </Container>
    </Section>
  );
};

export default ErrorPage;
