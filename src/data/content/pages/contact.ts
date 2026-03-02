import type { Page } from '@/lib/cms/types';

export const contactPage: Page = {
  slug: '/contact',
  meta: {
    title: 'Contact Sales',
    description:
      'Get in touch with our sales team to learn how Frame.io can transform your creative workflow.',
  },
  sections: [
    {
      type: 'hero',
      content: {
        title: "Let's talk about your workflow",
        subtitle:
          "Whether you're a freelancer, agency, or enterprise team, we're here to help you find the right solution.",
      },
    },
    {
      type: 'features',
      content: {
        title: 'How can we help?',
        layout: 'grid',
        items: [
          {
            icon: 'sales',
            title: 'Sales',
            description:
              'Learn about our plans and get a personalized demo for your team.',
            link: { label: 'Contact sales', href: '/contact?type=sales' },
          },
          {
            icon: 'support',
            title: 'Support',
            description:
              'Get help with your account, billing, or technical questions.',
            link: { label: 'Get support', href: '/help' },
          },
          {
            icon: 'partnership',
            title: 'Partnerships',
            description:
              'Explore integration opportunities and strategic partnerships.',
            link: {
              label: 'Partner with us',
              href: '/contact?type=partnerships',
            },
          },
          {
            icon: 'press',
            title: 'Press',
            description: 'Media inquiries, press releases, and brand assets.',
            link: { label: 'Press inquiries', href: '/contact?type=press' },
          },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        variant: 'dark',
        title: 'Ready to get started?',
        subtitle: 'Try Frame.io free for 14 days. No credit card required.',
        primaryCTA: {
          label: 'Start Free Trial',
          href: '/signup',
          variant: 'primary',
        },
      },
    },
  ],
};
