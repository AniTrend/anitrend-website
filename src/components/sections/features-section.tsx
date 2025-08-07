import Balancer from 'react-wrap-balancer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type FeatureItem = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export function FeaturesSection({ features }: { features: FeatureItem[] }) {
  return (
    <section
      id="features"
      className="py-20 md:py-24 bg-secondary/20 scroll-mt-20"
    >
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
            All-in-One Anime & Manga Tracker
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            <Balancer>
              AniTrend is packed with features to help you organize your lists,
              discover new favorites, and connect with other fans.
            </Balancer>
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center bg-card/50">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="font-headline text-xl">
                  {feature.title}
                </CardTitle>
                <p className="mt-2 text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
