
import { AppHeader } from "@/components/header";
import { AppFooter } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Github, QrCode, Heart, GitFork, Layers, ArrowUpRight, TrendingUp, Search, Star, Feather, Rocket, Users, Compass, Wand2, Palette } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnimePreview } from "@/components/anime-preview";
import Balancer from "react-wrap-balancer";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const repositories = [
  {
    name: "anitrend-app",
    description: "The main AniTrend application for Android, built with Kotlin and clean architecture.",
    href: "https://github.com/AniTrend/anitrend-app"
  },
  {
    name: "anitrend-api",
    description: "A GraphQL API that aggregates data from various sources for the AniTrend ecosystem.",
    href: "https://github.com/AniTrend/anitrend-api"
  },
  {
    name: "anitrend-platform",
    description: "The web presence for AniTrend, including the landing page you're on right now.",
    href: "https://github.com/AniTrend/anitrend-platform"
  },
  {
    name: "graphql-coercer",
    description: "A library for coercing scalar values in GraphQL schemas, used across the platform.",
    href: "https://github.com/AniTrend/graphql-coercer"
  },
   {
    name: "support-fs",
    description: "File system support library for AniTrend, providing robust file handling.",
    href: "https://github.com/AniTrend/support-fs"
  },
   {
    name: "support-ext",
    description: "A collection of Kotlin extension functions to streamline development.",
    href: "https://github.com/AniTrend/support-ext"
  },
];

