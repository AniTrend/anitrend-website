import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, GitFork, Heart, Layers, Star } from 'lucide-react';
import { getLanguageColor } from '@/lib/github-service';
import { SectionIntro } from '@/components/sections/section-intro';

export interface RepoForDisplay {
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
}

export async function IntegrationsSection({
  repositories,
}: {
  repositories: RepoForDisplay[];
}) {
  const t = await getTranslations('marketing');

  return (
    <section id="integrations" className="scroll-mt-24 py-20">
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <SectionIntro
              badge={t('integrations.badge')}
              title={t('integrations.title')}
              description={t('integrations.description')}
            />
            <div className="space-y-8 mt-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg">
                    {t('integrations.pillars.community.title')}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {t('integrations.pillars.community.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 flex-shrink-0">
                  <GitFork className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg">
                    {t('integrations.pillars.contribute.title')}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {t('integrations.pillars.contribute.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 flex-shrink-0">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg">
                    {t('integrations.pillars.modernTech.title')}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {t('integrations.pillars.modernTech.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid gap-4 md:grid-cols-2">
              {repositories.map((repo) => (
                <Card
                  key={repo.name}
                  className="group flex h-full flex-col rounded-[1.5rem] border-white/10 bg-[linear-gradient(180deg,rgba(20,24,52,0.92),rgba(10,12,26,0.98))] transition-colors hover:border-primary/40"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-headline text-lg text-white hover:text-primary">
                        <Link
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3"
                        >
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                          {repo.name}
                        </Link>
                      </CardTitle>
                      <Link
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </div>
                    {repo.language && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getLanguageColor(repo.language),
                          }}
                        ></span>
                        {repo.language}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-3 text-sm text-slate-300">
                      {repo.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {repo.forks}
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {t('integrations.updatedPrefix')}{' '}
                        {new Date(repo.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="inline-block bg-secondary text-xs px-2 py-1 rounded-md"
                          >
                            {topic}
                          </span>
                        ))}
                        {repo.topics.length > 3 && (
                          <span className="inline-block bg-secondary/50 text-xs px-2 py-1 rounded-md">
                            +{repo.topics.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
