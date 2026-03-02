import { SectionRenderer } from '@/components/sections';
import { pricingPage } from '@/data/content/pages/pricing';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: pricingPage.meta.title,
  description: pricingPage.meta.description ?? null,
};

const PricingPage = () => {
  return <SectionRenderer sections={pricingPage.sections} />;
};

export default PricingPage;
