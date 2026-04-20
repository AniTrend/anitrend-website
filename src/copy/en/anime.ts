export const animeCopy = {
  actions: {
    openInApp: 'Open in App',
    share: 'Share',
    linkCopied: 'Link copied',
    shareText: (title: string) => `Check out ${title} on AniTrend`,
  },
  details: {
    information: 'Information',
    aired: 'Aired',
    studios: 'Studios',
    producers: 'Producers',
    duration: 'Duration',
    rating: 'Rating',
    rankPrefix: 'Rank #',
    usersSuffix: 'users',
    episodesSuffix: 'episodes',
    synopsis: 'Synopsis',
    synopsisFallback: 'No synopsis available.',
    background: 'Background',
    trailer: 'Trailer',
    characters: 'Characters',
  },
} as const;
