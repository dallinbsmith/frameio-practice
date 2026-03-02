export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja';

export type TranslationNamespace =
  | 'common'
  | 'navigation'
  | 'hero'
  | 'features'
  | 'pricing'
  | 'contact';

export type TranslationKey = string;

export type Translations = Record<
  TranslationNamespace,
  Record<TranslationKey, string>
>;

export type LocaleConfig = {
  code: Locale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
};
