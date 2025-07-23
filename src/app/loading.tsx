import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-16" />
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-20 md:py-32 text-center">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-6" />
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Skeleton className="h-12 w-full sm:w-40" />
              <Skeleton className="h-12 w-full sm:w-40" />
            </div>
        </div>
        <div className="container py-20">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
            </div>
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <Skeleton className="h-6 w-2/3 md:w-1/3" />
            <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
            </div>
        </div>
      </footer>
    </div>
  );
}
