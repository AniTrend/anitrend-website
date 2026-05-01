import { cn } from '@/lib/utils';

type SectionIntroProps = {
  badge?: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionIntro({
  badge,
  title,
  description,
  align = 'left',
  className,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        'space-y-4',
        align === 'center' && 'mx-auto max-w-3xl text-center',
        className
      )}
    >
      {badge ? (
        <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-primary/90">
          {badge}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl font-headline">
        {title}
      </h2>
      <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
        {description}
      </p>
    </div>
  );
}
