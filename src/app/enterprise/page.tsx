import { SectionRenderer } from '@/components/sections';
import { enterprisePage } from '@/data/content/pages/enterprise';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: enterprisePage.meta.title,
  description: enterprisePage.meta.description ?? null,
};

const EnterprisePage = () => {
  return <SectionRenderer sections={enterprisePage.sections} />;
};

export default EnterprisePage;
