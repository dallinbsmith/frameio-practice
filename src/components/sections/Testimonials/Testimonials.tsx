'use client';

import styled from 'styled-components';

import { AnimatedSection } from '@/components/animations';
import { Container } from '@/components/ui/Container';
import { useInView, useReducedMotion } from '@/hooks';

type TestimonialItem = {
  quote: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: {
      src: string;
      alt: string;
    };
  };
};

type TestimonialsProps = {
  title?: string;
  subtitle?: string;
  items: TestimonialItem[];
};

const Section = styled.section`
  padding: var(--spacing-20) 0;
  background-color: var(--color-bg-primary);
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
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TestimonialCard = styled.div<{
  $delay: number;
  $isVisible: boolean;
  $reducedMotion: boolean;
}>`
  padding: var(--spacing-8);
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  opacity: ${({ $isVisible, $reducedMotion }) =>
    $reducedMotion || $isVisible ? 1 : 0};
  transform: ${({ $isVisible, $reducedMotion }) =>
    $reducedMotion || $isVisible
      ? 'translateY(0) scale(1)'
      : 'translateY(24px) scale(0.98)'};
  transition:
    opacity 0.6s var(--ease-out-expo) ${({ $delay }) => $delay}ms,
    transform 0.6s var(--ease-out-expo) ${({ $delay }) => $delay}ms,
    border-color var(--duration-fast) var(--ease-default),
    box-shadow var(--duration-fast) var(--ease-default);

  &:hover {
    border-color: var(--color-border-emphasis);
    box-shadow: var(--shadow-card-hover);
  }
`;

const Quote = styled.blockquote`
  font-size: var(--font-size-base);
  color: var(--color-fg-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
  flex: 1;

  &::before {
    content: '"';
    font-size: var(--font-size-4xl);
    color: var(--color-fg-brand);
    line-height: 1;
    display: block;
    margin-bottom: var(--spacing-2);
  }
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-border-subtle);
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-brand);
  overflow: hidden;
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
`;

const AuthorRole = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
`;

export const Testimonials = ({ title, subtitle, items }: TestimonialsProps) => {
  const { ref, hasBeenInView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
  });
  const reducedMotion = useReducedMotion();

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
        <Grid ref={ref}>
          {items.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              $delay={index * 150}
              $isVisible={hasBeenInView}
              $reducedMotion={reducedMotion}
            >
              <Quote>{testimonial.quote}</Quote>
              <Author>
                <Avatar>
                  {testimonial.author.avatar ? (
                    <AvatarImage
                      src={testimonial.author.avatar.src}
                      alt={testimonial.author.avatar.alt}
                    />
                  ) : (
                    testimonial.author.name.charAt(0)
                  )}
                </Avatar>
                <AuthorInfo>
                  <AuthorName>{testimonial.author.name}</AuthorName>
                  <AuthorRole>
                    {testimonial.author.title}
                    {testimonial.author.company &&
                      `, ${testimonial.author.company}`}
                  </AuthorRole>
                </AuthorInfo>
              </Author>
            </TestimonialCard>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default Testimonials;
