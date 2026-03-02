import type { CustomerStory } from '@/lib/cms/types';

export const customerStories: CustomerStory[] = [
  {
    slug: 'netflix',
    company: 'Netflix',
    logo: { src: '/logos/netflix.svg', alt: 'Netflix' },
    industry: 'Streaming',
    quote:
      "Frame.io has revolutionized our post-production workflow. We've cut our review cycles by 60% and our editors can focus on creativity.",
    author: {
      name: 'Jennifer Walsh',
      title: 'VP of Post-Production',
    },
    stats: [
      { value: '60', suffix: '%', label: 'Faster reviews' },
      { value: '1000', suffix: '+', label: 'Projects yearly' },
      { value: '50', suffix: '+', label: 'Global teams' },
    ],
    meta: {
      title: 'How Netflix Streamlined Global Post-Production',
      description:
        'Learn how Netflix uses Frame.io to coordinate post-production across global teams.',
    },
  },
  {
    slug: 'disney',
    company: 'Disney',
    logo: { src: '/logos/disney.svg', alt: 'Disney' },
    industry: 'Entertainment',
    quote:
      'Managing global production teams is complex. Frame.io gives us the visibility and control we need while keeping creative teams moving fast.',
    author: {
      name: 'Michael Torres',
      title: 'Head of Digital Operations',
    },
    stats: [
      { value: '80', suffix: '%', label: 'Less email' },
      { value: '3', suffix: 'x', label: 'Faster delivery' },
      { value: '99', suffix: '%', label: 'On-time delivery' },
    ],
    meta: {
      title: "Disney's Global Creative Operations with Frame.io",
      description:
        'See how Disney manages creative operations across multiple brands and regions.',
    },
  },
  {
    slug: 'vice-media',
    company: 'Vice Media',
    logo: { src: '/logos/vice.svg', alt: 'Vice Media' },
    industry: 'Media',
    quote:
      'The ability to leave frame-accurate comments has eliminated so much back-and-forth. Our clients love the clarity.',
    author: {
      name: 'Marcus Johnson',
      title: 'Executive Producer',
    },
    stats: [
      { value: '70', suffix: '%', label: 'Fewer revisions' },
      { value: '500', suffix: '+', label: 'Videos monthly' },
      { value: '24', suffix: 'hr', label: 'Avg turnaround' },
    ],
    meta: {
      title: "Vice Media's High-Volume Video Production",
      description:
        'How Vice Media produces hundreds of videos monthly with Frame.io.',
    },
  },
  {
    slug: 'buzzfeed',
    company: 'BuzzFeed',
    logo: { src: '/logos/buzzfeed.svg', alt: 'BuzzFeed' },
    industry: 'Digital Media',
    quote:
      'We manage hundreds of projects simultaneously. Frame.io gives us the organization and security we need at scale.',
    author: {
      name: 'Emily Rodriguez',
      title: 'VP of Creative Operations',
    },
    stats: [
      { value: '200', suffix: '+', label: 'Active projects' },
      { value: '50', suffix: '%', label: 'Time saved' },
      { value: '100', suffix: '%', label: 'Remote ready' },
    ],
    meta: {
      title: "BuzzFeed's Creative Collaboration at Scale",
      description:
        'Learn how BuzzFeed manages hundreds of concurrent video projects.',
    },
  },
  {
    slug: 'red-bull',
    company: 'Red Bull Media House',
    logo: { src: '/logos/redbull.svg', alt: 'Red Bull' },
    industry: 'Sports & Entertainment',
    quote:
      'From extreme sports shoots to documentary features, Frame.io handles everything we throw at it.',
    author: {
      name: 'Anna Schmidt',
      title: 'Head of Post-Production',
    },
    stats: [
      { value: '4', suffix: 'K', label: 'Raw footage daily' },
      { value: '40', suffix: '+', label: 'Countries' },
      { value: '10', suffix: 'x', label: 'Faster ingest' },
    ],
    meta: {
      title: "Red Bull Media House's Global Production Pipeline",
      description:
        'How Red Bull manages extreme sports content from 40+ countries.',
    },
  },
];
