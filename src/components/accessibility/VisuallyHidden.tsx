'use client';

import styled from 'styled-components';

import type { ReactNode } from 'react';

type VisuallyHiddenProps = {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
};

const Hidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const VisuallyHidden = ({
  children,
  as = 'span',
}: VisuallyHiddenProps) => {
  return <Hidden as={as}>{children}</Hidden>;
};

export default VisuallyHidden;
