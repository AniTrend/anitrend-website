import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Smartphone, ListChecks } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="container max-w-2xl mx-auto text-center">
          <ListChecks className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline mb-4">
            Manage Your Lists in the App
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            All your lists—Watching, Completed, Plan to Watch, and more—are
            managed inside the AniTrend native app for the best experience.
          </p>
          <Button asChild size="lg">
            <Link href="app.anitrend://action/profile">
              <Smartphone className="mr-2 h-5 w-5" /> Open My Lists in App
            </Link>
          </Button>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
