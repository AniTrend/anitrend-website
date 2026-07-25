'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface ReadMoreTextProps {
  text: string;
  expandLabel: string;
  collapseLabel: string;
  ariaLabel?: string;
  className?: string;
  lines?: number;
  threshold?: number;
}

export function ReadMoreText({
  text,
  expandLabel,
  collapseLabel,
  ariaLabel,
  className,
  lines = 5,
  threshold = 240,
}: ReadMoreTextProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  if (!text || text.length <= threshold) {
    return <p className={cn('leading-relaxed', className)}>{text}</p>;
  }

  return (
    <div className="space-y-3">
      <p
        id={contentId}
        className={cn('leading-relaxed', className)}
        style={
          expanded
            ? undefined
            : {
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: lines,
              }
        }
      >
        {text}
      </p>
      <button
        type="button"
        className="inline-flex w-fit items-center text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={expanded}
        aria-controls={contentId}
        aria-label={ariaLabel}
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? collapseLabel : expandLabel}
      </button>
    </div>
  );
}
