import { SectionRenderer } from '@/components/sections';
import { homepage } from '@/data/content/pages/homepage';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: homepage.meta.title,
  description: homepage.meta.description ?? null,
};

const HomePage = () => {
  return <SectionRenderer sections={homepage.sections} />;
};

export default HomePage;
