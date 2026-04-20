export const recommendCopy = {
  hero: {
    title: 'AI Anime Recommender',
    description:
      "Describe what you're in the mood for, and our AI will suggest an anime for you to watch from our catalog.",
  },
  form: {
    placeholder:
      "e.g., 'A sci-fi adventure with a witty crew and a jazzy soundtrack...'",
    exampleLead: 'Try an example:',
    submit: 'Get Recommendation',
    submitting: 'Thinking...',
  },
  loading: {
    recommendation: 'Finding the perfect anime for you...',
  },
  result: {
    title: 'Our Recommendation',
    whyThisMatch: 'Why this match:',
    viewDetails: 'View Details',
    rankPrefix: 'Rank #',
    notAvailable: 'N/A',
  },
  toast: {
    failedTitle: 'Recommendation failed',
    failedDescription: 'Could not generate a recommendation. Please try again.',
  },
  examples: [
    'A classic space opera with bounty hunters.',
    'Something with complex psychological themes like Death Note.',
    'A funny show about superheroes in high school.',
  ],
} as const;
