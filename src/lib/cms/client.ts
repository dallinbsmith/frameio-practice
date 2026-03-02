import { blogPosts } from '@/data/content/blog';
import { customerStories } from '@/data/content/customers';
import { integrations } from '@/data/content/integrations';
import { contactPage } from '@/data/content/pages/contact';
import { customersPage } from '@/data/content/pages/customers';
import { enterprisePage } from '@/data/content/pages/enterprise';
import { homepage } from '@/data/content/pages/homepage';
import { integrationsPage } from '@/data/content/pages/integrations';
import { pricingPage } from '@/data/content/pages/pricing';
import { resourcesPage } from '@/data/content/pages/resources';
import { siteSettings } from '@/data/content/settings';

import type {
  BlogPost,
  CustomerStory,
  Integration,
  Page,
  SiteSettings,
} from './types';

const pages: Record<string, Page> = {
  '/': homepage,
  '/pricing': pricingPage,
  '/customers': customersPage,
  '/integrations': integrationsPage,
  '/enterprise': enterprisePage,
  '/resources': resourcesPage,
  '/contact': contactPage,
};

export const cms = {
  getPage: async (slug: string): Promise<Page | null> => {
    await simulateDelay();
    return pages[slug] ?? null;
  },

  getAllPages: async (): Promise<Page[]> => {
    await simulateDelay();
    return Object.values(pages);
  },

  getCustomerStories: async (): Promise<CustomerStory[]> => {
    await simulateDelay();
    return customerStories;
  },

  getCustomerStory: async (slug: string): Promise<CustomerStory | null> => {
    await simulateDelay();
    return customerStories.find((story) => story.slug === slug) ?? null;
  },

  getIntegrations: async (): Promise<Integration[]> => {
    await simulateDelay();
    return integrations;
  },

  getIntegration: async (slug: string): Promise<Integration | null> => {
    await simulateDelay();
    return (
      integrations.find((integration) => integration.slug === slug) ?? null
    );
  },

  getIntegrationsByCategory: async (
    category: string
  ): Promise<Integration[]> => {
    await simulateDelay();
    return integrations.filter(
      (integration) => integration.category === category
    );
  },

  getBlogPosts: async (limit?: number): Promise<BlogPost[]> => {
    await simulateDelay();
    const sorted = [...blogPosts].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  },

  getBlogPost: async (slug: string): Promise<BlogPost | null> => {
    await simulateDelay();
    return blogPosts.find((post) => post.slug === slug) ?? null;
  },

  getBlogPostsByCategory: async (category: string): Promise<BlogPost[]> => {
    await simulateDelay();
    return blogPosts.filter((post) => post.category === category);
  },

  getSiteSettings: async (): Promise<SiteSettings> => {
    await simulateDelay();
    return siteSettings;
  },
};

const simulateDelay = async (): Promise<void> => {
  if (process.env['NODE_ENV'] === 'development') {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

export type CMSClient = typeof cms;
