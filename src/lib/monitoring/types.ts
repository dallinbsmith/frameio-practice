export type WebVitalName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

export type WebVitalMetric = {
  name: WebVitalName;
  value: number;
  rating: WebVitalRating;
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
  entries: PerformanceEntry[];
};

export type WebVitalsThresholds = {
  [K in WebVitalName]: {
    good: number;
    poor: number;
  };
};

export type MonitoringConfig = {
  enabled: boolean;
  sampleRate: number;
  endpoint?: string;
  onMetric?: (metric: WebVitalMetric) => void;
  debug?: boolean;
};

export type ErrorReport = {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
  metadata?: Record<string, unknown>;
};
