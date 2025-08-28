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
            Take AniTrend Anywhere
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            <Balancer>
              Choose your preferred download method. Get the official release
              from Google Play or grab the latest build from GitHub.
            </Balancer>
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
                  <CardTitle>Google Play</CardTitle>
                  <CardDescription>Recommended for most users</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Get the official, stable release from the Google Play Store.
                This version includes automatic updates to ensure you always
                have the latest features and bug fixes.
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
                  Get it on Google Play
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Github className="h-10 w-10 text-muted-foreground" />
                <div>
                  <CardTitle>GitHub</CardTitle>
                  <CardDescription>
                    For developers & early adopters
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Download the latest release directly from our GitHub repository.
                Ideal for those who want the newest builds or to contribute to
                the project.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg" variant="secondary">
                <Link href={githubReleasesUrl} target="_blank" rel="noreferrer">
                  Go to Releases
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
