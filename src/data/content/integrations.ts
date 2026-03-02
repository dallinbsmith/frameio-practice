import type { Integration } from '@/lib/cms/types';

export const integrations: Integration[] = [
  {
    slug: 'premiere-pro',
    name: 'Adobe Premiere Pro',
    logo: { src: '/logos/integrations/premiere.svg', alt: 'Premiere Pro' },
    category: 'Editing',
    description:
      'Upload, review, and sync comments directly within Premiere Pro. Native panel integration keeps you in your editing flow.',
    features: [
      'Native panel integration',
      'Upload from timeline',
      'Sync comments as markers',
      'Version comparison',
      'Auto-conform sequences',
    ],
  },
  {
    slug: 'after-effects',
    name: 'Adobe After Effects',
    logo: {
      src: '/logos/integrations/after-effects.svg',
      alt: 'After Effects',
    },
    category: 'Editing',
    description:
      'Share compositions instantly and receive frame-accurate feedback on your motion graphics and visual effects.',
    features: [
      'Direct composition upload',
      'Frame-accurate comments',
      'Render queue integration',
      'Version tracking',
    ],
  },
  {
    slug: 'davinci-resolve',
    name: 'DaVinci Resolve',
    logo: { src: '/logos/integrations/resolve.svg', alt: 'DaVinci Resolve' },
    category: 'Editing',
    description:
      'Upload directly from the color page and sync comments as markers on your timeline for seamless color grading workflows.',
    features: [
      'Color page integration',
      'Timeline marker sync',
      'Render and upload',
      'Version management',
    ],
  },
  {
    slug: 'avid-media-composer',
    name: 'Avid Media Composer',
    logo: { src: '/logos/integrations/avid.svg', alt: 'Avid' },
    category: 'Editing',
    description:
      "Enterprise-grade integration for broadcast and film workflows with Avid's industry-standard editing platform.",
    features: [
      'Bin integration',
      'Marker sync',
      'AAF round-trip',
      'Media management',
    ],
  },
  {
    slug: 'final-cut-pro',
    name: 'Final Cut Pro',
    logo: { src: '/logos/integrations/finalcut.svg', alt: 'Final Cut Pro' },
    category: 'Editing',
    description:
      'Share directly from Final Cut Pro using our companion app for seamless uploads and review.',
    features: [
      'Share extension',
      'Browser integration',
      'XML round-trip',
      'Keyword sync',
    ],
  },
  {
    slug: 'slack',
    name: 'Slack',
    logo: { src: '/logos/integrations/slack.svg', alt: 'Slack' },
    category: 'Communication',
    description:
      "Get notified about comments, uploads, and approvals directly in your team's Slack channels.",
    features: [
      'Real-time notifications',
      'Channel integration',
      'Threaded comments',
      'Direct message alerts',
    ],
  },
  {
    slug: 'microsoft-teams',
    name: 'Microsoft Teams',
    logo: { src: '/logos/integrations/teams.svg', alt: 'Microsoft Teams' },
    category: 'Communication',
    description:
      'Collaborate on video reviews directly within Microsoft Teams for enterprise workflows.',
    features: [
      'Teams app integration',
      'Meeting integration',
      'Channel notifications',
      'SSO support',
    ],
  },
  {
    slug: 'dropbox',
    name: 'Dropbox',
    logo: { src: '/logos/integrations/dropbox.svg', alt: 'Dropbox' },
    category: 'Storage',
    description:
      'Sync your Frame.io projects with Dropbox for backup and extended storage.',
    features: [
      'Two-way sync',
      'Automatic backup',
      'Folder mapping',
      'Selective sync',
    ],
  },
  {
    slug: 'google-drive',
    name: 'Google Drive',
    logo: { src: '/logos/integrations/google-drive.svg', alt: 'Google Drive' },
    category: 'Storage',
    description:
      'Connect Google Drive to Frame.io for seamless file management and collaboration.',
    features: [
      'Direct import',
      'Export to Drive',
      'Folder sync',
      'Shared drive support',
    ],
  },
  {
    slug: 'zapier',
    name: 'Zapier',
    logo: { src: '/logos/integrations/zapier.svg', alt: 'Zapier' },
    category: 'Automation',
    description:
      'Connect Frame.io to thousands of apps with Zapier automation workflows.',
    features: [
      'Trigger on events',
      'Custom workflows',
      '3000+ app connections',
      'Multi-step automations',
    ],
  },
];
