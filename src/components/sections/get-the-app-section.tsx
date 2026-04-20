import Link from 'next/link';
import Balancer from 'react-wrap-balancer';
import { siGoogleplay } from 'simple-icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github } from 'lucide-react';
import { copy } from '@/copy';

export function GetTheAppSection({
  playStoreUrl,
  githubReleasesUrl,
}: {
  playStoreUrl: string;
  githubReleasesUrl: string;
}) {
  return (
    <section id="get-the-app" className="py-20 scroll-mt-20">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
            {copy.marketing.getTheApp.title}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            <Balancer>{copy.marketing.getTheApp.description}</Balancer>
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="flex flex-col border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-primary"
                  fill="currentColor"
                >
                  <path d={siGoogleplay.path} />
                </svg>
                <div>
                  <CardTitle>
                    {copy.marketing.getTheApp.googlePlay.title}
                  </CardTitle>
                  <CardDescription>
                    {copy.marketing.getTheApp.googlePlay.subtitle}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                {copy.marketing.getTheApp.googlePlay.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700 hover:border-primary/50 text-white transition-all duration-200"
                size="lg"
              >
                <Link href={playStoreUrl} target="_blank" rel="noreferrer">
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                  >
                    <path d={siGoogleplay.path} />
                  </svg>
                  {copy.marketing.getTheApp.googlePlay.cta}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Github className="h-10 w-10 text-muted-foreground" />
                <div>
                  <CardTitle>{copy.marketing.getTheApp.github.title}</CardTitle>
                  <CardDescription>
                    {copy.marketing.getTheApp.github.subtitle}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                {copy.marketing.getTheApp.github.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg" variant="secondary">
                <Link href={githubReleasesUrl} target="_blank" rel="noreferrer">
                  {copy.marketing.getTheApp.github.cta}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
