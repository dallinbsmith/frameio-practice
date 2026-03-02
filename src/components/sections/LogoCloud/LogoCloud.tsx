'use client';

import styled from 'styled-components';

import { Container } from '@/components/ui/Container';

type LogoItem = {
  name: string;
  logo: {
    src: string;
    alt: string;
  };
  href?: string;
};

type LogoCloudProps = {
  title?: string;
  logos: LogoItem[];
};

const Section = styled.section`
  padding: var(--spacing-16) 0;
  background-color: var(--color-bg-secondary);
`;

const Title = styled.p`
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  margin-bottom: var(--spacing-8);
`;

const LogoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-8) var(--spacing-12);
`;

const LogoItem = styled.div`
  color: var(--color-fg-muted);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  opacity: 0.6;
  transition: var(--transition-colors);

  &:hover {
    opacity: 1;
    color: var(--color-fg-secondary);
  }
`;

const LogoImage = styled.img`
  height: 32px;
  width: auto;
  filter: grayscale(100%) brightness(0.7);
  transition: var(--transition-all);

  &:hover {
    filter: grayscale(0%) brightness(1);
  }
`;

export const LogoCloud = ({ title, logos }: LogoCloudProps) => {
  return (
    <Section>
      <Container>
        {title && <Title>{title}</Title>}
        <LogoGrid>
          {logos.map((logo, index) => (
            <LogoItem key={index}>
              <LogoImage src={logo.logo.src} alt={logo.logo.alt || logo.name} />
            </LogoItem>
          ))}
        </LogoGrid>
      </Container>
    </Section>
  );
};

export default LogoCloud;
