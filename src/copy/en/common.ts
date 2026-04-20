export const commonCopy = {
  nav: {
    dashboard: 'Dashboard',
    discover: 'Discover',
    recommend: 'Recommend',
    features: 'Features',
    integrations: 'Integrations',
    getStarted: 'Get Started',
    menu: 'Menu',
  },
  footer: {
    copyright: (year: number) => `© ${year} AniTrend`,
    faq: 'FAQ',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
  },
  actions: {
    openInApp: 'Open in App',
    openMyListsInApp: 'Open My Lists in App',
    share: 'Share',
    linkCopied: 'Link copied',
  },
  analytics: {
    settingsTriggerSr: 'Analytics settings',
    dialog: {
      title: 'Analytics Settings',
      description:
        'Control anonymous analytics collection for AniTrend. We only store aggregated, non-identifying metrics.',
      label: 'Enable anonymous analytics',
      sublabel: 'Allow collection of anonymous, aggregated usage data.',
      clearConsent: 'Clear consent',
      done: 'Done',
    },
    consentBanner: {
      message:
        'AniTrend uses anonymous analytics to improve the product. By accepting you allow anonymous usage data to be collected. You can change this later in your browser settings.',
      decline: 'Decline',
      accept: 'Accept',
    },
  },
} as const;
