'use client';

import { CTA } from './CTA';
import { FAQ } from './FAQ';
import { Features } from './Features';
import { Hero } from './Hero';
import { LogoCloud } from './LogoCloud';
import { Metrics } from './Metrics';
import { Pricing } from './Pricing';
import { Testimonials } from './Testimonials';

import type { PageSection } from '@/lib/cms/types';

type SectionRendererProps = {
  sections: PageSection[];
};

export const SectionRenderer = ({ sections }: SectionRendererProps) => {
  return (
    <>
      {sections.map((section, index) => {
        const key = `${section.type}-${index}`;

        switch (section.type) {
          case 'hero':
            return <Hero key={key} {...section.content} />;

          case 'metrics':
            return <Metrics key={key} {...section.content} />;

          case 'features':
            return <Features key={key} {...section.content} />;

          case 'cta':
            return <CTA key={key} {...section.content} />;

          case 'testimonials':
            return <Testimonials key={key} {...section.content} />;

          case 'logoCloud':
            return <LogoCloud key={key} {...section.content} />;

          case 'pricing':
            return <Pricing key={key} {...section.content} />;

          case 'faq':
            return <FAQ key={key} {...section.content} />;

          default:
            return null;
        }
      })}
    </>
  );
};

export default SectionRenderer;
