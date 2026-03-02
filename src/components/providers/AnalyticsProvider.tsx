'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

import { initAnalytics, trackPageView } from '@/lib/analytics';

import type { ReactNode } from 'react';

type AnalyticsProviderProps = {
  children: ReactNode;
};

const PageViewTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    trackPageView({
      path: url,
      title: document.title,
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  return null;
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  useEffect(() => {
    initAnalytics({
      debug: process.env.NODE_ENV === 'development',
      enabled: process.env.NODE_ENV === 'production',
    });
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
};

export default AnalyticsProvider;
