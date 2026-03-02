import type { Page } from '@/lib/cms/types';

export const customersPage: Page = {
  slug: '/customers',
  meta: {
    title: 'Customer Stories',
    description:
      'See how leading creative teams use Frame.io to transform their video workflows and deliver exceptional content.',
  },
  sections: [
    {
      type: 'hero',
      content: {
        eyebrow: 'Customer Stories',
        title: "Trusted by the world's best creative teams",
        subtitle:
          'From independent filmmakers to global media companies, see how teams are using Frame.io to transform their workflows.',
      },
    },
    {
      type: 'logoCloud',
      content: {
        title: 'Industry leaders trust Frame.io',
        logos: [
          {
            name: 'Netflix',
            logo: { src: '/logos/netflix.svg', alt: 'Netflix' },
          },
          { name: 'Disney', logo: { src: '/logos/disney.svg', alt: 'Disney' } },
          {
            name: 'Warner Bros',
            logo: { src: '/logos/warner-bros.svg', alt: 'Warner Bros' },
          },
          { name: 'BBC', logo: { src: '/logos/bbc.svg', alt: 'BBC' } },
          {
            name: 'NBC Universal',
            logo: { src: '/logos/nbc.svg', alt: 'NBC Universal' },
          },
          { name: 'Vice', logo: { src: '/logos/vice.svg', alt: 'Vice' } },
          {
            name: 'BuzzFeed',
            logo: { src: '/logos/buzzfeed.svg', alt: 'BuzzFeed' },
          },
          {
            name: 'Red Bull',
            logo: { src: '/logos/redbull.svg', alt: 'Red Bull' },
          },
        ],
      },
    },
    {
      type: 'testimonials',
      content: {
        title: 'What our customers say',
        items: [
          {
            quote:
              "Frame.io has revolutionized our post-production workflow. We've cut our review cycles by 60% and our editors can focus on creativity instead of file management.",
            author: {
              name: 'Jennifer Walsh',
              title: 'VP of Post-Production',
              company: 'Netflix',
            },
          },
          {
            quote:
              'Managing global production teams is complex. Frame.io gives us the visibility and control we need while keeping creative teams moving fast.',
            author: {
              name: 'Michael Torres',
              title: 'Head of Digital Operations',
              company: 'Disney+',
            },
          },
          {
            quote:
              'The Camera to Cloud integration changed everything. We can now review footage in real-time from anywhere in the world.',
            author: {
              name: 'David Kim',
              title: 'Executive Producer',
              company: 'Warner Bros',
            },
          },
        ],
      },
    },
    {
      type: 'metrics',
      content: {
        title: 'Results that matter',
        items: [
          { value: '60', suffix: '%', label: 'Faster review cycles' },
          {
            value: '10',
            prefix: '',
            suffix: 'x',
            label: 'Faster file transfers',
          },
          { value: '80', suffix: '%', label: 'Less email' },
          { value: '100', suffix: '%', label: 'Team visibility' },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        variant: 'brand',
        title: "Join the world's leading creative teams",
        subtitle: 'See why over 1 million professionals trust Frame.io.',
        primaryCTA: {
          label: 'Start Free Trial',
          href: '/signup',
          variant: 'primary',
        },
        secondaryCTA: {
          label: 'View All Stories',
          href: '/customers/all',
          variant: 'outline',
        },
      },
    },
  ],
};
