'use client';
import type { Anime } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Award } from 'lucide-react';

export function AnimeCard({ anime }: { anime: Anime }) {
  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 bg-secondary/30 hover:shadow-lg hover:-translate-y-1 hover:shadow-primary/20 backdrop-blur-sm border-secondary/50">
        <CardContent className="p-0">
          <div className="relative">
            <Image
              src={anime.imageUrl}
              alt={anime.title}
              width={240}
              height={360}
              data-ai-hint={`${anime.title} anime poster`}
              className="w-full h-auto object-cover aspect-[2/3]"
            />
            <div className="absolute top-2 right-2">
              <Badge className="flex items-center gap-1.5" variant="secondary">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold">{anime.score ? anime.score.toFixed(2) : 'N/A'}</span>
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-base truncate group-hover:text-primary">
              {anime.title}
            </h3>
            <div className='flex justify-between text-xs text-muted-foreground'>
                <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>Rank #{anime.rank}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{(anime.popularity / 1000).toFixed(1)}k</span>
                </div>
            </div>
             <p className="text-sm text-muted-foreground capitalize">{anime.status?.toLowerCase()}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
