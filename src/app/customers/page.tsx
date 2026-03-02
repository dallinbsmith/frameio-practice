import { SectionRenderer } from '@/components/sections';
import { customersPage } from '@/data/content/pages/customers';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: customersPage.meta.title,
  description: customersPage.meta.description ?? null,
};

const CustomersPage = () => {
  return <SectionRenderer sections={customersPage.sections} />;
};

export default CustomersPage;
