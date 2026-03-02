import type { ErrorReport } from './types';

type ErrorReporterConfig = {
  enabled: boolean;
  endpoint?: string;
  sampleRate?: number;
  onError?: (report: ErrorReport) => void;
  ignorePatterns?: RegExp[];
  maxReportsPerSession?: number;
};

let reportCount = 0;

const shouldIgnore = (
  message: string,
  ignorePatterns: RegExp[] = []
): boolean => {
  const defaultPatterns = [
    /ResizeObserver loop/i,
    /Loading chunk/i,
    /Network request failed/i,
    /AbortError/i,
  ];

  const patterns = [...defaultPatterns, ...ignorePatterns];
  return patterns.some((pattern) => pattern.test(message));
};

export const createErrorReport = (
  error: Error,
  componentStack?: string,
  metadata?: Record<string, unknown>
): ErrorReport => {
  const report: ErrorReport = {
    message: error.message,
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  if (error.stack) {
    report.stack = error.stack;
  }

  if (componentStack) {
    report.componentStack = componentStack;
  }

  if (metadata) {
    report.metadata = metadata;
  }

  return report;
};

export const initErrorReporter = (config: ErrorReporterConfig) => {
  if (typeof window === 'undefined' || !config.enabled) return;

  const { sampleRate = 1, maxReportsPerSession = 10 } = config;

  const reportError = (report: ErrorReport) => {
    if (reportCount >= maxReportsPerSession) return;
    if (Math.random() > sampleRate) return;
    if (shouldIgnore(report.message, config.ignorePatterns)) return;

    reportCount++;

    config.onError?.(report);

    if (config.endpoint) {
      const body = JSON.stringify(report);

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

  window.addEventListener('error', (event) => {
    const report = createErrorReport(
      event.error || new Error(event.message),
      undefined,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
    reportError(report);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    const report = createErrorReport(error, undefined, {
      type: 'unhandledrejection',
    });
    reportError(report);
  });

  return {
    reportError: (
      error: Error,
      componentStack?: string,
      metadata?: Record<string, unknown>
    ) => {
      reportError(createErrorReport(error, componentStack, metadata));
    },
  };
};

export const reportError = (
  error: Error,
  config: Pick<ErrorReporterConfig, 'endpoint' | 'onError'> = {}
) => {
  const report = createErrorReport(error);

  config.onError?.(report);

  if (config.endpoint && typeof window !== 'undefined') {
    fetch(config.endpoint, {
      method: 'POST',
      body: JSON.stringify(report),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }
};
