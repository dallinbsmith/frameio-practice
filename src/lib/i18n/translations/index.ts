import { en } from './en';
import { es } from './es';

import type { Locale, Translations } from '../types';

export const translations: Record<Locale, Translations> = {
  en,
  es,
  fr: en, // Fallback to English
  de: en, // Fallback to English
  ja: en, // Fallback to English
};

export const getTranslations = (locale: Locale): Translations => {
  return translations[locale] ?? translations.en;
};
