'use client';

import styled from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

const Section = styled.section`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-20) 0;
  background: var(--gradient-hero);
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
`;

const ErrorCode = styled.div`
  font-size: clamp(6rem, 20vw, 12rem);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-4);
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

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  flex-wrap: wrap;
`;

const NotFoundPage = () => {
  return (
    <Section>
      <Container>
        <Content>
          <ErrorCode>404</ErrorCode>
          <Title>Page not found</Title>
          <Description>
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved or doesn&apos;t exist.
          </Description>
          <Actions>
            <Button size="lg" href="/">
              Go Home
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Contact Support
            </Button>
          </Actions>
        </Content>
      </Container>
    </Section>
  );
};

export default NotFoundPage;
