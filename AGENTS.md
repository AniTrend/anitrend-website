# AGENTS.md — Agentic Workflow Guide

This document is the **authoritative guide for autonomous AI agents** working in the AniTrend website repository. It defines workflows, constraints, and patterns that enable agents to execute tasks efficiently with minimal human intervention.

## Project Snapshot

- **Type**: Next.js 15 landing website with AI-powered anime recommendations
- **Stack**: React 19, TypeScript, Tailwind CSS, shadcn/ui, Google Genkit (Gemini 2.0)
- **Package Manager**: Yarn 4.9.2 (frozen lockfile, immutable installs)
- **Node Version**: 22 LTS
- **Primary Environments**: Development (port 9002), Production (Docker), CI/CD (GitHub Actions)
- **Deployment**: Self-hosted Docker (GHCR) with SSH remote deploy

---

## I. Git Workflow & Branch Conventions

### Branch Naming

**Format**: `<type>/<kebab-case-description>`

**Valid types**:

- `feat/` — New feature
- `fix/` — Bug fix
- `chore/` — Routine tasks (deps, build processes)
- `docs/` — Documentation only
- `refactor/` — Code restructure (no behavior change)
- `test/` — Test additions/fixes
- `build/` — Build system changes
- `ci/` — CI configuration changes
- `revert/` — Revert previous commit

**Examples**:

- `feat/add-open-graph-support`
- `fix/correct-anime-card-layout`
- `docs/update-contributing-guidelines`

**Enforcement**: Use `.github/branch-lint.sh` in local hooks or CI to validate branch names.

### Commit Strategy

- **Conventional Commits**: Follow conventional commit format (`type(scope): message`)
- **Semantic Versioning**: Release versions follow semver (enforced by `release-drafter-config.yml`)
- **Squash commits**: Prefer logical, atomic commits over many small WIP commits
- **Default branch**: `main` (not `master` or `dev`)

### Pull Request Workflow

1. **Create feature branch** from `main`
2. **Open PR** with descriptive title and body (use [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md))
3. **Run CI/CD**: Lint, type-check, build, test suite must pass
4. **Request review**: Wait for human review before merge
5. **Merge strategy**: GitHub's default (fast-forward or merge commit)

---

## II. Continuous Integration & Deployment Pipeline

### CI/CD Workflows (`.github/workflows/`)

#### 1. **ci.yml** — Lint, Type-Check, Build (on push/PR to main)

- Runs on: Ubuntu latest
- Node 22, Yarn 4.9.2
- Steps:
  - Checkout code
  - Enable Corepack
  - Install deps (immutable)
  - **Lint** (`yarn lint` — ESLint)
  - **Type-check** (`yarn typecheck` — TypeScript)
  - **Build** (`yarn build` — Next.js)
  - Verify `.next` output directory exists

**Agent task**: Always verify CI passes before requesting merge.

#### 2. **deploy.yml** — Docker Build & Push (on `dev`, tags, or manual dispatch)

- Validates release version (checks for alpha/beta/rc)
- Builds Docker image (multi-stage, Next.js standalone)
- Pushes to GitHub Container Registry: `ghcr.io/anitrend/website:<version>`
- Triggers SSH remote deploy to self-hosted server
- Compose file: `compose.prod.yaml` (Traefik reverse proxy assumed)

**Agent task**: Expect deploys from `dev` pushes and tags; use manual workflow dispatch when a non-default deployment target is needed.

#### 3. **release-drafter.yml** — Release Notes Drafting

- Triggered on pushes to `main` and PR updates
- Updates the draft release notes using `release-drafter-config.yml`
- Labels and groups changes for the next release

**Agent task**: Keep PR titles and labels accurate so release drafts stay useful.

### Local CI Simulation

Before pushing, agents should simulate CI:

```bash
# Run full CI suite locally
yarn lint && yarn typecheck && yarn build

# Run e2e tests (requires app running on port 9002)
yarn dev &  # Start dev server in background and wait for readiness in logs
yarn test:e2e
kill %1     # Stop background job
```

---

## III. Development Environment Setup

### Prerequisites

```bash
# Node 22 (use nvm, asdf, or jenv)
node --version  # ≥22.0.0

# Yarn 4.9.2
yarn --version  # ≥4.9.2
corepack enable # For Node 16.20+, 18.17+, 20+
```

