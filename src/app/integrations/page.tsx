import { SectionRenderer } from '@/components/sections';
import { integrationsPage } from '@/data/content/pages/integrations';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: integrationsPage.meta.title,
  description: integrationsPage.meta.description ?? null,
};

const IntegrationsPage = () => {
  return <SectionRenderer sections={integrationsPage.sections} />;
};

export default IntegrationsPage;
