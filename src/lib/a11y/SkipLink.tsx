'use client';

import styled from 'styled-components';

import type { SkipLinkProps } from './types';

const StyledSkipLink = styled.a`
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-bg-primary);
  color: var(--color-fg-primary);
  border: 2px solid var(--color-border-focus);
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: top 0.15s ease;

  &:focus {
    top: var(--spacing-4);
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  &:focus-visible {
    top: var(--spacing-4);
  }
`;

export const SkipLink = ({
  href = '#main-content',
  children = 'Skip to main content',
  className,
}: SkipLinkProps) => {
  return (
    <StyledSkipLink href={href} className={className}>
      {children}
    </StyledSkipLink>
  );
};

export type SkipLinksProps = {
  links: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
};

const SkipLinksContainer = styled.div`
  position: absolute;
  top: -100%;
  left: var(--spacing-4);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-focus);
  border-radius: var(--radius-md);
  transition: top 0.15s ease;

  &:focus-within {
    top: var(--spacing-4);
  }
`;

const SkipLinksItem = styled.a`
  padding: var(--spacing-2) var(--spacing-4);
  color: var(--color-fg-primary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  white-space: nowrap;

  &:hover {
    background: var(--color-bg-secondary);
  }

  &:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;

export const SkipLinks = ({ links, className }: SkipLinksProps) => {
  return (
    <SkipLinksContainer className={className}>
      {links.map((link) => (
        <SkipLinksItem key={link.href} href={link.href}>
          {link.label}
        </SkipLinksItem>
      ))}
    </SkipLinksContainer>
  );
};

export default SkipLink;
