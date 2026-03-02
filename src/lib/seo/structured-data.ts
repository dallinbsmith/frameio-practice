type OrganizationSchema = {
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
};

type WebsiteSchema = {
  name: string;
  url: string;
  description: string;
};

type ProductSchema = {
  name: string;
  description: string;
  url: string;
  brand: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
};

type FAQSchema = {
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

type BreadcrumbSchema = {
  items: Array<{
    name: string;
    url: string;
  }>;
};

export const generateOrganizationSchema = ({
  name,
  description,
  url,
  logo,
  sameAs,
}: OrganizationSchema): string => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    ...(logo && { logo }),
    ...(sameAs && { sameAs }),
  };

  return JSON.stringify(schema);
};

export const generateWebsiteSchema = ({
  name,
  url,
  description,
}: WebsiteSchema): string => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(schema);
};

export const generateProductSchema = ({
  name,
  description,
  url,
  brand,
  offers,
}: ProductSchema): string => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
      },
    }),
  };

  return JSON.stringify(schema);
};

export const generateFAQSchema = ({ questions }: FAQSchema): string => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  return JSON.stringify(schema);
};

export const generateBreadcrumbSchema = ({
  items,
}: BreadcrumbSchema): string => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(schema);
};
