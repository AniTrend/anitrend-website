import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from '@/i18n/config';

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: {
    common: (await import('../../messages/en/common.json')).default,
    marketing: (await import('../../messages/en/marketing.json')).default,
    metadata: (await import('../../messages/en/metadata.json')).default,
    dashboard: (await import('../../messages/en/dashboard.json')).default,
    discover: (await import('../../messages/en/discover.json')).default,
    recommend: (await import('../../messages/en/recommend.json')).default,
    anime: (await import('../../messages/en/anime.json')).default,
  },
}));
