type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean>;
};

type PageViewEvent = {
  path: string;
  title?: string;
  referrer?: string;
};

type AnalyticsConfig = {
  debug?: boolean;
  enabled?: boolean;
};

const defaultConfig: AnalyticsConfig = {
  debug: process.env.NODE_ENV === 'development',
  enabled: process.env.NODE_ENV === 'production',
};

let config = { ...defaultConfig };

export const initAnalytics = (customConfig?: Partial<AnalyticsConfig>) => {
  config = { ...defaultConfig, ...customConfig };

  if (config.debug) {
    console.log('[Analytics] Initialized with config:', config);
  }
};

export const trackEvent = ({ name, properties }: AnalyticsEvent) => {
  if (!config.enabled) {
    if (config.debug) {
      console.log('[Analytics] Event:', name, properties);
    }
    return;
  }

  // Integration point for analytics providers:
  // - Google Analytics: gtag('event', name, properties)
  // - Mixpanel: mixpanel.track(name, properties)
  // - Amplitude: amplitude.track(name, properties)
  // - Segment: analytics.track(name, properties)

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      name,
      properties
    );
  }
};

export const trackPageView = ({ path, title, referrer }: PageViewEvent) => {
  if (!config.enabled) {
    if (config.debug) {
      console.log('[Analytics] Page view:', path, title);
    }
    return;
  }

  // Integration point for page view tracking
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      'config',
      'GA_MEASUREMENT_ID',
      {
        page_path: path,
        page_title: title,
        page_referrer: referrer,
      }
    );
  }
};

export const trackClick = (
  elementName: string,
  properties?: Record<string, string | number | boolean>
) => {
  trackEvent({
    name: 'click',
    properties: {
      element: elementName,
      ...properties,
    },
  });
};

export const trackFormSubmit = (
  formName: string,
  success: boolean,
  properties?: Record<string, string | number | boolean>
) => {
  trackEvent({
    name: 'form_submit',
    properties: {
      form: formName,
      success,
      ...properties,
    },
  });
};

export const trackError = (
  error: Error,
  context?: Record<string, string | number | boolean>
) => {
  trackEvent({
    name: 'error',
    properties: {
      message: error.message,
      stack: error.stack?.slice(0, 500) ?? '',
      ...context,
    },
  });
};
