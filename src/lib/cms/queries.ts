import { cms } from './client';

import type {
  BlogPost,
  CustomerStory,
  Integration,
  Page,
  PageSection,
} from './types';

export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  return cms.getPage(slug);
};

export const getPageSections = async (
  slug: string
): Promise<PageSection[] | null> => {
  const page = await cms.getPage(slug);
  return page?.sections ?? null;
};

export const getFeaturedCustomerStories = async (
  limit = 3
): Promise<CustomerStory[]> => {
  const stories = await cms.getCustomerStories();
  return stories.slice(0, limit);
};

export const getCustomerStoriesByIndustry = async (
  industry: string
): Promise<CustomerStory[]> => {
  const stories = await cms.getCustomerStories();
  return stories.filter((story) => story.industry === industry);
};

export const getFeaturedIntegrations = async (
  limit = 6
): Promise<Integration[]> => {
  const integrations = await cms.getIntegrations();
  return integrations.slice(0, limit);
};

export const getIntegrationCategories = async (): Promise<string[]> => {
  const integrations = await cms.getIntegrations();
  const categories = new Set(integrations.map((i) => i.category));
  return Array.from(categories).sort();
};

export const getRecentBlogPosts = async (limit = 3): Promise<BlogPost[]> => {
  return cms.getBlogPosts(limit);
};

export const getBlogCategories = async (): Promise<string[]> => {
  const posts = await cms.getBlogPosts();
  const categories = new Set(posts.map((p) => p.category));
  return Array.from(categories).sort();
};

export const getRelatedBlogPosts = async (
  currentSlug: string,
  limit = 3
): Promise<BlogPost[]> => {
  const currentPost = await cms.getBlogPost(currentSlug);
  if (!currentPost) return [];

  const posts = await cms.getBlogPostsByCategory(currentPost.category);
  return posts.filter((p) => p.slug !== currentSlug).slice(0, limit);
};
