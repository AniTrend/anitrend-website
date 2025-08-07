import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, GitFork, Heart, Layers, Star } from 'lucide-react';
import { getLanguageColor } from '@/lib/github-service';

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

export function IntegrationsSection({
  repositories,
}: {
  repositories: RepoForDisplay[];
}) {
  return (
    <section id="integrations" className="py-20 scroll-mt-20">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
              Proudly Open Source
            </h2>
            <p className="text-lg text-muted-foreground">
              AniTrend is a passion project built by the community, for the
              community. Explore our repositories and contribute.
            </p>
            <div className="space-y-8 mt-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-secondary/30 flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg">
                    By the community, for the community
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Thanks to our contributors, AniTrend is built on open
                    collaboration and passion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-secondary/30 flex-shrink-0">
                  <GitFork className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg">
                    Create or contribute
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Get involved by writing or maintaining a part of the
                    AniTrend ecosystem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-secondary/30 flex-shrink-0">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg">
                    Modern Tech Stack
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Built on a robust foundation of Kotlin, GraphQL, and modern
                    Android practices.
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
                  className="bg-secondary/30 hover:border-primary/50 transition-colors flex flex-col h-full group"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-headline text-lg hover:text-primary">
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
                    <p className="text-muted-foreground text-sm mb-3">
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
                        Updated{' '}
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
