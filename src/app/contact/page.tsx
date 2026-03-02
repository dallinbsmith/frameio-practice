import { SectionRenderer } from '@/components/sections';
import { contactPage } from '@/data/content/pages/contact';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: contactPage.meta.title,
  description: contactPage.meta.description ?? null,
};

const ContactPage = () => {
  return <SectionRenderer sections={contactPage.sections} />;
};

export default ContactPage;
