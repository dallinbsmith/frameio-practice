import type { Page } from '@/lib/cms/types';

export const integrationsPage: Page = {
  slug: '/integrations',
  meta: {
    title: 'Integrations',
    description:
      'Connect Frame.io with your favorite creative tools. Deep integrations with Adobe, Avid, DaVinci Resolve, and more.',
  },
  sections: [
    {
      type: 'hero',
      content: {
        eyebrow: 'Integrations',
        title: 'Connect your entire workflow',
        subtitle:
          'Frame.io integrates seamlessly with the tools you already use, creating a unified creative ecosystem.',
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'Native Integrations',
        title: 'Built-in where you work',
        subtitle:
          'Access Frame.io directly within your favorite editing applications.',
        layout: 'grid',
        items: [
          {
            icon: 'premiere',
            title: 'Adobe Premiere Pro',
            description:
              'Upload, review, and sync comments without leaving your timeline. Native panel integration.',
            link: { label: 'Learn more', href: '/integrations/premiere-pro' },
          },
          {
            icon: 'aftereffects',
            title: 'Adobe After Effects',
            description:
              'Share compositions instantly and receive frame-accurate feedback on your motion graphics.',
            link: { label: 'Learn more', href: '/integrations/after-effects' },
          },
          {
            icon: 'resolve',
            title: 'DaVinci Resolve',
            description:
              'Upload directly from the color page and sync comments as markers on your timeline.',
            link: {
              label: 'Learn more',
              href: '/integrations/davinci-resolve',
            },
          },
          {
            icon: 'avid',
            title: 'Avid Media Composer',
            description:
              'Enterprise-grade integration for broadcast and film workflows.',
            link: { label: 'Learn more', href: '/integrations/avid' },
          },
          {
            icon: 'finalcut',
            title: 'Final Cut Pro',
            description:
              'Share directly from the browser or use our companion app for seamless uploads.',
            link: { label: 'Learn more', href: '/integrations/final-cut-pro' },
          },
          {
            icon: 'slack',
            title: 'Slack',
            description:
              'Get notified about comments, uploads, and approvals in your team channels.',
            link: { label: 'Learn more', href: '/integrations/slack' },
          },
        ],
      },
    },
    {
      type: 'features',
      content: {
        eyebrow: 'Camera to Cloud',
        title: 'From set to edit in seconds',
        subtitle:
          'Connect your camera directly to Frame.io for instant dailies and remote collaboration.',
        layout: 'list',
        items: [
          {
            icon: 'camera',
            title: 'Real-time uploads',
            description:
              "As soon as you stop recording, footage begins uploading automatically. Editors can start working while you're still on set.",
          },
          {
            icon: 'globe',
            title: 'Work from anywhere',
            description:
              'Directors, producers, and stakeholders can review footage in real-time, no matter where they are.',
          },
          {
            icon: 'device',
            title: 'Compatible devices',
            description:
              'Works with leading camera manufacturers including RED, Sony, Fujifilm, and more.',
          },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        variant: 'default',
        title: 'Build your own integration',
        subtitle:
          'Use our API to create custom integrations tailored to your workflow.',
        primaryCTA: {
          label: 'View API Docs',
          href: '/developers',
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
