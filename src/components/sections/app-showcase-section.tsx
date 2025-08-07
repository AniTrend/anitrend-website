import Balancer from 'react-wrap-balancer';
import Image from 'next/image';
import { Palette } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { AppScreenshot } from '@/lib/screenshots-service';

export function AppShowcaseSection({
  screenshots,
}: {
  screenshots: AppScreenshot[];
}) {
  return (
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
              Explore a meticulously designed interface that&apos;s both
              intuitive and visually stunning. Every screen is built to enhance
              your anime and manga journey.
            </Balancer>
          </p>
        </div>
        <div className="mt-12">
          <Carousel
            opts={{ align: 'start', loop: true }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {screenshots.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
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
  );
}
