'use client';

import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

type PricingTier = {
  name: string;
  description?: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
  cta: {
    label: string;
    href: string;
  };
  highlighted?: boolean;
  badge?: string;
};

type PricingProps = {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
};

const Section = styled.section`
  padding: var(--spacing-20) 0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-12);
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
  max-width: 600px;
  margin: 0 auto var(--spacing-8);
`;

const Toggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
`;

const ToggleLabel = styled.span<{ $active: boolean }>`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: ${({ $active }) =>
    $active ? 'var(--color-fg-primary)' : 'var(--color-fg-tertiary)'};
  transition: var(--transition-colors);
`;

const ToggleButton = styled.button<{ $isYearly: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-emphasis);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: var(--transition-colors);

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $isYearly }) => ($isYearly ? '26px' : '2px')};
    width: 18px;
    height: 18px;
    background-color: var(--color-interactive-primary);
    border-radius: var(--radius-full);
    transition: var(--transition-transform);
  }
`;

const SaveBadge = styled.span`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-status-success);
  background-color: var(--color-status-success-bg);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
`;

const Grid = styled.div`
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: 1fr;
  margin-top: var(--spacing-12);

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const PricingCard = styled.div<{ $highlighted: boolean }>`
  padding: var(--spacing-8);
  background-color: ${({ $highlighted }) =>
    $highlighted ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)'};
  border-radius: var(--radius-card);
  border: 1px solid
    ${({ $highlighted }) =>
      $highlighted
        ? 'var(--color-border-brand)'
        : 'var(--color-border-subtle)'};
  display: flex;
  flex-direction: column;
  position: relative;

  ${({ $highlighted }) =>
    $highlighted &&
    `
    &::before {
      content: 'Most Popular';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--gradient-brand);
      color: white;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-full);
    }
  `}
`;

const TierName = styled.h3`
  font-size: var(--text-heading-md-size);
  font-weight: var(--text-heading-md-weight);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const TierDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
  margin-bottom: var(--spacing-6);
`;

const Price = styled.div`
  margin-bottom: var(--spacing-6);
`;

const PriceAmount = styled.span`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-fg-primary);
`;

const PricePeriod = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-8);
  flex: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  padding: var(--spacing-2) 0;

  &::before {
    content: '✓';
    color: var(--color-status-success);
    font-weight: var(--font-weight-bold);
  }
`;

export const Pricing = ({ title, subtitle, tiers }: PricingProps) => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <Section>
      <Container>
        <Header>
          {title && <Title>{title}</Title>}
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
          <Toggle>
            <ToggleLabel $active={!isYearly}>Monthly</ToggleLabel>
            <ToggleButton
              $isYearly={isYearly}
              onClick={() => setIsYearly(!isYearly)}
              aria-label={`Switch to ${isYearly ? 'monthly' : 'yearly'} billing`}
            />
            <ToggleLabel $active={isYearly}>Yearly</ToggleLabel>
            <SaveBadge>Save 13%</SaveBadge>
          </Toggle>
        </Header>

        <Grid>
          {tiers.map((tier, index) => (
            <PricingCard key={index} $highlighted={tier.highlighted ?? false}>
              <TierName>{tier.name}</TierName>
              {tier.description && (
                <TierDescription>{tier.description}</TierDescription>
              )}
              <Price>
                {tier.monthlyPrice === null ? (
                  <PriceAmount>Custom</PriceAmount>
                ) : (
                  <>
                    <PriceAmount>
                      ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </PriceAmount>
                    <PricePeriod>/month</PricePeriod>
                  </>
                )}
              </Price>
              <FeatureList>
                {tier.features.map((feature, featureIndex) => (
                  <FeatureItem key={featureIndex}>{feature}</FeatureItem>
                ))}
              </FeatureList>
              <Button
                variant={tier.highlighted ? 'primary' : 'secondary'}
                href={tier.cta.href}
                fullWidth
              >
                {tier.cta.label}
              </Button>
            </PricingCard>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default Pricing;