### Initial Setup

```bash
cd <repo-root>
corepack enable
yarn install --immutable  # Use frozen lockfile
```

### Development Servers

```bash
# Terminal 1: Next.js dev server (port 9002, Turbopack)
yarn dev

# Terminal 2: Genkit AI flow dev server (watches src/ai/dev.ts)
yarn genkit:dev

# Terminal 3: Genkit watch mode (auto-reload flows)
yarn genkit:watch
```

### Common Commands

| Command           | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `yarn dev`        | Start Next.js dev server (port 9002)       |
| `yarn genkit:dev` | Start Genkit AI dev runtime                |
| `yarn build`      | Build for production (outputs to `.next/`) |
| `yarn start`      | Start production Next.js server            |
| `yarn lint`       | Run ESLint validation                      |
| `yarn typecheck`  | Run TypeScript type-checking               |
| `yarn test:e2e`   | Run Playwright end-to-end tests            |
| `yarn prepare`    | Install Husky pre-commit hooks             |

---

## IV. Project Architecture & Patterns

### Directory Structure (Key Paths)

```
src/
  ├── ai/                        # Genkit AI flows & configuration
  │   ├── dev.ts                 # Flow registration (side-effect import)
  │   ├── genkit.ts              # Genkit client init
  │   └── flows/
  │       └── recommend-anime-flow.ts
  ├── app/                       # Next.js app router
  │   ├── page.tsx               # Landing page (/)
  │   ├── layout.tsx             # Root layout
  │   ├── actions.ts             # Server actions
  │   ├── globals.css            # Global styles
  │   ├── api/                   # API routes
  │   │   ├── repositories/      # GET /api/repositories (GitHub orgs)
  │   │   └── analytics/         # Firebase analytics endpoint
  │   ├── anime/[id]/            # Dynamic anime detail page
  │   ├── dashboard/             # Hub page
  │   ├── discover/              # Anime grid browser
  │   └── recommend/             # AI recommendation UI
  ├── components/
  │   ├── sections/              # Landing page sections (hero, features, etc.)
  │   ├── ui/                    # shadcn/ui primitives
  │   ├── analytics.tsx          # Firebase event tracking wrapper
  │   └── anime-*.tsx            # Anime-specific components
  ├── lib/
  │   ├── anime-service.ts       # Jikan API client
  │   ├── github-service.ts      # GitHub API client
  │   ├── firebase.ts            # Firebase config & client
  │   ├── types.ts               # Shared TypeScript interfaces
  │   └── utils.ts               # Utility functions (cn, classnames)
  ├── config/
  │   └── links.ts               # App deep-link URLs, social links
  ├── hooks/
  │   ├── use-mobile.tsx         # Mobile breakpoint hook
  │   └── use-toast.ts           # Toast notification hook
  └── types/
      └── (type definitions)
```

### AI Flow Architecture (Server-Side Pattern)

**Location**: `src/ai/flows/`

**Pattern**:

```typescript
'use server'; // Mark as server action

// Zod schema for validation
const schema = z.object({
  /* ... */
});

// Internal flow implementation
async function flowImpl(input: Input): Promise<Output> {
  // Fetch external data (e.g., Jikan API)
  // Call Genkit model with prompt
  // Return structured output
}

// Wrapper for client consumption
export async function flowName(input: Input): Promise<Output> {
  return flowImpl(input);
}
```

**Registration**: Import in `src/ai/dev.ts` (side-effect) so Genkit dev server discovers flows.

**Testing flows**: Use `yarn genkit:dev` then test via UI at `http://localhost:4000`.

### Data Fetching Patterns

**API Pattern**:

