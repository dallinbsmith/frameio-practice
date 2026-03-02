import type { Page } from '@/lib/cms/types';

export const homepage: Page = {
  slug: '/',
  meta: {
    title: 'Frame.io | Video Review & Collaboration Platform',
    description:
      "The world's leading video review and collaboration platform. Streamline your creative workflow with cloud-native tools trusted by industry professionals.",
  },
  sections: [
    {
      type: 'hero',
      content: {
        eyebrow: 'Now Part of Adobe',
        title: 'Video collaboration, elevated',
        subtitle:
          'Frame.io is the industry-standard video review and collaboration platform that empowers creative teams to work together seamlessly from anywhere.',
        primaryCTA: {
          label: 'Start Free Trial',
          href: '/signup',
          variant: 'primary',
        },
        secondaryCTA: {
          label: 'Watch Demo',
          href: '/demo',
          variant: 'outline',
        },
        media: {
          type: 'image',
          src: '/images/hero-dashboard.png',
          alt: 'Frame.io dashboard showing video review interface',
        },
      },
    },
    {
      type: 'logoCloud',
      content: {
        title: "Trusted by the world's most creative teams",
        logos: [
          {
            name: 'Netflix',
            logo: { src: '/logos/netflix.svg', alt: 'Netflix' },
          },
          {
            name: 'Disney',
            logo: { src: '/logos/disney.svg', alt: 'Disney' },
          },
          {
            name: 'Warner Bros',
            logo: { src: '/logos/warner-bros.svg', alt: 'Warner Bros' },
          },
          {
            name: 'BBC',
            logo: { src: '/logos/bbc.svg', alt: 'BBC' },
          },
          {
            name: 'Vice',
            logo: { src: '/logos/vice.svg', alt: 'Vice' },
          },
          {
            name: 'BuzzFeed',
            logo: { src: '/logos/buzzfeed.svg', alt: 'BuzzFeed' },
          },
        ],
      },
    },
    {
      type: 'metrics',
      content: {
        title: 'Proven results at scale',
        subtitle:
          'Join thousands of teams who have transformed their video workflow',
        items: [
          { value: '50', suffix: '%', label: 'Faster review cycles' },
          { value: '1', suffix: 'M+', label: 'Projects completed' },
          { value: '190', suffix: '+', label: 'Countries worldwide' },
          { value: '99.9', suffix: '%', label: 'Uptime SLA' },
        ],
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'Features',
        title: 'Everything you need for seamless collaboration',
        subtitle:
          'Powerful tools designed for professional video workflows, from review to delivery.',
        layout: 'grid',
        items: [
          {
            icon: 'comment',
            title: 'Frame-accurate Comments',
            description:
              'Leave time-stamped feedback directly on the video timeline. Every comment links to the exact frame for precise communication.',
          },
          {
            icon: 'upload',
            title: 'Lightning Fast Upload',
            description:
              'Upload large video files in seconds with our accelerated transfer technology. No more waiting around for files.',
          },
          {
            icon: 'shield',
            title: 'Enterprise Security',
            description:
              'Bank-grade encryption, SOC 2 Type II certified, and advanced access controls keep your content secure.',
          },
          {
            icon: 'integration',
            title: 'Deep Integrations',
            description:
              'Connect with Adobe Premiere Pro, After Effects, DaVinci Resolve, and your favorite tools for seamless workflows.',
          },
          {
            icon: 'version',
            title: 'Version Management',
            description:
              'Track every iteration with automatic version stacking. Compare versions side-by-side with a single click.',
          },
          {
            icon: 'share',
            title: 'Secure Sharing',
            description:
              'Share review links with clients and stakeholders. Control access with passwords, expiration dates, and download permissions.',
          },
        ],
      },
    },
    {
      type: 'testimonials',
      content: {
        title: 'Loved by creative teams worldwide',
        subtitle:
          'See why industry leaders choose Frame.io for their video workflows',
        items: [
          {
            quote:
              'Frame.io has completely transformed how we collaborate on video projects. What used to take weeks now takes days.',
            author: {
              name: 'Sarah Chen',
              title: 'Head of Post-Production',
              company: 'Netflix',
            },
          },
          {
            quote:
              'The ability to leave frame-accurate comments has eliminated so much back-and-forth. Our clients love the clarity.',
            author: {
              name: 'Marcus Johnson',
              title: 'Executive Producer',
              company: 'Vice Media',
            },
          },
          {
            quote:
              'We manage hundreds of projects simultaneously. Frame.io gives us the organization and security we need at scale.',
            author: {
              name: 'Emily Rodriguez',
              title: 'VP of Creative Operations',
              company: 'BuzzFeed',
            },
          },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        variant: 'brand',
        title: 'Ready to transform your video workflow?',
        subtitle:
          'Join over 1 million creatives using Frame.io to collaborate smarter.',
        primaryCTA: {
          label: 'Start Free Trial',
          href: '/signup',
          variant: 'primary',
        },
        secondaryCTA: {
          label: 'Contact Sales',
          href: '/contact',
          variant: 'outline',
        },
      },
    },
  ],
};
