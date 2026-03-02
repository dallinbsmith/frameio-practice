'use client';

import { useEffect } from 'react';

import { initWebVitals, initErrorReporter } from '@/lib/monitoring';

import type { WebVitalMetric } from '@/lib/monitoring';

type WebVitalsReporterProps = {
  enabled?: boolean;
  sampleRate?: number;
  debug?: boolean;
  endpoint?: string;
  onMetric?: (metric: WebVitalMetric) => void;
};

export const WebVitalsReporter = ({
  enabled = true,
  sampleRate = 1,
  debug = process.env.NODE_ENV === 'development',
  endpoint,
  onMetric,
}: WebVitalsReporterProps) => {
  useEffect(() => {
    if (!enabled) return;

    const webVitalsConfig = {
      enabled,
      sampleRate,
      debug,
      ...(endpoint && { endpoint }),
      ...(onMetric && { onMetric }),
    };

    initWebVitals(webVitalsConfig);

    const errorConfig = {
      enabled,
      sampleRate,
      ...(endpoint && { endpoint: `${endpoint}/errors` }),
    };

    initErrorReporter(errorConfig);
  }, [enabled, sampleRate, debug, endpoint, onMetric]);

  return null;
};

export default WebVitalsReporter;
