import type {
  MonitoringConfig,
  WebVitalMetric,
  WebVitalName,
  WebVitalRating,
  WebVitalsThresholds,
} from './types';

const THRESHOLDS: WebVitalsThresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

const getRating = (name: WebVitalName, value: number): WebVitalRating => {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

const generateId = (): string => {
  return `v${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const getNavigationType = (): WebVitalMetric['navigationType'] => {
  if (typeof window === 'undefined') return 'navigate';

  const navEntry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (navEntry) {
    if (navEntry.type === 'reload') return 'reload';
    if (navEntry.type === 'back_forward') return 'back-forward';
    if ((navEntry as { type: string }).type === 'prerender') return 'prerender';
  }

  return 'navigate';
};

const createMetric = (
  name: WebVitalName,
  value: number,
  entries: PerformanceEntry[] = []
): WebVitalMetric => ({
  name,
  value,
  rating: getRating(name, value),
  delta: value,
  id: generateId(),
  navigationType: getNavigationType(),
  entries,
});

const shouldSample = (sampleRate: number): boolean => {
  return Math.random() < sampleRate;
};

export const initWebVitals = (config: MonitoringConfig) => {
  if (typeof window === 'undefined' || !config.enabled) return;

  if (!shouldSample(config.sampleRate)) return;

  const reportMetric = (metric: WebVitalMetric) => {
    config.onMetric?.(metric);

    if (config.debug) {
      const color =
        metric.rating === 'good'
          ? '#0cce6b'
          : metric.rating === 'needs-improvement'
            ? '#ffa400'
            : '#ff4e42';

      // eslint-disable-next-line no-console
      console.log(
        `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
        `color: ${color}; font-weight: bold;`
      );
    }

    if (config.endpoint) {
      const body = JSON.stringify({
        ...metric,
        url: window.location.href,
        timestamp: Date.now(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(config.endpoint, body);
      } else {
        fetch(config.endpoint, {
          method: 'POST',
          body,
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      }
    }
  };

  const observeLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        reportMetric(createMetric('LCP', lastEntry.startTime, entries));
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  };

  const observeFID = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming | undefined;
      if (firstEntry) {
        reportMetric(
          createMetric(
            'FID',
            firstEntry.processingStart - firstEntry.startTime,
            entries
          )
        );
      }
    });
    observer.observe({ type: 'first-input', buffered: true });
  };

  const observeCLS = () => {
    let clsValue = 0;
    const clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
          clsEntries.push(entry);
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    const reportCLS = () => {
      reportMetric(createMetric('CLS', clsValue, clsEntries));
    };

    if (document.visibilityState === 'hidden') {
      reportCLS();
    } else {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportCLS();
        }
      });
    }
  };

  const observeFCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint');
      if (fcpEntry) {
        reportMetric(createMetric('FCP', fcpEntry.startTime, [fcpEntry]));
        observer.disconnect();
      }
    });
    observer.observe({ type: 'paint', buffered: true });
  };

  const observeTTFB = () => {
    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (navEntry) {
      reportMetric(createMetric('TTFB', navEntry.responseStart, [navEntry]));
    }
  };

  const observeINP = () => {
    let maxINP = 0;
    let inpEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEventTiming[];
      for (const entry of entries) {
        const duration = entry.processingEnd - entry.processingStart;
        if (duration > maxINP) {
          maxINP = duration;
          inpEntries = [entry];
        }
      }
    });

    observer.observe({ type: 'event', buffered: true });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && maxINP > 0) {
        reportMetric(createMetric('INP', maxINP, inpEntries));
      }
    });
  };

  try {
    observeFCP();
    observeLCP();
    observeFID();
    observeCLS();
    observeTTFB();
    observeINP();
  } catch {
    if (config.debug) {
      // eslint-disable-next-line no-console
      console.warn('[Web Vitals] Failed to initialize observers');
    }
  }
};