```typescript
// Jikan API (no auth, public)
const animeData = await fetch('https://api.jikan.moe/v4/top/anime')
  .then((res) => res.json())
  .catch(() => ({ data: [] })); // Graceful fallback

// GitHub API (public, rate-limited)
const repoData = await fetch(`https://api.github.com/orgs/AniTrend/repos`, {
  headers: { Accept: 'application/vnd.github.v3+json' },
});
```

**Caching strategy**:

- Server Components: Use `next: { revalidate: N }` for static/ISR
- Server Actions: Cache external API responses in-memory per request
- Client: Use React query patterns (if added in future)

**Error handling**: Always provide fallback UI or null return to prevent crashes.

### Routing Structure

| Route               | Component                   | Type            | Purpose                             |
| ------------------- | --------------------------- | --------------- | ----------------------------------- |
| `/`                 | `page.tsx`                  | Static          | Landing page (marketing)            |
| `/dashboard`        | `dashboard/page.tsx`        | Dynamic         | Hub with shortcuts & teaser         |
| `/discover`         | `discover/page.tsx`         | Server + Client | Anime grid browser (Jikan API)      |
| `/recommend`        | `recommend/page.tsx`        | Server Action   | AI recommendation interface         |
| `/anime/[id]`       | `anime/[id]/page.tsx`       | Dynamic         | Anime detail page (Jikan API)       |
| `/api/repositories` | `api/repositories/route.ts` | API Route       | Get GitHub org repos (query params) |

### UI Component Conventions

- **Base**: shadcn/ui (Radix UI + Tailwind CSS)
- **Typography**: `font-headline` (Space Grotesk) for titles, `font-body` (Inter) for text
- **Colors**: Dark theme, purple primary (`#BB86FC`), teal accents
- **Responsive**: Mobile-first, container-based layouts
- **Class utils**: `cn()` from `src/lib/utils.ts` for conditional Tailwind classes

**Example**:

```typescript
import { cn } from '@/lib/utils'

export function Card({ variant = 'default', ...props }) {
  return (
    <div className={cn(
      'rounded-lg border p-4',
      variant === 'elevated' && 'shadow-md'
    )} {...props} />
  )
}
```

---

## V. External API Integrations

### MyAnimeList (Jikan API)

**Base URL**: `https://api.jikan.moe/v4/`

**Authentication**: None (public API)

**Key Endpoints**:

- `GET /top/anime?page=<n>&limit=<n>` — Top anime by rank
- `GET /anime/<mal_id>` — Anime details
- `GET /recommendations/anime` — Random recommendations

**Rate Limiting**: Respectful limits; add delays in batch requests.

**Type Mapping** (normalize to internal `Anime` interface):

```typescript
const anime: Anime = {
  id: data.mal_id.toString(),
  title: data.title_english || data.title,
  description: data.synopsis,
  posterUrl: data.images?.jpg?.image_url,
  rating: data.score,
  // ... more fields
};
```

### Google Genkit (Gemini 2.0)

**Model**: `googleai/gemini-2.0-flash`

**Pattern**:

```typescript
const prompt = ai.definePrompt({
  name: 'recommendAnimePrompt',
  input: { schema: RecommendAnimeInputSchema },
  output: { schema: RecommendAnimeOutputSchema },
  prompt: `Recommend an anime based on the user's request.`
})

const recommendAnimeFlow = ai.defineFlow(
  {
    name: 'recommendAnimeFlow',
    inputSchema: RecommendAnimeInputSchema,
    outputSchema: RecommendAnimeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input)

    if (!output) {
      throw new Error('Failed to generate anime recommendation')
    }

    return output
  }
})
```

**Output**: Use Zod schemas for structured JSON output.

**Environment**: Requires `GOOGLE_GENKIT_API_KEY` in `.env.local`.

### GitHub API (Organization Repos)

**Endpoint**: `GET https://api.github.com/orgs/AniTrend/repos`

**Exposed via**: `/api/repositories` with query params:

- `pinned=true|false` — Filter pinned repos
- `starred=true|false` — Filter starred repos
- `limit=10` — Number of results
- `sort=updated|created|pushed|full_name` — Sort order

**Rate Limit Handling**: Graceful fallback on 403; log warning.

**Client**: `src/lib/github-service.ts` with response transform.

### Firebase (Analytics & Config)

**Purpose**: User analytics, feature flags, A/B testing

**Client Config**: `src/lib/firebase.ts`

**Tracking**: Wrap events in `src/components/analytics.tsx` wrapper.

**Environment**: Requires Firebase config keys in `.env.local`.

---

## VI. Testing & Validation

### Unit & Integration Tests

**Runner**: Playwright (`@playwright/test`)

**Config**: `playwright.config.ts`

**Test files**: `tests/*.spec.ts`

**Run tests**:

