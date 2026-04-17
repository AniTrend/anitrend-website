---
applyTo: '**'
---

# AniTrend Website Context

## Architecture Overview

This is the **AniTrend landing website** - a Next.js 15 app showcasing the AniTrend anime tracking ecosystem. The site combines a marketing landing page with AI-powered anime recommendations using Google's Genkit framework.

### Key Components

- **Landing Page**: Marketing site promoting the AniTrend Android app and ecosystem
- **AI Recommender**: Genkit-powered anime recommendation engine using Gemini 2.0
- **Anime Discovery**: Browse interface consuming MyAnimeList (Jikan) API
- **Design System**: shadcn/ui components with custom AniTrend theming
- **Repository Showcase**: GitHub org repositories surfaced via a Next.js API route

## Development Workflows

### Dev Environment

```bash
yarn dev              # Next.js dev server on port 9002 with Turbopack
yarn genkit:dev       # Start Genkit AI development server
yarn genkit:watch     # Watch mode for AI flow development
yarn typecheck        # TypeScript validation
yarn lint             # ESLint validation (CI runs this explicitly)
yarn build            # Next.js production build
yarn start            # Start production server
yarn test:e2e         # Playwright end-to-end tests (expects app running on :9002)
```

### Deployment (Self-hosted, Docker)

- Container images published to GitHub Container Registry (GHCR): `ghcr.io/anitrend/website`
- Deploys to a self-hosted server via SSH using Docker Compose (`compose.prod.yaml`)
- Reverse proxy assumed (Traefik) with labels managed in compose files
- Primary workflows: `ci.yml` (lint/build + docker build check), `deploy.yml` (build & push image, remote deploy), `release.yml` (versioned image publish + release)
- Docker build uses Next.js standalone output and multi-stage builds for optimization
- Always uses yarn as package manager with frozen lockfiles for consistent builds

## Critical Patterns

### AI Flow Architecture

AI recommendations live in `src/ai/flows/` using the **server-side flow pattern**:

- Flows are server actions marked with `'use server'`
- Use Zod schemas for input/output validation
- Fetch external APIs (Jikan) within flows for real-time data
- Export wrapper functions for client consumption

Flows are registered for the Genkit dev runtime by importing them in `src/ai/dev.ts` (side-effect import). Run the AI dev server with `yarn genkit:dev`.

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

GitHub data is fetched server-side via `src/lib/github-service.ts` with response transformation and light caching using `next: { revalidate: N }`. API rate-limits are handled gracefully with fallbacks.

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
- `/dashboard` - Hub with Discover shortcuts, AI recommendation teaser, and app deep link
- `/discover` - Server-rendered anime grid with client-side interactivity
- `/recommend` - AI-powered recommendation interface
- `/anime/[id]` - Dynamic anime detail pages fetching from Jikan API
- Deep linking: `app.anitrend://action/anime/{id}` protocol for mobile app integration

## External Integrations

### MyAnimeList (Jikan API)

- Base URL: `https://api.jikan.moe/v4/`
- No auth required, but respect rate limits
- Key endpoints: `/top/anime`, `/anime/{id}`, `/recommendations/anime`
- Always handle API failures gracefully with fallbacks

### Google Genkit AI

- Model: `googleai/gemini-2.0-flash`
- Prompt engineering in `src/ai/flows/recommend-anime-flow.ts`
- Use structured JSON output with Zod schemas

### GitHub API (Organization Repos)

- Base URL: `https://api.github.com`
- Organization: `AniTrend`
- Accessed via `src/lib/github-service.ts` and exposed through a REST endpoint at `/api/repositories`
- Query params supported: `?pinned=true|false&starred=true|false&limit=10&username=<user>&sort=updated|created|pushed|full_name`
- Handles 403 rate limits with warnings and sensible fallbacks

## Configuration Notes

### Image Handling

Next.js image domains configured for:

- `placehold.co` - Placeholder images
- `cdn.myanimelist.net` - Anime poster images
- `vzujgysigfwbabgsqcse.supabase.co` - App screenshots
- `anitrend.co` - Brand assets

### TypeScript Settings

- Build errors ignored (`ignoreBuildErrors: true`) for rapid prototyping
- ESLint disabled during `next build`; CI still runs `yarn lint` separately

## Common Tasks

### Adding New AI Flows

1. Create in `src/ai/flows/` with server action pattern
2. Define Zod input/output schemas
3. Export wrapper function for client use
4. Test with `yarn genkit:dev`

Tip: Register flows by importing them in `src/ai/dev.ts` so the Genkit dev server can load them.

### Adding New Pages

1. Follow Next.js 15 app router conventions
2. Server Components for data fetching by default
3. Reuse the shared header and footer through the root layout instead of importing route chrome directly into pages
4. Include appropriate meta tags and structured data

### Styling Components

- Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Extend theme in `tailwind.config.ts` for custom design tokens
- Follow shadcn/ui patterns for component composition

### API Routes

- Add server routes under `src/app/api/*`. Example already present: `GET /api/repositories` delegates to `getRepositoriesForDisplay()` and supports pinned/starred/limit/sort/username query params.

## CI/CD & Secrets

### Container Build & Publish

- Images tagged by branch/sha and `latest` on main.

### Compose

- `compose.dev.yaml` for local dev (bind-mount src/public)
- `compose.prod.yaml` for server deployment pulling `ghcr.io/anitrend/website:latest`

## Agent Customizations

Project-scoped agent customizations live in `.agents/skills/` and `.github/instructions/`.

### Core Skills

- **`anitrend-agentic-workflow`** (`.agents/skills/anitrend-agentic-workflow/SKILL.md`) — Project-specific conventions, CI requirements, tool choices, and implementation patterns. Required before any autonomous work in the repo.
- **`keeping-nextjs-react-tailwind-coherent`** (`.agents/skills/keeping-nextjs-react-tailwind-coherent/SKILL.md`) — Guidance on server vs. client boundaries, metadata placement, state management, shadcn/ui reuse, and token-based responsive styling for Next.js App Router pages and React components.

### Customization Pack

- **`anitrend-ecosystem-awareness`** (`.agents/skills/anitrend-ecosystem-awareness/SKILL.md`) — Website-to-app handoff, deeplink contract awareness, Open-in-App CTAs, and app parity decisions. Required when working on app-facing routes or handoff behavior.
- **`anitrend-metadata-and-social-preview`** (`.agents/skills/anitrend-metadata-and-social-preview/SKILL.md`) — Next.js App Router metadata, Open Graph, Twitter cards, and social preview consistency. Required when adding or editing route-level `metadata` exports.
- **`anitrend-shadcn-extension-patterns`** (`.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md`) — Extending UI primitives with shadcn, `cva`, `cn`, `asChild`, and Tailwind tokens. Required when composing or extending shadcn components.

### Instruction Files

- **`.github/instructions/app-router.instructions.md`** — Next.js App Router conventions: server-first routes, metadata placement, `searchParams` handling, and API normalization. Applied to `src/app/**`.
- **`.github/instructions/deeplink-contract.instructions.md`** — Centralized deep link URI generation, verified URI shapes, analytics, and fallback preservation. Applied to `src/{config,components,app}/**/*.{ts,tsx}`.
