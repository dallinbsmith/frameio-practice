import type { Page } from '@/lib/cms/types';

export const enterprisePage: Page = {
  slug: '/enterprise',
  meta: {
    title: 'Enterprise',
    description:
      'Enterprise-grade video collaboration for large organizations. SSO, advanced security, dedicated support, and custom solutions.',
  },
  sections: [
    {
      type: 'hero',
      content: {
        eyebrow: 'Frame.io Enterprise',
        title: "Built for the world's largest creative teams",
        subtitle:
          'Enterprise-grade security, unlimited scale, and dedicated support for organizations that demand the best.',
        primaryCTA: {
          label: 'Contact Sales',
          href: '/contact?source=enterprise',
          variant: 'primary',
        },
        secondaryCTA: {
          label: 'View Security',
          href: '/security',
          variant: 'outline',
        },
      },
    },
    {
      type: 'logoCloud',
      content: {
        title: 'Trusted by industry leaders',
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
        ],
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'Security & Compliance',
        title: 'Enterprise-grade protection',
        subtitle:
          "Your content is protected by the industry's most advanced security measures.",
        layout: 'grid',
        items: [
          {
            icon: 'shield',
            title: 'SOC 2 Type II Certified',
            description:
              'Annual audits verify our security controls meet the highest standards.',
          },
          {
            icon: 'lock',
            title: 'End-to-End Encryption',
            description:
              'AES-256 encryption at rest and TLS 1.3 in transit. Your content is always protected.',
          },
          {
            icon: 'key',
            title: 'SSO / SAML',
            description:
              'Integrate with your identity provider. Support for Okta, Azure AD, OneLogin, and more.',
          },
          {
            icon: 'eye',
            title: 'Advanced Access Controls',
            description:
              'Granular permissions, watermarking, and audit logs for complete control.',
          },
          {
            icon: 'globe',
            title: 'Data Residency',
            description:
              'Choose where your data is stored to meet regional compliance requirements.',
          },
          {
            icon: 'compliance',
            title: 'GDPR & CCPA Ready',
            description:
              'Built-in tools for data privacy compliance and user data management.',
          },
        ],
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'Scale',
        title: 'Unlimited possibilities',
        subtitle: 'No limits on what you can achieve.',
        layout: 'list',
        items: [
          {
            icon: 'storage',
            title: 'Unlimited storage',
            description:
              'Never worry about running out of space. Store everything you need.',
          },
          {
            icon: 'users',
            title: 'Unlimited users',
            description: 'Add your entire organization. No per-seat surprises.',
          },
          {
            icon: 'speed',
            title: 'Accelerated transfers',
            description:
              'Our network is optimized for large files. Upload and download at maximum speed.',
          },
        ],
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'Support',
        title: 'White-glove service',
        subtitle: "You're never alone with Frame.io Enterprise.",
        layout: 'grid',
        items: [
          {
            icon: 'person',
            title: 'Dedicated Success Manager',
            description:
              'A single point of contact who knows your workflow and goals.',
          },
          {
            icon: 'clock',
            title: '24/7 Priority Support',
            description: 'Round-the-clock access to our expert support team.',
          },
          {
            icon: 'training',
            title: 'Custom Training',
            description:
              'Onboarding and ongoing training tailored to your team.',
          },
          {
            icon: 'sla',
            title: '99.9% Uptime SLA',
            description: 'Guaranteed availability with financial backing.',
          },
        ],
      },
    },
    {
      type: 'testimonials',
      content: {
        title: 'Enterprise success stories',
        items: [
          {
            quote:
              'Frame.io Enterprise gave us the security and scale we needed to bring our global post-production teams onto a single platform.',
            author: {
              name: 'James Mitchell',
              title: 'CTO',
              company: 'Major Studio',
            },
          },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        variant: 'brand',
        title: 'Ready to scale your creative operations?',
        subtitle: 'Talk to our enterprise team about your specific needs.',
        primaryCTA: {
          label: 'Schedule a Demo',
          href: '/contact?source=enterprise-demo',
          variant: 'primary',
        },
        secondaryCTA: {
          label: 'Download Security Whitepaper',
          href: '/resources/security-whitepaper',
          variant: 'outline',
        },
      },
    },
  ],
};
