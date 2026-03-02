'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { defaultLocale, getLocaleConfig } from './config';
import { getTranslations } from './translations';

import type { Locale, LocaleConfig, TranslationNamespace } from './types';
import type { ReactNode } from 'react';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (
    namespace: TranslationNamespace,
    key: string,
    params?: Record<string, string | number>
  ) => string;
  config: LocaleConfig;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
};

export const I18nProvider = ({
  children,
  initialLocale = defaultLocale,
}: I18nProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const config = getLocaleConfig(locale);
  const translations = getTranslations(locale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = getLocaleConfig(newLocale).direction;
    }
  }, []);

  const t = useCallback(
    (
      namespace: TranslationNamespace,
      key: string,
      params?: Record<string, string | number>
    ): string => {
      const translation = translations[namespace]?.[key] ?? key;

      if (!params) return translation;

      return Object.entries(params).reduce(
        (result, [paramKey, value]) =>
          result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value)),
        translation
      );
    },
    [translations]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale, options).format(value);
    },
    [locale]
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      return new Intl.DateTimeFormat(locale, options).format(date);
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (value: number, currency?: string): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency ?? config.numberFormat.currency,
      }).format(value);
    },
    [locale, config.numberFormat.currency]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        config,
        formatNumber,
        formatDate,
        formatCurrency,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const useTranslation = (namespace: TranslationNamespace) => {
  const { t, locale } = useI18n();

  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      t(namespace, key, params),
    [t, namespace]
  );

  return { t: translate, locale };
};
