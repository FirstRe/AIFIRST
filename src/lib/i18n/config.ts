'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import th from '@/locales/th.json';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'ret_language';

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'th'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      th: { translation: th },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

// Function to change language and persist to localStorage
export const changeLanguage = (lang: SupportedLanguage) => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
};

// Function to get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  const lang = i18n.language;
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
    ? (lang as SupportedLanguage)
    : 'en';
};

export default i18n;

