import Link from 'next/link';
import Balancer from 'react-wrap-balancer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37.07.07 0 0 0 3.647 4.4C.533 9.044-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.029.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.029.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function CommunitySection({
  supabaseBannerUrl,
  discordInviteUrl,
}: {
  supabaseBannerUrl: string;
  discordInviteUrl: string;
}) {
  return (
    <section id="community" className="py-20 md:py-32 relative">
      <Image
        src={supabaseBannerUrl}
        alt="Community background"
        fill
        className="absolute inset-0 w-full h-full object-cover -z-10 opacity-20"
        data-ai-hint="anime community"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent -z-10"></div>
      <div className="container text-center max-w-3xl mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background mb-6">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
          Start Your Adventure
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          <Balancer>
            Join our community, support AniTrend, and dive into an incredible
            anime and manga experience!
          </Balancer>
        </p>
        <div className="mt-8">
          <Button asChild size="lg" variant="discord">
            <Link href={discordInviteUrl} target="_blank" rel="noreferrer">
              <DiscordIcon className="mr-2 h-5 w-5" />
              Join on Discord
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
