import type { Page } from '@/lib/cms/types';

export const pricingPage: Page = {
  slug: '/pricing',
  meta: {
    title: 'Pricing',
    description:
      'Simple, transparent pricing for teams of all sizes. Start free and scale as you grow.',
  },
  sections: [
    {
      type: 'hero',
      content: {
        title: 'Simple, transparent pricing',
        subtitle:
          'Choose the plan that fits your team. All plans include a 14-day free trial with no credit card required.',
      },
    },
    {
      type: 'pricing',
      content: {
        tiers: [
          {
            name: 'Free',
            description: 'For individuals getting started',
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: [
              '2GB storage',
              '1 project',
              'Basic commenting',
              'HD playback',
              'Email support',
            ],
            cta: {
              label: 'Get Started',
              href: '/signup?plan=free',
              variant: 'outline',
            },
          },
          {
            name: 'Pro',
            description: 'For freelancers and small teams',
            monthlyPrice: 15,
            yearlyPrice: 144,
            features: [
              '250GB storage',
              'Unlimited projects',
              'Frame-accurate comments',
              '4K playback',
              'Version stacking',
              'Review links',
              'Priority support',
            ],
            cta: {
              label: 'Start Free Trial',
              href: '/signup?plan=pro',
              variant: 'primary',
            },
            highlighted: true,
            badge: 'Most Popular',
          },
          {
            name: 'Team',
            description: 'For growing creative teams',
            monthlyPrice: 25,
            yearlyPrice: 240,
            features: [
              '500GB storage per member',
              'Everything in Pro',
              'Team workspaces',
              'Advanced permissions',
              'Integrations',
              'Analytics dashboard',
              'Dedicated support',
            ],
            cta: {
              label: 'Start Free Trial',
              href: '/signup?plan=team',
              variant: 'outline',
            },
          },
          {
            name: 'Enterprise',
            description: 'For large organizations',
            monthlyPrice: null,
            yearlyPrice: null,
            features: [
              'Unlimited storage',
              'Everything in Team',
              'SSO / SAML',
              'Custom integrations',
              'SLA guarantee',
              'Dedicated success manager',
              'Security review',
              'Custom contracts',
            ],
            cta: {
              label: 'Contact Sales',
              href: '/contact?plan=enterprise',
              variant: 'outline',
            },
          },
        ],
      },
    },
    {
      type: 'faq',
      content: {
        title: 'Frequently asked questions',
        subtitle: 'Everything you need to know about our pricing and plans',
        items: [
          {
            question: 'Can I change plans at any time?',
            answer:
              'Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately. When downgrading, the change takes effect at the end of your current billing period.',
          },
          {
            question: 'What happens when I exceed my storage limit?',
            answer:
              "You'll receive a notification when you're approaching your storage limit. You can either upgrade your plan for more storage or archive/delete existing content to make room.",
          },
          {
            question: 'Do you offer discounts for annual billing?',
            answer:
              "Yes! When you choose annual billing, you save 20% compared to monthly billing. That's like getting 2+ months free every year.",
          },
          {
            question: 'Is there a free trial for paid plans?',
            answer:
              'Absolutely. All paid plans include a 14-day free trial with full access to all features. No credit card required to start.',
          },
          {
            question: 'What payment methods do you accept?',
            answer:
              'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay via invoice with NET 30 terms.',
          },
          {
            question: 'Can I get a refund?',
            answer:
              "We offer a 30-day money-back guarantee for annual plans. If you're not satisfied within the first 30 days, contact support for a full refund.",
          },
        ],
      },
    },
    {
      type: 'cta',
      content: {
        variant: 'dark',
        title: 'Need help choosing?',
        subtitle:
          'Our team can help you find the perfect plan for your workflow.',
        primaryCTA: {
          label: 'Talk to Sales',
          href: '/contact',
          variant: 'primary',
        },
      },
    },
  ],
};
