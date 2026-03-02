'use client';

import styled from 'styled-components';

type SkipLinkProps = {
  href?: string;
  children?: React.ReactNode;
};

const Link = styled.a`
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-modal);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-interactive-primary);
  color: white;
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  border-radius: 0 0 var(--radius-md) 0;
  transform: translateY(-100%);
  transition: transform var(--duration-fast) var(--ease-default);

  &:focus {
    transform: translateY(0);
    outline: 2px solid var(--color-interactive-primary);
    outline-offset: 2px;
  }
`;

export const SkipLink = ({
  href = '#main-content',
  children = 'Skip to main content',
}: SkipLinkProps) => {
  return <Link href={href}>{children}</Link>;
};

export default SkipLink;
