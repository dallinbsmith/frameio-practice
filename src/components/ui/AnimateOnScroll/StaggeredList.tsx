'use client';

import { Children, cloneElement, isValidElement, useMemo } from 'react';
import styled from 'styled-components';

import { useScrollAnimationWithStagger } from '@/lib/animation/useScrollAnimation';

import type { StaggeredListProps } from '@/lib/animation/types';

const ListWrapper = styled.div`
  display: contents;
`;

export const StaggeredList = ({
  children,
  stagger = 100,
  animation = 'fadeSlide',
  direction = 'up',
  triggerOnScroll = true,
  className,
}: StaggeredListProps) => {
  const childArray = Children.toArray(children);

  const {
    ref,
    isVisible: _isVisible,
    getItemStyle,
  } = useScrollAnimationWithStagger(animation, direction, {
    stagger,
    count: childArray.length,
    triggerOnce: true,
    disabled: !triggerOnScroll,
  });

  const staggeredChildren = useMemo(() => {
    return childArray.map((child, index) => {
      if (!isValidElement(child)) {
        return child;
      }

      const itemStyle = getItemStyle(index);
      const existingStyle = (child.props as { style?: React.CSSProperties })
        .style;

      return cloneElement(child, {
        ...child.props,
        key: child.key ?? index,
        style: {
          ...existingStyle,
          ...itemStyle,
        },
      } as React.HTMLAttributes<HTMLElement>);
    });
  }, [childArray, getItemStyle]);

  return (
    <ListWrapper ref={ref as React.Ref<HTMLDivElement>} className={className}>
      {staggeredChildren}
    </ListWrapper>
  );
};

export type StaggeredGridProps = StaggeredListProps & {
  columns?: number;
  gap?: string;
};

const GridWrapper = styled.div<{ $columns: number; $gap: string }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: ${({ $gap }) => $gap};
`;

export const StaggeredGrid = ({
  children,
  stagger = 100,
  animation = 'fadeSlide',
  direction = 'up',
  triggerOnScroll = true,
  columns = 3,
  gap = 'var(--spacing-4)',
  className,
}: StaggeredGridProps) => {
  const childArray = Children.toArray(children);

  const { ref, getItemStyle } = useScrollAnimationWithStagger(
    animation,
    direction,
    {
      stagger,
      count: childArray.length,
      triggerOnce: true,
      disabled: !triggerOnScroll,
    }
  );

  const staggeredChildren = useMemo(() => {
    return childArray.map((child, index) => {
      if (!isValidElement(child)) {
        return child;
      }

      const itemStyle = getItemStyle(index);
      const existingStyle = (child.props as { style?: React.CSSProperties })
        .style;

      return cloneElement(child, {
        ...child.props,
        key: child.key ?? index,
        style: {
          ...existingStyle,
          ...itemStyle,
        },
      } as React.HTMLAttributes<HTMLElement>);
    });
  }, [childArray, getItemStyle]);

  return (
    <GridWrapper
      ref={ref as React.Ref<HTMLDivElement>}
      $columns={columns}
      $gap={gap}
      className={className}
    >
      {staggeredChildren}
    </GridWrapper>
  );
};

export default StaggeredList;
