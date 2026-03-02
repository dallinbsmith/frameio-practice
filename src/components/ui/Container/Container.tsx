'use client';

import styled, { css } from 'styled-components';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type ContainerProps = ComponentPropsWithoutRef<'div'> & {
  size?: ContainerSize;
  children: ReactNode;
};

const sizeStyles = {
  sm: css`
    max-width: var(--container-4xl);
  `,
  md: css`
    max-width: var(--container-5xl);
  `,
  lg: css`
    max-width: var(--container-6xl);
  `,
  xl: css`
    max-width: var(--container-7xl);
  `,
  full: css`
    max-width: 100%;
  `,
};

const StyledContainer = styled.div<{ $size: ContainerSize }>`
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--container-padding);

  ${({ $size }) => sizeStyles[$size]}
`;

export const Container = ({
  size = 'xl',
  children,
  ...props
}: ContainerProps) => {
  return (
    <StyledContainer $size={size} {...props}>
      {children}
    </StyledContainer>
  );
};

export default Container;
