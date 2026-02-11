'use client';

import { useEffect, useState } from 'react';
import '@/lib/i18n/config';

interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes i18n
 * Ensures i18n is loaded before rendering children
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Render children immediately - i18n will handle its own hydration
  // The useState/useEffect ensures consistent rendering between server and client
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}

