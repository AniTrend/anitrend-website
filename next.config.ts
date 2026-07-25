import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const SUPABASE_STORAGE_BANNER_PATHNAME =
  '/storage/v1/object/public/media/banner/**';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anitrend.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        // Keep this static so runtime Supabase env values cannot drift from
        // the build-time Next image allowlist. The path remains banner-only.
        hostname: '*.supabase.co',
        port: '',
        pathname: SUPABASE_STORAGE_BANNER_PATHNAME,
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'myanimelist.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.myanimelist.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
