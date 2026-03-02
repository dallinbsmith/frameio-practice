import type { Page } from '@/lib/cms/types';

export const resourcesPage: Page = {
  slug: '/resources',
  meta: {
    title: 'Resources',
    description:
      'Learn how to get the most out of Frame.io with guides, webinars, case studies, and more.',
  },
  sections: [
    {
      type: 'hero',
      content: {
        eyebrow: 'Resources',
        title: 'Learn, grow, and master your workflow',
        subtitle:
          'Everything you need to become a Frame.io power user and transform your creative process.',
      },
    },
    {
      type: 'features',
      content: {
        title: 'Explore our resources',
        layout: 'grid',
        items: [
          {
            icon: 'book',
            title: 'Help Center',
            description:
              'Comprehensive guides and tutorials to help you get started and master every feature.',
            link: { label: 'Browse articles', href: '/help' },
          },
          {
            icon: 'video',
            title: 'Webinars',
            description:
              'Live and on-demand sessions with product experts and industry professionals.',
            link: { label: 'Watch webinars', href: '/webinars' },
          },
          {
            icon: 'document',
            title: 'Case Studies',
            description:
              'See how leading teams use Frame.io to transform their workflows.',
            link: { label: 'Read stories', href: '/customers' },
          },
          {
            icon: 'blog',
            title: 'Blog',
            description:
              'Insights, tips, and news from the Frame.io team and creative community.',
            link: { label: 'Read blog', href: '/blog' },
          },
          {
            icon: 'code',
            title: 'API Documentation',
            description:
              'Build custom integrations with our comprehensive developer resources.',
            link: { label: 'View docs', href: '/developers' },
          },
          {
            icon: 'community',
            title: 'Community',
            description:
              'Connect with other Frame.io users, share tips, and get answers.',
            link: { label: 'Join community', href: '/community' },
          },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        variant: 'default',
        title: 'Need personalized help?',
        subtitle: 'Our team is here to help you succeed with Frame.io.',
        primaryCTA: {
          label: 'Contact Support',
          href: '/contact?type=support',
          variant: 'primary',
        },
      },
    },
  ],
};
