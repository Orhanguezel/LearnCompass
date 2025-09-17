import type { SupportedLocale } from '@/types/common';

// Tek kaynaklı dizi – diğer yerlerde z.enum(SUPPORTED_LOCALES)
export const SUPPORTED_LOCALES = ['tr', 'en', 'de'] as const;

// Ortam değişkeninden varsayılan dil (fallback 'tr')
export const DEFAULT_LOCALE: SupportedLocale =
  (process.env.DEFAULT_LOCALE as SupportedLocale) || 'tr';
