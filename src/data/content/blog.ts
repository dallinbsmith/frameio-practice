import type { BlogPost } from '@/lib/cms/types';

export const blogPosts: BlogPost[] = [
  {
    slug: 'camera-to-cloud-revolution',
    title:
      'The Camera to Cloud Revolution: How Real-Time Workflows are Changing Production',
    excerpt:
      'Explore how Camera to Cloud technology is transforming film and video production by enabling real-time collaboration between set and post.',
    coverImage: {
      src: '/images/blog/camera-to-cloud.jpg',
      alt: 'Camera operator on set with cloud upload visualization',
    },
    author: {
      name: 'Sarah Chen',
    },
    publishedAt: '2026-02-15',
    category: 'Product',
    readTime: 8,
    meta: {
      title: 'The Camera to Cloud Revolution',
      description:
        'How real-time workflows are changing film and video production.',
    },
  },
  {
    slug: 'remote-collaboration-best-practices',
    title: '10 Best Practices for Remote Video Collaboration',
    excerpt:
      'Learn the strategies and tools that top creative teams use to collaborate effectively on video projects from anywhere in the world.',
    coverImage: {
      src: '/images/blog/remote-collaboration.jpg',
      alt: 'Team members collaborating on video via video call',
    },
    author: {
      name: 'Marcus Johnson',
    },
    publishedAt: '2026-02-08',
    category: 'Tips & Tutorials',
    readTime: 6,
    meta: {
      title: '10 Best Practices for Remote Video Collaboration',
      description: 'Strategies for effective remote video collaboration.',
    },
  },
  {
    slug: 'frame-accurate-feedback-guide',
    title: 'The Complete Guide to Frame-Accurate Feedback',
    excerpt:
      'Master the art of giving precise, actionable feedback on video content with our comprehensive guide to frame-accurate commenting.',
    coverImage: {
      src: '/images/blog/frame-accurate.jpg',
      alt: 'Video timeline with frame-accurate comment markers',
    },
    author: {
      name: 'Emily Rodriguez',
    },
    publishedAt: '2026-01-25',
    category: 'Tips & Tutorials',
    readTime: 10,
    meta: {
      title: 'The Complete Guide to Frame-Accurate Feedback',
      description: 'How to give precise, actionable feedback on video content.',
    },
  },
  {
    slug: 'security-compliance-video-production',
    title: 'Security and Compliance in Modern Video Production',
    excerpt:
      'Understanding the security requirements for professional video production and how to protect your content throughout the creative process.',
    coverImage: {
      src: '/images/blog/security.jpg',
      alt: 'Secure video production workflow diagram',
    },
    author: {
      name: 'David Kim',
    },
    publishedAt: '2026-01-18',
    category: 'Security',
    readTime: 7,
    meta: {
      title: 'Security and Compliance in Video Production',
      description:
        'Understanding security requirements for professional video production.',
    },
  },
  {
    slug: 'premiere-pro-workflow-optimization',
    title: 'Optimizing Your Premiere Pro Workflow with Frame.io',
    excerpt:
      'Step-by-step guide to setting up the perfect Frame.io and Premiere Pro workflow for maximum efficiency.',
    coverImage: {
      src: '/images/blog/premiere-workflow.jpg',
      alt: 'Premiere Pro interface with Frame.io panel',
    },
    author: {
      name: 'Anna Schmidt',
    },
    publishedAt: '2026-01-10',
    category: 'Tips & Tutorials',
    readTime: 12,
    meta: {
      title: 'Optimizing Your Premiere Pro Workflow',
      description: 'Set up the perfect Frame.io and Premiere Pro workflow.',
    },
  },
  {
    slug: 'future-of-video-collaboration',
    title: 'The Future of Video Collaboration: Trends to Watch in 2026',
    excerpt:
      'From AI-powered review to virtual production, explore the emerging trends that will shape video collaboration in the coming years.',
    coverImage: {
      src: '/images/blog/future-collaboration.jpg',
      alt: 'Futuristic video collaboration interface concept',
    },
    author: {
      name: 'Jennifer Walsh',
    },
    publishedAt: '2026-01-03',
    category: 'Industry',
    readTime: 9,
    meta: {
      title: 'The Future of Video Collaboration',
      description: 'Trends shaping video collaboration in 2026 and beyond.',
    },
  },
];
