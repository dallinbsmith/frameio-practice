import type { Locale, LocaleConfig } from './types';

export const defaultLocale: Locale = 'en';

export const locales: Locale[] = ['en', 'es', 'fr', 'de', 'ja'];

export const localeConfigs: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'USD',
    },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR',
    },
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: 'EUR',
    },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR',
    },
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'JPY',
    },
  },
};

export const getLocaleConfig = (locale: Locale): LocaleConfig => {
  return localeConfigs[locale] ?? localeConfigs[defaultLocale];
};

export const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};
