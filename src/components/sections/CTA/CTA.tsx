'use client';

import styled from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

type CTAProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  variant?: 'default' | 'brand' | 'dark';
};

const Section = styled.section<{ $variant: 'default' | 'brand' | 'dark' }>`
  padding: var(--spacing-20) 0;
  background: ${({ $variant }) =>
    $variant === 'brand'
      ? 'var(--gradient-brand)'
      : $variant === 'dark'
        ? 'var(--color-bg-tertiary)'
        : 'var(--color-bg-secondary)'};
`;

const Content = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
`;

const Title = styled.h2`
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

export const CTA = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  variant = 'default',
}: CTAProps) => {
  return (
    <Section $variant={variant}>
      <Container>
        <Content>
          <Title>{title}</Title>
          {subtitle && <Description>{subtitle}</Description>}
          {(primaryCTA || secondaryCTA) && (
            <Actions>
              {primaryCTA && (
                <Button
                  size="lg"
                  href={primaryCTA.href}
                  variant={variant === 'brand' ? 'secondary' : 'primary'}
                >
                  {primaryCTA.label}
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  variant={variant === 'brand' ? 'ghost' : 'outline'}
                  size="lg"
                  href={secondaryCTA.href}
                >
                  {secondaryCTA.label}
                </Button>
              )}
            </Actions>
          )}
        </Content>
      </Container>
    </Section>
  );
};

export default CTA;
