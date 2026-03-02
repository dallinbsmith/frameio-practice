'use client';

import { createElement } from 'react';
import styled from 'styled-components';

import type { VisuallyHiddenProps } from './types';

const HiddenSpan = styled.span<{ $isFocusable?: boolean }>`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;

  ${({ $isFocusable }) =>
    $isFocusable &&
    `
    &:focus,
    &:active {
      position: static;
      width: auto;
      height: auto;
      padding: inherit;
      margin: inherit;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `}
`;

export const VisuallyHidden = ({
  children,
  as = 'span',
  isFocusable = false,
}: VisuallyHiddenProps) => {
  if (as === 'span') {
    return <HiddenSpan $isFocusable={isFocusable}>{children}</HiddenSpan>;
  }

  return createElement(
    as,
    {
      style: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      },
    },
    children
  );
};

export const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
};

export default VisuallyHidden;
