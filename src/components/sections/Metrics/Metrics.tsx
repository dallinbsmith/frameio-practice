'use client';

import styled from 'styled-components';

import {
  AnimatedSection,
  CountUp,
  StaggeredChildren,
} from '@/components/animations';
import { Container } from '@/components/ui/Container';

type MetricItem = {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
};

type MetricsProps = {
  title?: string;
  subtitle?: string;
  items: MetricItem[];
};

const Section = styled.section`
  padding: var(--spacing-20) 0;
  background-color: var(--color-bg-secondary);
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
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  gap: var(--spacing-8);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const MetricCard = styled.div`
  text-align: center;
  padding: var(--spacing-6);
`;

const MetricValue = styled.div`
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-fg-brand);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-2);
`;

const MetricLabel = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
`;

const parseNumericValue = (value: string): number => {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

export const Metrics = ({ title, subtitle, items }: MetricsProps) => {
  return (
    <Section>
      <Container>
        {(title || subtitle) && (
          <AnimatedSection animation="fadeInUp">
            <Header>
              {title && <Title>{title}</Title>}
              {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </Header>
          </AnimatedSection>
        )}
        <StaggeredChildren staggerDelay={150}>
          <Grid>
            {items.map((metric, index) => {
              const numericValue = parseNumericValue(metric.value);

              return (
                <MetricCard key={index}>
                  <MetricValue>
                    <CountUp
                      end={numericValue}
                      prefix={metric.prefix}
                      suffix={metric.suffix}
                      duration={2000}
                    />
                  </MetricValue>
                  <MetricLabel>{metric.label}</MetricLabel>
                </MetricCard>
              );
            })}
          </Grid>
        </StaggeredChildren>
      </Container>
    </Section>
  );
};

export default Metrics;
