export type Image = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Link = {
  label: string;
  href: string;
  external?: boolean;
};

export type CTA = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
};

export type HeroContent = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCTA?: CTA;
  secondaryCTA?: CTA;
  media?: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
    poster?: string;
  };
};

export type MetricItem = {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
};

export type MetricsContent = {
  title?: string;
  subtitle?: string;
  items: MetricItem[];
};

export type FeatureItem = {
  icon?: string;
  title: string;
  description: string;
  link?: Link;
};

export type FeaturesContent = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: FeatureItem[];
  layout?: 'grid' | 'list';
};

export type CTAContent = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCTA?: CTA;
  secondaryCTA?: CTA;
  variant?: 'default' | 'brand' | 'dark';
};

export type TestimonialItem = {
  quote: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: Image;
  };
  logo?: Image;
};

export type TestimonialsContent = {
  title?: string;
  subtitle?: string;
  items: TestimonialItem[];
};

export type LogoItem = {
  name: string;
  logo: Image;
  href?: string;
};

export type LogoCloudContent = {
  title?: string;
  logos: LogoItem[];
};

export type PricingTier = {
  name: string;
  description?: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
  cta: CTA;
  highlighted?: boolean;
  badge?: string;
};

export type PricingContent = {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQContent = {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
};

export type PageSection =
  | { type: 'hero'; content: HeroContent }
  | { type: 'metrics'; content: MetricsContent }
  | { type: 'features'; content: FeaturesContent }
  | { type: 'cta'; content: CTAContent }
  | { type: 'testimonials'; content: TestimonialsContent }
  | { type: 'logoCloud'; content: LogoCloudContent }
  | { type: 'pricing'; content: PricingContent }
  | { type: 'faq'; content: FAQContent };

export type PageMeta = {
  title: string;
  description?: string;
  ogImage?: Image;
  noIndex?: boolean;
};

export type Page = {
  slug: string;
  meta: PageMeta;
  sections: PageSection[];
};

export type CustomerStory = {
  slug: string;
  company: string;
  logo: Image;
  industry: string;
  quote: string;
  author: {
    name: string;
    title: string;
    avatar?: Image;
  };
  stats?: MetricItem[];
  content?: string;
  meta: PageMeta;
};

export type Integration = {
  slug: string;
  name: string;
  logo: Image;
  category: string;
  description: string;
  features?: string[];
  href?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: Image;
  author: {
    name: string;
    avatar?: Image;
  };
  publishedAt: string;
  category: string;
  readTime?: number;
  content?: string;
  meta: PageMeta;
};

export type NavigationItem = {
  label: string;
  href: string;
  children?: NavigationItem[];
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  navigation: NavigationItem[];
  footerLinks: Record<string, { title: string; links: Link[] }>;
  socialLinks: Link[];
};
