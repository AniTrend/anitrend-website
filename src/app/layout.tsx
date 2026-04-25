import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import Analytics from '@/components/analytics';
import AnalyticsConsentBanner from '@/components/consent/analytics-consent-banner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '700'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '700'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const brandName = t('brandName');
  const description = t('root.description');

  return {
    metadataBase: new URL('https://anitrend.com'),
    title: {
      default: brandName,
      template: `%s | ${brandName}`,
    },
    description,
    openGraph: {
      title: brandName,
      description,
      url: '/',
      siteName: brandName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: brandName,
      description,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased min-h-screen bg-background text-foreground`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <Analytics />
            <main className="flex-1">{children}</main>
            <AppFooter />
            <AnalyticsConsentBanner />
            <Toaster />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