const features = [
  {
    icon: TrendingUp,
    title: "Stay in the Loop",
    description: "Track anime and manga trends effortlessly, and manage your lists from one unified space.",
  },
  {
    icon: Search,
    title: "Find Exactly What You Love",
    description: "Effortlessly search anime, manga, characters, and creators with our powerful search engine.",
  },
  {
    icon: Star,
    title: "Rate Your Way",
    description: "Personalize your experience with flexible rating systems tailored just for you.",
  },
  {
    icon: Feather,
    title: "Smart and Efficient",
    description: "AniTrend intelligently adapts to your device's settings to optimize battery and data usage.",
  },
];

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.mxt.anitrend";
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(playStoreUrl)}`;
const githubReleasesUrl = "https://github.com/AniTrend/anitrend-app/releases";
const discordInviteUrl = "https://discord.gg/r325bBq";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section id="hero" className="py-20 md:py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl font-headline">
                  <Balancer>The Ultimate Anime & Manga Companion</Balancer>
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  <Balancer>
                    Your definitive companion for tracking anime and manga. Discover, track, and share your passion with a global community.
                  </Balancer>
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="#get-the-app">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                    <Link href="https://github.com/AniTrend" target="_blank" rel="noreferrer">
                      <Github className="mr-2 h-5 w-5" />
                      View on GitHub
                    </Link>
                  </Button>
                </div>
              </div>
              <div>
                <AnimePreview />
              </div>
            </div>
          </div>
        </section>

        <section id="integrations" className="py-20 scroll-mt-20">
          <div className="container">
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              <div className="lg:col-span-2 flex flex-col gap-6">
                 <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">Proudly Open Source</h2>
                  <p className="text-lg text-muted-foreground">
                      AniTrend is a passion project built by the community, for the community. Explore our repositories and contribute.
                  </p>
                  <div className="space-y-8 mt-4">
                      <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-secondary/30 flex-shrink-0">
                              <Heart className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="font-bold font-headline text-lg">By the community, for the community</h3>
                              <p className="text-muted-foreground mt-1">Thanks to our contributors, AniTrend is built on open collaboration and passion.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-secondary/30 flex-shrink-0">
                              <GitFork className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="font-bold font-headline text-lg">Create or contribute</h3>
                              <p className="text-muted-foreground mt-1">Get involved by writing or maintaining a part of the AniTrend ecosystem.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-secondary/30 flex-shrink-0">
                              <Layers className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="font-bold font-headline text-lg">Modern Tech Stack</h3>
                              <p className="text-muted-foreground mt-1">Built on a robust foundation of Kotlin, GraphQL, and modern Android practices.</p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="lg:col-span-3">
                <div className="grid gap-4 md:grid-cols-2">
                  {repositories.map((repo) => (
                    <Card key={repo.name} className="bg-secondary/30 hover:border-primary/50 transition-colors flex flex-col h-full group">
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <CardTitle className="font-headline text-lg hover:text-primary">
                                  <Link href={repo.href} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                                      {repo.name}
                                  </Link>
                              </CardTitle>
                              <Link href={repo.href} target="_blank" rel="noreferrer" className="text-muted-foreground group-hover:text-primary transition-colors">
                                  <ArrowUpRight className="w-5 h-5" />
                              </Link>
                          </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                          <p className="text-muted-foreground text-sm">{repo.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24 bg-secondary/20 scroll-mt-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                All-in-One Anime & Manga Tracker
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                <Balancer>
                  AniTrend is packed with features to help you organize your lists, discover new favorites, and connect with other fans.
                </Balancer>
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center bg-card/50">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    <p className="mt-2 text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="app-showcase" className="py-20 md:py-24 scroll-mt-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background mb-6">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                Beautifully Crafted Interface
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                <Balancer>
                  Explore a meticulously designed interface that's both intuitive and visually stunning. Every screen is built to enhance your anime and manga journey.
                </Balancer>
              </p>
            </div>
            <div className="mt-12">
               <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-6xl mx-auto"
              >
                <CarouselContent className="-ml-4">
                  {[
                    { src: "https://vzujgysigfwbabgsqcse.supabase.co/storage/v1/object/public/app/android/screenshots/0.jpg", alt: "App home screen", hint: "app screenshot" },
                    { src: "https://vzujgysigfwbabgsqcse.supabase.co/storage/v1/object/public/app/android/screenshots/1.jpg", alt: "Anime detail screen", hint: "app screenshot" },
                    { src: "https://vzujgysigfwbabgsqcse.supabase.co/storage/v1/object/public/app/android/screenshots/2.jpg", alt: "User profile screen", hint: "app screenshot" },
                    { src: "https://vzujgysigfwbabgsqcse.supabase.co/storage/v1/object/public/app/android/screenshots/3.jpg", alt: "Seasonal anime screen", hint: "app screenshot" },
                    { src: "https://vzujgysigfwbabgsqcse.supabase.co/storage/v1/object/public/app/android/screenshots/4.jpg", alt: "Discover screen", hint: "app screenshot" },
                    { src: "https://vzujgysigfwbabgsqcse.supabase.co/storage/v1/object/public/app/android/screenshots/5.jpg", alt: "Manga reader screen", hint: "app screenshot" },
                  ].map((image, index) => (
                    <CarouselItem key={index} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <div className="p-1">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={270}
                            height={540}
                            className="rounded-xl object-cover w-full h-full shadow-lg"
                            data-ai-hint={image.hint}
                          />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden xl:flex" />
                <CarouselNext className="hidden xl:flex" />
              </Carousel>
            </div>
          </div>
        </section>
        
        <section id="ai-recommender" className="py-20 md:py-24 bg-secondary/20 scroll-mt-20">
          <div className="container text-center max-w-3xl mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-background mb-6">
                <Wand2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                Discover Your Next Favorite with AI
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                <Balancer>
                  Tired of endless scrolling? Describe what you're in the mood for, and let our AI find the perfect anime for you from a massive catalog of titles.
                </Balancer>
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/recommend">
                    Try the AI Recommender <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
          </div>
        </section>

        <section id="get-the-app" className="py-20 scroll-mt-20">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                Take AniTrend Anywhere
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                <Balancer>
                  Choose your preferred download method. Get the official release from Google Play or grab the latest build from GitHub.
                </Balancer>
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="flex flex-col border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-primary" fill="currentColor"><path d="M3 2v19.999L16.499 12 3 2zm15.423 9.006l-2.585-1.42-3.843 3.844 6.428-2.424zM3.413 3.413l9.01 9.018-3.957-3.957L3.413 3.413zm15.174-.001l-6.428 2.423 3.843 3.844 2.585-1.421V3.412z"/></svg>
                    <div>
                      <CardTitle>Google Play</CardTitle>
                      <CardDescription>Recommended for most users</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">Get the official, stable release from the Google Play Store. This version includes automatic updates to ensure you always have the latest features and bug fixes.</p>
                </CardContent>
                <CardFooter>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="w-full group" size="lg">
                        Download from Google Play
                        <QrCode className="ml-auto h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-primary/20">
                      <div className="flex flex-col items-center gap-4 text-center p-4">
                        <p className="text-sm font-medium">Scan to download</p>
                        <div className="bg-white p-2 rounded-lg">
                            <Image
                                src={qrCodeUrl}
                                alt="QR code for Google Play Store"
                                width={150}
                                height={150}
                                data-ai-hint="qr code"
                            />
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={playStoreUrl} target="_blank">Open Store</Link>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardFooter>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Github className="h-10 w-10 text-muted-foreground"/>
                    <div>
                      <CardTitle>GitHub</CardTitle>
                      <CardDescription>For developers & early adopters</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">Download the latest release directly from our GitHub repository. Ideal for those who want the newest builds or to contribute to the project.</p>
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

        <section id="community" className="py-20 md:py-32 relative">
             <Image
                src="https://vzujgysigfwbabgsqcse.supabase.co/storage/v1/object/public/app/android/media/banner/156cc9127eb16c7fd645a9ba0fb3a4e21678353995_main.jpg"
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
                    Join our community, support AniTrend, and dive into an incredible anime and manga experience!
                  </Balancer>
                </p>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href={discordInviteUrl} target="_blank" rel="noreferrer">
                      <Users className="mr-2 h-5 w-5" />
                      Join on Discord
                    </Link>
                  </Button>
                </div>
              </div>
        </section>

      </main>
      <AppFooter />
    </div>
  );
}
