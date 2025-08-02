import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Star, GitFork, RefreshCw } from 'lucide-react';
import { getLanguageColor } from '@/lib/github-service';

interface Repository {
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
}

interface RepositoryShowcaseProps {
  initialRepos: Repository[];
  showStarredToggle?: boolean;
}

export function RepositoryShowcase({
  initialRepos,
  showStarredToggle = false,
}: RepositoryShowcaseProps) {
  const [repos, setRepos] = useState<Repository[]>(initialRepos);
  const [isStarred, setIsStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRepositories = async (starred: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/repositories?starred=${starred}&limit=6`
      );
      if (response.ok) {
        const data = await response.json();
        setRepos(data);
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    const newStarredState = !isStarred;
    setIsStarred(newStarredState);
    await fetchRepositories(newStarredState);
  };

  return (
    <div className="space-y-4">
      {showStarredToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={!isStarred ? 'default' : 'outline'}
              size="sm"
              onClick={() => !isStarred || handleToggle()}
              disabled={isLoading}
            >
              Organization Repos
            </Button>
            <Button
              variant={isStarred ? 'default' : 'outline'}
              size="sm"
              onClick={() => isStarred || handleToggle()}
              disabled={isLoading}
            >
              <Star className="w-4 h-4 mr-2" />
              Starred Repos
            </Button>
          </div>
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {repos.map((repo) => (
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
                    style={{ backgroundColor: getLanguageColor(repo.language) }}
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
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
