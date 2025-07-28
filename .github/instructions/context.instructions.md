---
applyTo: '**'
---

# AniTrend Website - AI Coding Agent Instructions

## Architecture Overview

This is the **AniTrend landing website** - a Next.js 15 app showcasing the AniTrend anime tracking ecosystem. The site combines a marketing landing page with AI-powered anime recommendations using Google's Genkit framework.

### Key Components

- **Landing Page**: Marketing site promoting the AniTrend Android app and ecosystem
- **AI Recommender**: Genkit-powered anime recommendation engine using Gemini 2.0
- **Anime Discovery**: Browse interface consuming MyAnimeList (Jikan) API
- **Design System**: shadcn/ui components with custom AniTrend theming

## Development Workflows

### Dev Environment

```bash
yarn dev              # Next.js dev server on port 9002 with Turbopack
yarn genkit:dev       # Start Genkit AI development server
yarn genkit:watch     # Watch mode for AI flow development
yarn typecheck        # TypeScript validation
```

### Firebase Deployment

- Uses Firebase App Hosting (`apphosting.yaml`)
- Configured for single instance deployment
- Automatic builds from this repository

## Critical Patterns

### AI Flow Architecture

AI recommendations live in `src/ai/flows/` using the **server-side flow pattern**:

- Flows are server actions marked with `'use server'`
- Use Zod schemas for input/output validation
- Fetch external APIs (Jikan) within flows for real-time data
- Export wrapper functions for client consumption

Example pattern from `recommend-anime-flow.ts`:

```typescript
export async function recommendAnime(
  input: RecommendAnimeInput
): Promise<RecommendAnimeOutput | null> {
  return recommendAnimeFlow(input);
}
```

### Data Fetching Patterns

- **Dynamic data**: Direct Jikan API calls in Server Components and AI flows
- **Type safety**: Shared interfaces in `src/lib/types.ts`

Transform external APIs to internal types consistently:

```typescript
const anime: Anime = {
  id: data.mal_id.toString(),
  title: data.title_english || data.title,
  // ... standardized mapping
};
```

### UI Component Conventions

- **shadcn/ui base**: Pre-configured in `components.json` with custom aliases
- **Typography**: `font-headline` (Space Grotesk) for titles, `font-body` (Inter) for text
- **Color scheme**: Dark theme with purple primary (`#BB86FC`) and teal accents
- **Responsive**: Mobile-first with container-based layouts

### Routing Structure

- `/` - Landing page with marketing sections
- `/discover` - Server-rendered anime grid with client-side interactivity
- `/recommend` - AI-powered recommendation interface
- `/anime/[id]` - Dynamic anime detail pages fetching from Jikan API
- Deep linking: `anitrend://anime/{id}` protocol for mobile app integration

## External Integrations

### MyAnimeList (Jikan API)

- Base URL: `https://api.jikan.moe/v4/`
- No auth required, but respect rate limits
- Key endpoints: `/top/anime`, `/anime/{id}`
- Always handle API failures gracefully with fallbacks

### Google Genkit AI

- Model: `googleai/gemini-2.0-flash`
- Prompt engineering in `src/ai/flows/recommend-anime-flow.ts`
- Requires GOOGLE_API_KEY environment variable
- Use structured JSON output with Zod schemas

## Configuration Notes

### Image Handling

Next.js image domains configured for:

- `placehold.co` - Placeholder images
- `cdn.myanimelist.net` - Anime poster images
- `vzujgysigfwbabgsqcse.supabase.co` - App screenshots
- `anitrend.co` - Brand assets

### TypeScript Settings

- Build errors ignored (`ignoreBuildErrors: true`) for rapid prototyping
- ESLint disabled during builds for CI/CD speed

## Common Tasks

### Adding New AI Flows

1. Create in `src/ai/flows/` with server action pattern
2. Define Zod input/output schemas
3. Export wrapper function for client use
4. Test with `yarn genkit:dev`

### Adding New Pages

1. Follow Next.js 15 app router conventions
2. Server Components for data fetching by default
3. Use `AppHeader` and `AppFooter` for consistent layout
4. Include appropriate meta tags and structured data

### Styling Components

- Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Extend theme in `tailwind.config.ts` for custom design tokens
- Follow shadcn/ui patterns for component composition
