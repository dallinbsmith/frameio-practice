import { SectionRenderer } from '@/components/sections';
import { resourcesPage } from '@/data/content/pages/resources';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: resourcesPage.meta.title,
  description: resourcesPage.meta.description ?? null,
};

const ResourcesPage = () => {
  return <SectionRenderer sections={resourcesPage.sections} />;
};

export default ResourcesPage;
