import Balancer from 'react-wrap-balancer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wand2 } from 'lucide-react';

export function AIRecommenderSection() {
  return (
    <section
      id="ai-recommender"
      className="py-20 md:py-24 bg-secondary/20 scroll-mt-20"
    >
      <div className="container text-center max-w-3xl mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background mb-6">
          <Wand2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
          Discover Your Next Favorite with AI
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          <Balancer>
            Tired of endless scrolling? Describe what you&apos;re in the mood
            for, and let our AI find the perfect anime for you from a massive
            catalog of titles.
          </Balancer>
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/recommend">
              Try the AI Recommender <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
