'use client';

import { useState } from 'react';
import styled from 'styled-components';

import { Container } from '@/components/ui/Container';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
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

const FAQList = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItemWrapper = styled.div`
  border-bottom: 1px solid var(--color-border-subtle);

  &:last-child {
    border-bottom: none;
  }
`;

const QuestionButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6) 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--color-fg-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);

  &:hover {
    color: var(--color-fg-brand);
  }

  svg {
    flex-shrink: 0;
    transition: var(--transition-transform);
    transform: rotate(${({ $isOpen }) => ($isOpen ? '180deg' : '0deg')});
  }
`;

const Answer = styled.div<{ $isOpen: boolean }>`
  overflow: hidden;
  max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  transition:
    max-height var(--duration-moderate) var(--ease-out-cubic),
    opacity var(--duration-normal) var(--ease-default);
`;

const AnswerContent = styled.p`
  padding-bottom: var(--spacing-6);
  color: var(--color-fg-secondary);
  line-height: var(--line-height-relaxed);
`;

const ChevronIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 7.5L10 12.5L15 7.5" />
  </svg>
);

export const FAQ = ({ title, subtitle, items }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section>
      <Container>
        {(title || subtitle) && (
          <Header>
            {title && <Title>{title}</Title>}
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </Header>
        )}
        <FAQList>
          {items.map((item, index) => (
            <FAQItemWrapper key={index}>
              <QuestionButton
                $isOpen={openIndex === index}
                onClick={() => toggleItem(index)}
                aria-expanded={openIndex === index}
              >
                {item.question}
                <ChevronIcon />
              </QuestionButton>
              <Answer $isOpen={openIndex === index}>
                <AnswerContent>{item.answer}</AnswerContent>
              </Answer>
            </FAQItemWrapper>
          ))}
        </FAQList>
      </Container>
    </Section>
  );
};

export default FAQ;