```bash
# Requires app running on port 9002
yarn dev &  # Wait for the server to report readiness before continuing
yarn test:e2e

# Or use Playwright UI
npx playwright test --ui
```

**Test patterns**:

- Page loads: Navigate and check for key elements
- Forms: Fill fields, submit, verify success/error
- API integration: Mock or use real API (be mindful of rate limits)
- Animations: Skip in headless mode (`{ timeout: 0 }` in playwright.config)

### TypeScript & ESLint

**TypeScript**: Strict mode enabled (check `tsconfig.json`)

**ESLint**: Configured in `eslint.config.js` (flat config format)

**Pre-commit**: Husky hooks validate commits (install with `yarn prepare`)

**Local validation**:

```bash
yarn lint      # ESLint check
yarn typecheck # TypeScript check
yarn build     # Full build simulation
```

---

## VII. Common Agent Workflows

### A. Adding a New Feature

1. **Create branch**: `git checkout -b feat/your-feature`
2. **Develop**: Write code, update types, add tests
3. **Local validation**: `yarn lint && yarn typecheck && yarn build && yarn test:e2e`
4. **Commit**: Use conventional format (`feat: add X feature`)
5. **Push**: `git push origin feat/your-feature`
6. **Open PR**: Use [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)
7. **Wait for CI**: GitHub Actions runs lint/type-check/build
8. **Merge**: Once CI passes and human review is complete

### B. Fixing a Bug

1. **Create branch**: `git checkout -b fix/bug-name`
2. **Reproduce**: Add failing test or verify issue locally
3. **Fix**: Implement minimal change to fix root cause
4. **Test**: Run full test suite, verify fix works
5. **Commit**: `fix: resolve issue with X`
6. **PR & merge**: Follow standard workflow

### C. Adding a New AI Flow

1. **Create file**: `src/ai/flows/<flow-name>-flow.ts`
2. **Define schema**: Use Zod for input/output validation
3. **Implement**: Mark with `'use server'`, fetch data, call Genkit
4. **Export wrapper**: Client-facing async function
5. **Register**: Import in `src/ai/dev.ts` (side-effect)
6. **Test**: Run `yarn genkit:dev`, test via UI
7. **Integrate UI**: Add client component in `src/app/recommend/` or similar
8. **PR & deploy**: Standard workflow

### D. Updating Dependencies

1. **Review changes**: `git diff HEAD^..HEAD package.json`
2. **Test**: Run full CI suite (`yarn lint && yarn typecheck && yarn build && yarn test:e2e`)
3. **Commit**: `chore: update dependencies`
4. **Monitor**: Check for any build/runtime issues post-deploy

### E. Preparing a Release

1. **Create release branch**: `git checkout -b release/v1.2.3`
2. **Update version**: In `package.json` (matches semver tag)
3. **Update CHANGELOG**: Document breaking changes, features, fixes
4. **Merge to main**: Create PR, wait for CI, merge
5. **Tag**: `git tag v1.2.3 && git push origin v1.2.3`
6. **Deploy**: Push the release tag to trigger `deploy.yml`, or use manual dispatch when needed
7. **Monitor**: Check GitHub Container Registry for image, verify remote deploy

---

## VIII. Constraints & Guardrails

### What Agents MUST Do

