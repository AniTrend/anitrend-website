'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  githubReleasesUrl,
  playStoreUrl,
  type AppIntent,
  type AppIntentStatus,
} from '@/config/links';

type AppHandoffFallbackDialogProps = {
  intent: AppIntent;
  intentStatus: AppIntentStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppHandoffFallbackDialog({
  intent,
  intentStatus,
  open,
  onOpenChange,
}: AppHandoffFallbackDialogProps) {
  const common = useTranslations('common');
  const anime = useTranslations('anime');

  const copy = useMemo(() => {
    if (intent.type === 'profile') {
      return {
        title: common('handoff.profileFallback.title'),
        description: common('handoff.profileFallback.description'),
        playStoreLabel: common('handoff.profileFallback.actions.playStore'),
        githubLabel: common('handoff.profileFallback.actions.github'),
        dismissLabel: common('handoff.profileFallback.actions.dismiss'),
      };
    }

    return {
      title: anime('handoff.openFallback.title'),
      description: anime('handoff.openFallback.description'),
      playStoreLabel: anime('handoff.openFallback.actions.playStore'),
      githubLabel: anime('handoff.openFallback.actions.github'),
      dismissLabel: anime('handoff.openFallback.actions.dismiss'),
    };
  }, [anime, common, intent.type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
          {intentStatus === 'pendingVerification' ? (
            <p className="text-sm text-muted-foreground">
              {common('handoff.pendingVerificationNote')}
            </p>
          ) : null}
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link href={playStoreUrl} target="_blank" rel="noreferrer">
              {copy.playStoreLabel}
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={githubReleasesUrl} target="_blank" rel="noreferrer">
              {copy.githubLabel}
            </Link>
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">{copy.dismissLabel}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
