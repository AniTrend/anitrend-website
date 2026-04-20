'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { deepLinks } from '@/config/links';
import { logEvent } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import { copy } from '@/copy';

export function TrackAnimeView({
  anime,
}: {
  anime: Pick<Anime, 'id' | 'title' | 'rank' | 'score'>;
}) {
  useEffect(() => {
    void (async () => {
      await logEvent('anime_view', {
        id: anime.id,
        title: anime.title,
        rank: anime.rank,
        score: anime.score,
      });
    })();
  }, [anime.id, anime.title, anime.rank, anime.score]);

  return null;
}

export function OpenInAppButton({
  anime,
}: {
  anime: Pick<Anime, 'id' | 'title'>;
}) {
  return (
    <Button asChild className="w-full" size="lg">
      <a
        href={deepLinks.anime(anime.id)}
        onClick={() => {
          void logEvent('open_in_app', { id: anime.id, title: anime.title });
        }}
      >
        <Smartphone className="mr-2 h-5 w-5" /> {copy.anime.actions.openInApp}
      </a>
    </Button>
  );
}

export function ShareButton({ anime }: { anime: Pick<Anime, 'id' | 'title'> }) {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied' | 'error'>(
    'idle'
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: anime.title,
          text: copy.anime.actions.shareText(anime.title),
          url: window.location.href,
        });
        setStatus('shared');
        void logEvent('share_click', {
          method: 'web_share',
          content: 'anime_detail',
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setStatus('copied');
        void logEvent('share_click', {
          method: 'copy',
          content: 'anime_detail',
        });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
      console.warn('Share failed', err);
    }
  };

  return (
    <div>
      <Button onClick={handleShare} variant="outline" className="w-full">
        {copy.anime.actions.share}
      </Button>
      {status === 'copied' && (
        <p className="text-xs text-muted-foreground mt-1">
          {copy.anime.actions.linkCopied}
        </p>
      )}
    </div>
  );
}
