import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import Analytics from '@/components/analytics';
import AnalyticsConsentBanner from '@/components/consent/analytics-consent-banner';
import { copy } from '@/copy';

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

export const metadata: Metadata = {
  metadataBase: new URL('https://anitrend.com'),
  title: {
    default: copy.metadata.brandName,
    template: `%s | ${copy.metadata.brandName}`,
  },
  description: copy.metadata.root.description,
  openGraph: {
    title: copy.metadata.brandName,
    description: copy.metadata.root.description,
    url: '/',
    siteName: copy.metadata.brandName,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: copy.metadata.brandName,
    description: copy.metadata.root.description,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased min-h-screen bg-background text-foreground`}
      >
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <Analytics />
          <main className="flex-1">{children}</main>
          <AppFooter />
          <AnalyticsConsentBanner />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
