export const defaultLocale = 'en' as const;

export const locales = [defaultLocale] as const;

export type AppLocale = (typeof locales)[number];

export function isSupportedLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
