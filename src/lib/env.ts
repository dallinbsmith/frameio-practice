type EnvConfig = {
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_GA_ID?: string | undefined;
  SANITY_PROJECT_ID?: string | undefined;
  SANITY_DATASET?: string | undefined;
};

const getEnv = (): EnvConfig => {
  return {
    NEXT_PUBLIC_SITE_URL:
      process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
    NEXT_PUBLIC_GA_ID: process.env['NEXT_PUBLIC_GA_ID'],
    SANITY_PROJECT_ID: process.env['SANITY_PROJECT_ID'],
    SANITY_DATASET: process.env['SANITY_DATASET'],
  };
};

export const env = getEnv();

export const validateEnv = () => {
  const required: (keyof EnvConfig)[] = ['NEXT_PUBLIC_SITE_URL'];
  const missing: string[] = [];

  required.forEach((key) => {
    if (!env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
