import { animeCopy } from '@/copy/en/anime';
import { commonCopy } from '@/copy/en/common';
import { dashboardCopy } from '@/copy/en/dashboard';
import { discoverCopy } from '@/copy/en/discover';
import { marketingCopy } from '@/copy/en/marketing';
import { metadataCopy } from '@/copy/en/metadata';
import { recommendCopy } from '@/copy/en/recommend';

export const enCopy = {
  metadata: metadataCopy,
  common: commonCopy,
  marketing: marketingCopy,
  dashboard: dashboardCopy,
  discover: discoverCopy,
  recommend: recommendCopy,
  anime: animeCopy,
} as const;
