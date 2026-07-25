'use client';

import type * as React from 'react';
import { useState } from 'react';
import type { VariantProps } from 'class-variance-authority';
import {
  getAppIntentHref,
  type AppIntent,
  type AppIntentStatus,
} from '@/config/links';
import { openAppIntent } from '@/lib/app-handoff';
import { Button, buttonVariants } from '@/components/ui/button';
import { AppHandoffFallbackDialog } from '@/components/app-handoff/app-handoff-fallback-dialog';

type OpenInAppButtonProps = {
  intent: AppIntent;
  intentStatus: AppIntentStatus;
  children: React.ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  onAttempt?: () => void;
};

function shouldHandleAppHandoffClick(
  event: React.MouseEvent<HTMLAnchorElement>
): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
}

export function OpenInAppButton({
  intent,
  intentStatus,
  children,
  className,
  variant,
  size,
  onAttempt,
}: OpenInAppButtonProps) {
  const [fallbackOpen, setFallbackOpen] = useState(false);

  return (
    <>
      <Button asChild className={className} variant={variant} size={size}>
        <a
          href={getAppIntentHref(intent)}
          data-intent-status={intentStatus}
          onClick={(event) => {
            if (!shouldHandleAppHandoffClick(event)) {
              return;
            }

            event.preventDefault();
            onAttempt?.();

            void openAppIntent(intent).then((opened) => {
              if (!opened) {
                setFallbackOpen(true);
              }
            });
          }}
        >
          {children}
        </a>
      </Button>
      <AppHandoffFallbackDialog
        intent={intent}
        intentStatus={intentStatus}
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
      />
    </>
  );
}
