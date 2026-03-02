'use client';

import { Children, isValidElement, useMemo } from 'react';
import styled from 'styled-components';

import { useParallax, useParallaxLayers } from '@/lib/animation/useParallax';

import type { ParallaxContainerProps } from '@/lib/animation/types';

const ParallaxWrapper = styled.div`
  will-change: transform;
`;

export const ParallaxContainer = ({
  children,
  speed = 0.5,
  direction = 'vertical',
  className,
}: ParallaxContainerProps) => {
  const { ref, style } = useParallax({ speed, direction });

  return (
    <ParallaxWrapper ref={ref} className={className} style={style}>
      {children}
    </ParallaxWrapper>
  );
};

export type ParallaxSectionProps = {
  children: React.ReactNode;
  layers: number[];
  className?: string;
};

const SectionWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

const LayerWrapper = styled.div`
  will-change: transform;
`;

export const ParallaxSection = ({
  children,
  layers,
  className,
}: ParallaxSectionProps) => {
  const { containerRef, getLayerStyle } = useParallaxLayers({ layers });
  const childArray = Children.toArray(children);

  const layeredChildren = useMemo(() => {
    return childArray.map((child, index) => {
      if (!isValidElement(child)) {
        return child;
      }

      const layerStyle = getLayerStyle(index);
      const existingStyle = (child.props as { style?: React.CSSProperties })
        .style;

      return (
        <LayerWrapper
          key={child.key ?? index}
          style={{
            ...existingStyle,
            ...layerStyle,
          }}
        >
          {child}
        </LayerWrapper>
      );
    });
  }, [childArray, getLayerStyle]);

  return (
    <SectionWrapper ref={containerRef} className={className}>
      {layeredChildren}
    </SectionWrapper>
  );
};

export type ParallaxImageProps = {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
};

const ImageWrapper = styled.div`
  overflow: hidden;
  position: relative;
`;

const ParallaxImg = styled.img`
  display: block;
  width: 100%;
  height: 120%;
  object-fit: cover;
  will-change: transform;
`;

export const ParallaxImage = ({
  src,
  alt,
  speed = 0.3,
  className,
  style,
}: ParallaxImageProps) => {
  const { ref, style: parallaxStyle } = useParallax({ speed });

  return (
    <ImageWrapper className={className} style={style}>
      <ParallaxImg
        ref={ref as React.Ref<HTMLImageElement>}
        src={src}
        alt={alt}
        style={parallaxStyle}
      />
    </ImageWrapper>
  );
};

export default ParallaxContainer;
