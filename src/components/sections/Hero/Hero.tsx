'use client';

import styled, { keyframes } from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

import type { ReactNode } from 'react';

type MediaObject = {
  type: 'image' | 'video';
  src: string;
  alt?: string;
};

type HeroProps = {
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
  media?: MediaObject | ReactNode;
  align?: 'left' | 'center';
};

const isMediaObject = (
  media: MediaObject | ReactNode
): media is MediaObject => {
  return (
    typeof media === 'object' &&
    media !== null &&
    'type' in media &&
    'src' in media
  );
};

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Section = styled.section`
  padding: calc(var(--header-height) + var(--spacing-16)) 0 var(--spacing-20);
  background: var(--gradient-hero);
  min-height: 80vh;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const Content = styled.div<{ $align: 'left' | 'center' }>`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  text-align: ${({ $align }) => $align};
  align-items: ${({ $align }) =>
    $align === 'center' ? 'center' : 'flex-start'};
  max-width: ${({ $align }) => ($align === 'center' ? '800px' : 'none')};
  margin: ${({ $align }) => ($align === 'center' ? '0 auto' : '0')};
`;

const Eyebrow = styled.span`
  font-size: var(--text-eyebrow-size);
  font-weight: var(--text-eyebrow-weight);
  line-height: var(--text-eyebrow-line-height);
  letter-spacing: var(--text-eyebrow-letter-spacing);
  text-transform: uppercase;
  color: var(--color-fg-brand);
  animation: ${fadeInUp} 0.6s var(--ease-out-expo) 0.1s both;
`;

const Title = styled.h1`
  font-size: var(--text-display-lg-size);
  font-weight: var(--text-display-lg-weight);
  line-height: var(--text-display-lg-line-height);
  letter-spacing: var(--text-display-lg-letter-spacing);
  color: var(--color-fg-primary);
  text-wrap: balance;
  animation: ${fadeInUp} 0.6s var(--ease-out-expo) 0.2s both;

  @media (min-width: 768px) {
    font-size: var(--text-display-xl-size);
  }
`;

const Description = styled.p`
  font-size: var(--text-body-lg-size);
  line-height: var(--text-body-lg-line-height);
  color: var(--color-fg-secondary);
  max-width: 600px;
  animation: ${fadeInUp} 0.6s var(--ease-out-expo) 0.3s both;
`;

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  margin-top: var(--spacing-2);
  animation: ${fadeInUp} 0.6s var(--ease-out-expo) 0.4s both;
`;

const MediaWrapper = styled.div`
  margin-top: var(--spacing-12);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  animation: ${fadeInUp} 0.8s var(--ease-out-expo) 0.5s both;
`;

export const Hero = ({
  eyebrow,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  media,
  align = 'center',
}: HeroProps) => {
  const renderMedia = () => {
    if (!media) return null;
    if (isMediaObject(media)) {
      if (media.type === 'image') {
        return <img src={media.src} alt={media.alt ?? ''} />;
      }
      return <video src={media.src} autoPlay muted loop playsInline />;
    }
    return media;
  };

  return (
    <Section>
      <Container>
        <Content $align={align}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Title>{title}</Title>
          {subtitle && <Description>{subtitle}</Description>}
          {(primaryCTA || secondaryCTA) && (
            <Actions>
              {primaryCTA && (
                <Button size="lg" href={primaryCTA.href}>
                  {primaryCTA.label}
                </Button>
              )}
              {secondaryCTA && (
                <Button variant="secondary" size="lg" href={secondaryCTA.href}>
                  {secondaryCTA.label}
                </Button>
              )}
            </Actions>
          )}
        </Content>
        {media && <MediaWrapper>{renderMedia()}</MediaWrapper>}
      </Container>
    </Section>
  );
};

export default Hero;
