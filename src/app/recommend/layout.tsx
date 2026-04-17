import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Anime Recommender',
  description:
    'Describe what you are in the mood for, and our AI will suggest an anime for you to watch.',
  openGraph: {
    title: 'AI Anime Recommender | AniTrend',
    description:
      'Describe what you are in the mood for, and our AI will suggest an anime for you to watch.',
  },
};

export default function RecommendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
