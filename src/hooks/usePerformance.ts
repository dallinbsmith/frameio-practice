import { useEffect, useRef } from 'react';

type PerformanceMetrics = {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
};

type UsePerformanceOptions = {
  onMetric?: (metric: { name: string; value: number }) => void;
  debug?: boolean;
};

export const usePerformance = ({
  onMetric,
  debug = false,
}: UsePerformanceOptions = {}) => {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return undefined;
    }

    const reportMetric = (name: string, value: number) => {
      metricsRef.current = { ...metricsRef.current, [name]: value };

      if (debug) {
        console.log(`[Performance] ${name}:`, value.toFixed(2), 'ms');
      }

      onMetric?.({ name, value });
    };

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === 'first-contentful-paint'
      );
      if (fcpEntry) {
        reportMetric('fcp', fcpEntry.startTime);
      }
    });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        reportMetric('lcp', lastEntry.startTime);
      }
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming | undefined;
      if (firstEntry) {
        reportMetric('fid', firstEntry.processingStart - firstEntry.startTime);
      }
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (
          !(entry as PerformanceEntry & { hadRecentInput?: boolean })
            .hadRecentInput
        ) {
          clsValue +=
            (entry as PerformanceEntry & { value?: number }).value ?? 0;
        }
      }
      reportMetric('cls', clsValue * 1000);
    });

    try {
      fcpObserver.observe({ type: 'paint', buffered: true });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Some observers may not be supported
    }

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navigationEntry) {
      reportMetric(
        'ttfb',
        navigationEntry.responseStart - navigationEntry.requestStart
      );
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [debug, onMetric]);

  return metricsRef.current;
};

export default usePerformance;
