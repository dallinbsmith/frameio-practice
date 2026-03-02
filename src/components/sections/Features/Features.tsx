'use client';

import styled from 'styled-components';

import { AnimatedSection } from '@/components/animations';
import { Container } from '@/components/ui/Container';
import { useInView, useReducedMotion } from '@/hooks';

import type { ReactNode } from 'react';

type FeatureItem = {
  icon?: string | ReactNode;
  title: string;
  description: string;
  link?: {
    label: string;
    href: string;
  };
};

type FeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: FeatureItem[];
  layout?: 'grid' | 'list';
};

const Section = styled.section`
  padding: var(--spacing-20) 0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-16);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const Eyebrow = styled.span`
  display: block;
  font-size: var(--text-eyebrow-size);
  font-weight: var(--text-eyebrow-weight);
  letter-spacing: var(--text-eyebrow-letter-spacing);
  text-transform: uppercase;
  color: var(--color-fg-brand);
  margin-bottom: var(--spacing-4);
`;

const Title = styled.h2`
  font-size: var(--text-heading-xl-size);
  font-weight: var(--text-heading-xl-weight);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-4);
`;

const Subtitle = styled.p`
  font-size: var(--text-body-lg-size);
  color: var(--color-fg-secondary);
`;

const Grid = styled.div<{ $columns: number }>`
  display: grid;
  gap: var(--spacing-8);
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  }
`;

const FeatureCard = styled.div<{
  $delay: number;
  $isVisible: boolean;
  $reducedMotion: boolean;
}>`
  padding: var(--spacing-6);
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border-subtle);
  transition: var(--transition-interactive);
  opacity: ${({ $isVisible, $reducedMotion }) =>
    $reducedMotion || $isVisible ? 1 : 0};
  transform: ${({ $isVisible, $reducedMotion }) =>
    $reducedMotion || $isVisible ? 'translateY(0)' : 'translateY(24px)'};
  transition:
    opacity 0.5s var(--ease-out-expo) ${({ $delay }) => $delay}ms,
    transform 0.5s var(--ease-out-expo) ${({ $delay }) => $delay}ms,
    border-color var(--duration-fast) var(--ease-default),
    box-shadow var(--duration-fast) var(--ease-default);

  &:hover {
    border-color: var(--color-border-emphasis);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card-hover);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-brand);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: var(--text-heading-sm-size);
  font-weight: var(--text-heading-sm-weight);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const FeatureDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  line-height: var(--line-height-relaxed);
`;

const DefaultIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const Features = ({
  eyebrow,
  title,
  subtitle,
  items,
  layout = 'grid',
}: FeaturesProps) => {
  const columns = layout === 'list' ? 2 : 3;
  const { ref, hasBeenInView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
  });
  const reducedMotion = useReducedMotion();

  return (
    <Section>
      <Container>
        {(eyebrow || title || subtitle) && (
          <AnimatedSection animation="fadeInUp">
            <Header>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              {title && <Title>{title}</Title>}
              {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </Header>
          </AnimatedSection>
        )}
        <Grid ref={ref} $columns={columns}>
          {items.map((feature, index) => (
            <FeatureCard
              key={index}
              $delay={index * 100}
              $isVisible={hasBeenInView}
              $reducedMotion={reducedMotion}
            >
              <IconWrapper>
                {typeof feature.icon === 'string' ? (
                  <DefaultIcon />
                ) : (
                  feature.icon || <DefaultIcon />
                )}
              </IconWrapper>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default Features;
