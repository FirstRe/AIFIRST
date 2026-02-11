'use client';

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n/config';

/**
 * Custom hook for language management
 * Provides functions to get/set language and toggle between supported languages
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = getCurrentLanguage();

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    changeLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    changeLanguage(SUPPORTED_LANGUAGES[nextIndex]);
  }, [currentLanguage]);

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isReady: i18n.isInitialized,
  };
}

