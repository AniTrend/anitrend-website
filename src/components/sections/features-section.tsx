import Balancer from 'react-wrap-balancer';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionIntro } from '@/components/sections/section-intro';

export type FeatureItem = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export async function FeaturesSection({
  features,
}: {
  features: FeatureItem[];
}) {
  const t = await getTranslations('marketing');
  const [leadOne, leadTwo, ...supporting] = features;

  return (
    <section id="features" className="scroll-mt-24 bg-secondary/10 py-20 md:py-24">
      <div className="container">
        <SectionIntro
          badge={t('featuresSection.badge')}
          title={t('featuresSection.title')}
          description={t('featuresSection.description')}
          align="center"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1.2fr_0.9fr]">
          {[leadOne, leadTwo].filter(Boolean).map((feature) => (
            <Card
              key={feature.title}
              className="overflow-hidden rounded-[1.75rem] border-white/10 bg-[linear-gradient(180deg,rgba(20,24,52,0.95),rgba(10,12,26,0.98))] text-left shadow-[0_24px_80px_rgba(4,6,20,0.3)]"
            >
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-md text-base text-slate-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {supporting.map((feature) => (
              <Card
                key={feature.title}
                className="rounded-[1.5rem] border-white/10 bg-card/80 text-left shadow-[0_18px_50px_rgba(4,6,20,0.18)]"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <Balancer>{feature.description}</Balancer>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
