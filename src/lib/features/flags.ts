import type { FeatureFlag } from './types';

export const defaultFlags: Record<string, FeatureFlag> = {
  darkMode: {
    key: 'darkMode',
    enabled: true,
    description: 'Enable dark mode toggle in header',
  },
  newPricingPage: {
    key: 'newPricingPage',
    enabled: false,
    description: 'New pricing page design',
    percentage: 50,
  },
  analyticsV2: {
    key: 'analyticsV2',
    enabled: true,
    description: 'Enhanced analytics tracking',
  },
  contactFormV2: {
    key: 'contactFormV2',
    enabled: false,
    description: 'New contact form with file upload',
    enabledFor: ['internal-users'],
  },
  videoTranscription: {
    key: 'videoTranscription',
    enabled: false,
    description: 'AI-powered video transcription feature',
    percentage: 10,
  },
  collaborativeComments: {
    key: 'collaborativeComments',
    enabled: true,
    description: 'Real-time collaborative commenting',
  },
  betaFeatures: {
    key: 'betaFeatures',
    enabled: false,
    description: 'Access to beta features',
    enabledFor: ['beta-testers'],
  },
};
