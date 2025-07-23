'use client';

import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useTransition } from 'react';
import { recommendAnime, RecommendAnimeOutput } from '@/ai/flows/recommend-anime-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ArrowRight, CornerDownLeft, Star, Users, Award } from 'lucide-react';
import Balancer from 'react-wrap-balancer';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Anime } from '@/lib/types';

export default function RecommendPage() {
  const [prompt, setPrompt] = useState('');
  const [recommendation, setRecommendation] = useState<RecommendAnimeOutput | null>(null);
  const [recommendedAnime, setRecommendedAnime] = useState<Anime | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const examplePrompts = [
    "A classic space opera with bounty hunters.",
    "Something with complex psychological themes like Death Note.",
    "A funny show about superheroes in high school.",
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) return;

    startTransition(async () => {
      setRecommendation(null);
      setRecommendedAnime(null);
      
      const result = await recommendAnime({ prompt });
      if (result) {
        setRecommendation(result);
        
        // Fetch full anime data from Jikan API
        try {
          const response = await fetch(`https://api.jikan.moe/v4/anime/${result.animeId}`);
          if (response.ok) {
            const { data: anime } = await response.json();
            const fullAnimeData: Anime = {
              id: anime.mal_id.toString(),
              title: anime.title_english || anime.title,
              synopsis: anime.synopsis,
              genres: anime.genres.map((g: any) => g.name),
              score: anime.score,
              imageUrl: anime.images.jpg.large_image_url,
              episodes: anime.episodes,
              year: anime.year,
              season: anime.season,
              rank: anime.rank,
              popularity: anime.popularity,
              status: anime.status,
            };
            setRecommendedAnime(fullAnimeData);
          }
        } catch (error) {
          console.error('Failed to fetch anime details:', error);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Recommendation failed',
          description: 'Could not generate a recommendation. Please try again.',
        });
      }
    });
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container max-w-2xl mx-auto">
            <div className="text-center">
              <Wand2 className="w-12 h-12 mx-auto text-primary mb-4" />
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline">
                AI Anime Recommender
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                <Balancer>
                  Describe what you're in the mood for, and our AI will suggest an anime for you to watch from our catalog.
                </Balancer>
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Textarea
                placeholder="e.g., 'A sci-fi adventure with a witty crew and a jazzy soundtrack...'"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-base"
              />
               <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                Try an example:
                {examplePrompts.map(p => (
                   <button key={p} type="button" onClick={() => handleExampleClick(p)} className="underline hover:text-primary">{p}</button>
                ))}
              </div>
              <Button type="submit" disabled={isPending || !prompt} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Get Recommendation
                  </>
                )}
              </Button>
            </form>

            {isPending && (
                <div className="mt-12 flex flex-col items-center text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Finding the perfect anime for you...</p>
                </div>
            )}

            {recommendation && recommendedAnime && (
              <div className="mt-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold font-headline">Our Recommendation</h2>
                  <p className="mt-2 text-muted-foreground">
                    <span className="font-semibold text-foreground">Why this match:</span> {recommendation.reason}
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-full max-w-xs">
                    <Link href={`/anime/${recommendedAnime.id}`} className="group block">
                      <Card className="overflow-hidden transition-all duration-300 bg-secondary/30 hover:shadow-lg hover:-translate-y-1 hover:shadow-primary/20 backdrop-blur-sm border-secondary/50">
                        <CardContent className="p-2">
                          <div className="relative">
                            <Image
                              src={recommendedAnime.imageUrl}
                              alt={recommendedAnime.title}
                              width={200}
                              height={300}
                              data-ai-hint={`${recommendedAnime.title} anime poster`}
                              className="w-full h-auto object-cover aspect-[2/3]"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="font-bold">{recommendedAnime.score ? recommendedAnime.score.toFixed(2) : 'N/A'}</span>
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-base group-hover:text-primary text-center">
                              {recommendedAnime.title}
                            </h3>
                            <div className='flex justify-between text-xs text-muted-foreground'>
                              <div className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                <span>Rank #{recommendedAnime.rank}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{(recommendedAnime.popularity / 1000).toFixed(1)}k</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize text-center">{recommendedAnime.status?.toLowerCase()}</p>
                            <div className="pt-2">
                              <Button className="w-full" asChild>
                                <span>
                                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