- Follow branch naming conventions (validate with `.github/branch-lint.sh` in hooks or CI)
- Write types: TypeScript strict mode, no `any`
- Run `yarn lint && yarn typecheck && yarn build` before PR
- Use Zod for external API schema validation
- Follow shadcn/ui component patterns (don't reinvent)
- Handle API errors gracefully (provide fallbacks)
- Document breaking changes in PR description
- Update `/.github/instructions/context.instructions.md` for architectural changes
- Respect `.env.example` for required environment variables
- Use `yarn` (not `npm` or `pnpm`)

### What Agents MUST NOT Do

- Commit secrets (API keys, tokens) — use environment variables
- Ignore ESLint warnings (code must lint cleanly)
- Skip TypeScript checks (build will fail)
- Modify Docker base images without approval
- Change Node version without coordinating (CI uses Node 22)
- Hardcode configuration (use `.env.local` for local dev)
- Merge PRs without passing CI (GitHub branch protection enforces this)
- Add dependencies without updating `package.json` and testing

### Environment Variables

**Required for local dev** (create `.env.local`):

```
GOOGLE_GENKIT_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
# ... other Firebase config keys
```

**Never commit**: `.env.local` is git-ignored.

**Reference**: `.env.example` lists all expected variables.

---

## IX. Quick Reference

### File Locations

| Purpose               | Path                                                    |
| --------------------- | ------------------------------------------------------- |
| Git branch validation | `.github/branch-lint.sh`                                |
| CI/CD workflows       | `.github/workflows/`                                    |
| PR template           | `.github/PULL_REQUEST_TEMPLATE.md`                      |
| Issue templates       | `.github/ISSUE_TEMPLATE/`                               |
| Context instructions  | `.github/instructions/context.instructions.md`          |
| Context update guide  | `.github/instructions/update-context.instructions.md`   |
| Main config           | `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` |
| ESLint config         | `eslint.config.js`                                      |
| Playwright config     | `playwright.config.ts`                                  |
| Compose (dev)         | `compose.dev.yaml`                                      |
| Compose (prod)        | `compose.prod.yaml`                                     |

### Useful Commands

```bash
# Development
yarn dev                    # Start Next.js dev server
yarn genkit:dev             # Start Genkit AI dev server
yarn build                  # Production build

# Validation
yarn lint                   # ESLint check
yarn typecheck              # TypeScript check
yarn test:e2e               # Playwright e2e tests

# Git
git branch -D <branch>      # Delete local branch
git branch -a               # List all branches
git remote -v               # List remotes
git log --oneline -10       # Last 10 commits

# Docker (local compose)
docker-compose -f compose.dev.yaml up  # Start local dev containers
docker-compose -f compose.dev.yaml ps  # List running containers
```

---

## X. For Humans: Reviewing Agent Work

### PR Review Checklist

When reviewing agent-created PRs:

- [ ] Branch name follows `<type>/<kebab-case>` format
- [ ] Commits use conventional format (`type(scope): message`)
- [ ] CI/CD pipeline passes (lint, type-check, build, tests)
- [ ] No hardcoded secrets or environment-specific values
- [ ] Types are strict (no `any`, no `as` casts without justification)
- [ ] External API integrations have error handling
- [ ] UI components follow shadcn/ui patterns
- [ ] **Documentation updated**: If architecture changed, `context.instructions.md` was updated
- [ ] Breaking changes documented in PR description
- [ ] Tests added/updated (if applicable)

### Merging Policy

1. **All CI checks pass** (GitHub branch protection enforces)
2. **Code review approval** (1 human required)
3. **No merge conflicts** (rebase if needed)
4. **Squash or merge**: Project preference is conventional commits per feature

---

## XI. Troubleshooting

### Build Failures

```bash
# Clear cache & reinstall
rm -rf .next node_modules
yarn install --immutable
yarn build

# Check for TypeScript errors
yarn typecheck --pretty
```

### Port Conflicts

- Dev server: 9002 (check `yarn dev` output)
- Genkit dev UI: 4000 (check `yarn genkit:dev` output)
- Use `lsof -i :PORT` to find process, `kill -9 PID` to stop

### API Rate Limits

- Jikan: Respectful rate limits, add delays for batch requests
- GitHub: 60 req/hr unauthenticated, 5000/hr authenticated
- **Fallbacks**: Always provide graceful degradation when APIs fail

### Yarn Lock Issues

```bash
# Don't manually edit yarn.lock; use:
yarn install --immutable  # Respect frozen lockfile
yarn add <package>        # Add dependency (updates lock)
yarn upgrade <package>    # Update dependency (updates lock)
```

---

## XII. Links & References

- **Repository**: https://github.com/AniTrend/anitrend-website
- **Issues**: https://github.com/AniTrend/anitrend-website/issues
- **PRs**: https://github.com/AniTrend/anitrend-website/pulls
- **Container Registry**: https://ghcr.io/anitrend/website
- **Genkit Docs**: https://firebase.google.com/docs/genkit
- **shadcn/ui**: https://ui.shadcn.com/
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zod**: https://zod.dev/

---

**Last Updated**: April 2026  
**Maintainer**: AniTrend Core Team  
**Version**: 1.0

For issues or suggestions regarding this guide, open an issue or discussion in the repository.
