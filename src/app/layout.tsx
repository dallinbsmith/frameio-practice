import './globals.css';

import { SkipLink } from '@/components/accessibility';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WebVitalsReporter } from '@/components/monitoring';
import { AnalyticsProvider } from '@/components/providers';
import { StructuredData } from '@/components/seo';
import { RouteChangeIndicator } from '@/components/transitions';
import { ToastProvider } from '@/components/ui/Toast';
import { FeatureFlagsProvider, defaultFlags } from '@/lib/features';
import { I18nProvider } from '@/lib/i18n';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo';
import { StyledComponentsRegistry } from '@/lib/styled/registry';
import { ThemeProvider } from '@/lib/theme';

import type { Metadata, Viewport } from 'next';

const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';

const organizationSchema = generateOrganizationSchema({
  name: 'Frame.io Study Guide',
  description:
    'A comprehensive study guide for Frame.io marketing site architecture',
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
});

const websiteSchema = generateWebsiteSchema({
  name: 'Frame.io Study Guide',
  url: siteUrl,
  description:
    'Learn modern Next.js, React Server Components, and enterprise-grade marketing site patterns.',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'
  ),
  title: {
    default: 'Frame.io Study Guide | Video Review & Collaboration',
    template: '%s | Frame.io Study Guide',
  },
  description:
    'A comprehensive study guide application replicating Frame.io marketing site architecture. Learn modern Next.js, React Server Components, and enterprise-grade marketing site patterns.',
  keywords: [
    'Frame.io',
    'video collaboration',
    'video review',
    'Next.js',
    'React',
    'marketing site',
    'study guide',
  ],
  authors: [{ name: 'Study Guide Team' }],
  creator: 'Study Guide Team',
  publisher: 'Study Guide Team',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Frame.io Study Guide',
    title: 'Frame.io Study Guide | Video Review & Collaboration',
    description:
      'A comprehensive study guide application replicating Frame.io marketing site architecture.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frame.io Study Guide',
    description:
      'A comprehensive study guide application replicating Frame.io marketing site architecture.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('frameio-theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    } else if (theme === 'system' || !theme) {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  } catch (e) {}
})();
`;

const featureFlagsConfig = {
  flags: defaultFlags,
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider>
            <FeatureFlagsProvider config={featureFlagsConfig}>
              <I18nProvider>
                <AnalyticsProvider>
                  <ToastProvider>
                    <WebVitalsReporter />
                    <SkipLink />
                    <RouteChangeIndicator />
                    <Header />
                    <div id="page-wrapper">
                      <main id="main-content" tabIndex={-1}>
                        {children}
                      </main>
                    </div>
                    <Footer />
                  </ToastProvider>
                </AnalyticsProvider>
              </I18nProvider>
            </FeatureFlagsProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
