import type { SiteSettings } from '@/lib/cms/types';

export const siteSettings: SiteSettings = {
  siteName: 'Frame.io',
  tagline: 'Video collaboration, elevated',
  navigation: [
    { label: 'Product', href: '/product' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Customers', href: '/customers' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Enterprise', href: '/enterprise' },
    { label: 'Resources', href: '/resources' },
  ],
  footerLinks: {
    product: {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Camera to Cloud', href: '/c2c' },
        { label: 'Pricing', href: '/pricing' },
        { label: "What's New", href: '/changelog' },
      ],
    },
    solutions: {
      title: 'Solutions',
      links: [
        { label: 'Enterprise', href: '/enterprise' },
        { label: 'Agencies', href: '/agencies' },
        { label: 'Brands', href: '/brands' },
        { label: 'Media & Entertainment', href: '/media' },
      ],
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Help Center', href: '/help' },
        { label: 'Webinars', href: '/webinars' },
        { label: 'Case Studies', href: '/customers' },
        { label: 'API Docs', href: '/developers' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Security', href: '/security' },
      ],
    },
  },
  socialLinks: [
    { label: 'Twitter', href: 'https://twitter.com/frameio', external: true },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/company/frameio',
      external: true,
    },
    { label: 'YouTube', href: 'https://youtube.com/frameio', external: true },
    {
      label: 'Instagram',
      href: 'https://instagram.com/frameio',
      external: true,
    },
  ],
};
