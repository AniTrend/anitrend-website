import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
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
import { SectionIntro } from '@/components/sections/section-intro';

export async function GetTheAppSection({
  playStoreUrl,
  githubReleasesUrl,
}: {
  playStoreUrl: string;
  githubReleasesUrl: string;
}) {
  const t = await getTranslations('marketing');

  return (
    <section id="get-the-app" className="scroll-mt-24 py-20">
      <div className="container">
        <SectionIntro
          badge={t('getTheApp.badge')}
          title={t('getTheApp.title')}
          description={t('getTheApp.description')}
          align="center"
        />
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="flex flex-col rounded-[1.75rem] border-primary/20 bg-[linear-gradient(180deg,rgba(20,24,52,0.92),rgba(10,12,26,0.98))] text-white shadow-[0_24px_80px_rgba(4,6,20,0.3)]">
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
                  <CardTitle>{t('getTheApp.googlePlay.title')}</CardTitle>
                  <CardDescription>
                    {t('getTheApp.googlePlay.subtitle')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-slate-300">
                {t('getTheApp.googlePlay.description')}
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
                  {t('getTheApp.googlePlay.cta')}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col rounded-[1.75rem] border-white/10 bg-card/85 shadow-[0_24px_80px_rgba(4,6,20,0.2)]">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Github className="h-10 w-10 text-muted-foreground" />
                <div>
                  <CardTitle>{t('getTheApp.github.title')}</CardTitle>
                  <CardDescription>
                    {t('getTheApp.github.subtitle')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                {t('getTheApp.github.description')}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg" variant="secondary">
                <Link href={githubReleasesUrl} target="_blank" rel="noreferrer">
                  {t('getTheApp.github.cta')}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
