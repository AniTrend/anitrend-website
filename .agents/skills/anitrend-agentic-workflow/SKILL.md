---
name: anitrend-agentic-workflow
description: Use when working autonomously in the AniTrend website repository and needing project-specific conventions, CI requirements, tool choices, or implementation patterns before making changes.
---

# AniTrend Agentic Workflow Skill

This skill turns the repository's agent guidance into concrete execution steps. Use it to stay aligned with AniTrend conventions while working with minimal supervision.

## Objective

- Enable autonomous agents to complete development tasks without human intervention
- Ensure all work respects project conventions, CI/CD pipelines, and type safety
- Minimize context switching by providing clear, step-by-step workflows
- Maintain consistency across feature implementation, bug fixes, and infrastructure changes

## When to Use This Skill

Use this skill when:

- Starting a new feature, bug fix, or refactoring task
- Integrating with external APIs (Jikan, Genkit, GitHub, Firebase)
- Adding or modifying AI flows in `src/ai/flows/`
- Preparing for deployment or release
- Unsure about project conventions or workflows
- Validating work against CI/CD requirements

## Tool Selection & Patterns

### For Context Discovery

Prefer **local inspection** first, then GitHub CLI:

| Task                          | Tool                                             | Why                                   |
| ----------------------------- | ------------------------------------------------ | ------------------------------------- |
| Verify branch naming format   | `git branch -a` + local `.github/branch-lint.sh` | Already in checkout                   |
| Check recent commits          | `git log --oneline -20`                          | Fast, local, confirms pattern         |
| Validate package.json scripts | `cat package.json` + read_file                   | No need for remote call               |
| Inspect workflow files        | read_file on `.github/workflows/*.yml`           | Authoritative, local reference        |
| Check for CI failures         | GitHub UI or `gh run list`                       | Real-time status, no local equivalent |

Prefer **GitHub CLI** for:

- Current PR status and review comments
- Checking branch protection rules
- Triggering manual workflow dispatch
- Validating remote branch state

### For Browser-Based Validation

Use **open_browser_page + screenshot_page** when:

- Verifying UI changes visually (dev server at `http://localhost:9002`)
- Testing responsive design across breakpoints
- Confirming Genkit AI flow output
- Validating analytics tracking (Firebase events)
- Reviewing metadata rendering (Open Graph tags)

**Example workflow**:

```bash
# Terminal 1: Start dev server
yarn dev  # Port 9002

# Then use browser tools:
# open_browser_page("http://localhost:9002/discover")
# screenshot_page(pageId)  # Capture current state
# click_element(pageId, "Add to Watchlist button")
# screenshot_page(pageId)  # Verify interaction
```

## Workflow: Standard Feature Implementation

Follow this sequence for implementing any feature:

### 1. **Branch Setup** (git convention)

```bash
git fetch origin
git checkout -b feat/your-feature-name
# Branch name: feat/<kebab-case-description>
# Examples: feat/add-anime-filters, feat/enhance-recommendation-ui
```

**Validation**: The `.github/branch-lint.sh` pre-commit hook enforces format automatically.

### 2. **Development & Type Safety**

- Write TypeScript with **strict mode** (no `any`, no unsafe casts)
- Use **Zod schemas** for external API responses
- Follow **shadcn/ui patterns** for new UI components
- Store configuration in `.env.local`, never hardcode

**Key files to reference**:

- `src/lib/types.ts` — Shared interfaces (Anime, RepoInfo, etc.)
- `src/lib/utils.ts` — `cn()` utility for conditional Tailwind classes
- `tsconfig.json` — TypeScript strict settings
- `.env.example` — Required environment variables

### 3. **Local Validation** (pre-push gate)

```bash
# Run full validation suite
yarn lint        # ESLint (must pass cleanly)
yarn typecheck   # TypeScript (strict mode)
yarn build       # Next.js build to .next/
yarn test:e2e    # Playwright tests (requires yarn dev running)
```

**Stop here if any step fails** — fix issues before push.

### 4. **Commit with Conventional Format**

```bash
git add .
git commit -m "feat: add anime filter to discover page"
# Format: <type>(<optional-scope>): <message>
# Types: feat, fix, chore, docs, refactor, test, build, ci, revert
```

### 5. **Push & Open PR**

```bash
git push origin feat/your-feature-name
# Open PR on GitHub, use PULL_REQUEST_TEMPLATE.md format
```

**PR requirements**:

- Title: Clear, descriptive summary
- Description: What problem does this solve?
- Checklist: Tests added, docs updated (if needed), breaking changes noted

### 6. **Wait for CI** (automated)

GitHub Actions runs:

- **ci.yml**: Lint → TypeScript → Build (on every push to main)
- **Automated checks**: Branch protection prevents merge if CI fails

**If CI fails**:

```bash
# Fix the issue locally, commit, push
git add .
git commit -m "fix: resolve linting error in anime-card component"
git push origin feat/your-feature-name
# CI re-runs automatically
```

### 7. **Merge** (human approval + CI pass)

Once CI passes and human review approves, merge via GitHub UI.

---

## Workflow: Adding an AI Flow

AI flows live in `src/ai/flows/` and use the **server-side pattern**.

### 1. **Create flow file** with Zod schema

```typescript
// src/ai/flows/my-recommendation-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InputSchema = z.object({
  animeGenres: z.array(z.string()),
  userPreferences: z.string(),
});

const OutputSchema = z.object({
  recommendedAnimeIds: z.array(z.string()),
  reasoning: z.string(),
});

type Input = z.infer<typeof InputSchema>;
type Output = z.infer<typeof OutputSchema>;

const prompt = ai.definePrompt({
  name: 'myRecommendationPrompt',
  input: { schema: InputSchema },
  output: { schema: OutputSchema },
  prompt: `Recommend anime that matches the user's preferences.`,
});

const recommendationFlow = ai.defineFlow(
  {
    name: 'myRecommendationFlow',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to generate recommendation');
    }

    return output;
  }
);

// Export wrapper for client
export async function getRecommendation(input: Input): Promise<Output | null> {
  try {
    return await recommendationFlow(input);
  } catch (error) {
    console.error('Flow failed:', error);
    return null; // Graceful fallback
  }
}
```

### 2. **Register in dev.ts**

```typescript
// src/ai/dev.ts (add import for side-effect)
import '@/ai/flows/my-recommendation-flow'; // Side-effect import
```

This makes the flow discoverable in Genkit dev server.

### 3. **Test locally**

```bash
# Terminal 1: Start Genkit dev server
yarn genkit:dev
# Opens UI at http://localhost:4000

# Terminal 2: Use browser to test flow
# open_browser_page("http://localhost:4000")
# Invoke flow, verify input/output, check for errors
```

### 4. **Integrate UI component**

```typescript
// src/app/recommend/recommend-client.tsx (or new component)
'use client'

import { getRecommendation } from '@/ai/flows/my-recommendation-flow'

export function RecommendationUI() {
  const [result, setResult] = useState<Output | null>(null)

  const handleRecommend = async () => {
    const output = await getRecommendation(input)
    setResult(output)  // Will be null if flow fails (graceful)
  }

  return (
    // UI component
  )
}
```

### 5. **Validate & PR**

Follow standard feature workflow (lint → typecheck → build → test → commit → push).

---

## Workflow: Integrating External APIs

Reference implementation pattern from `src/lib/`:

### For Jikan API (Anime Data)

```typescript
// src/lib/anime-service.ts pattern
const BASE_URL = 'https://api.jikan.moe/v4/';

export async function getTopAnime(page = 1): Promise<Anime[]> {
  try {
    const res = await fetch(`${BASE_URL}top/anime?page=${page}&limit=25`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();

    // Transform to internal Anime type
    return data.data.map((anime) => ({
      id: anime.mal_id.toString(),
      title: anime.title_english || anime.title,
      posterUrl: anime.images?.jpg?.image_url,
      rating: anime.score,
      // ... map all fields
    }));
  } catch (error) {
    console.error('Jikan API failed:', error);
    return []; // Graceful fallback
  }
}
```

**Key pattern**:

1. Always wrap in try-catch
2. Return sensible default on error (empty array, null, etc.)
3. Never expose raw API response to UI
4. Transform to internal `types.ts` schema
5. Add rate-limit delays for batch requests

### For Genkit (AI Model)

Already covered in "Adding an AI Flow" workflow above.

### For GitHub API

```typescript
// src/lib/github-service.ts pattern
const BASE_URL = 'https://api.github.com';

export async function getOrgRepos(org: string) {
  try {
    const res = await fetch(`${BASE_URL}/orgs/${org}/repos`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        // Optional: add Authorization header if available
      },
    });

    if (res.status === 403) {
      console.warn(`GitHub API rate limit exceeded`);
      return []; // Fallback
    }

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    // Transform and return
  } catch (error) {
    console.error('GitHub API failed:', error);
    return [];
  }
}
```

---

## Workflow: Preparing a Release

Releases are **automated by tags** — your job is to prepare and trigger.

### 1. **Update version in package.json**

```json
{
  "version": "1.2.3" // Follows semver (major.minor.patch)
}
```

### 2. **Document changes**

Create or update release notes, and update `CHANGELOG.md` only if the repository is maintaining one, noting:

- **Breaking Changes** (if any)
- **New Features**
- **Bug Fixes**

### 3. **Create release branch & commit**

```bash
git checkout -b release/v1.2.3
git add package.json
git commit -m "chore: prepare release v1.2.3"
git push origin release/v1.2.3
```

### 4. **Open PR, get approval, merge to main**

Once merged, trigger the next step.

### 5. **Tag & push** (triggers deploy.yml)

```bash
git tag v1.2.3
git push origin v1.2.3
```

**Automation kicks in**:

- `deploy.yml` validates release
- Builds Docker image: `ghcr.io/anitrend/website:v1.2.3`
- Triggers SSH remote deploy
- Creates GitHub Release page

### 6. **Verify deployment**

Check GitHub Release page for status, monitor container registry for image push.

---

## Workflow: Debugging Failed CI

When GitHub Actions CI fails:

### 1. **Inspect CI logs**

- Go to PR → "Checks" tab
- Click failing job (e.g., "Lint & Type Check")
- Review error output

### 2. **Reproduce locally**

```bash
# Simulate CI exactly
yarn install --immutable  # Use frozen lockfile
yarn lint                 # Exact command from ci.yml
yarn typecheck            # Exact command from ci.yml
yarn build                # Exact command from ci.yml
```

### 3. **Fix the issue**

Common failures:

- **ESLint error**: `yarn lint --fix` to auto-fix
- **TypeScript error**: Fix type annotation or add explicit type
- **Build error**: Check for runtime errors, missing imports, or outdated dependencies

### 4. **Commit & push**

```bash
git add .
git commit -m "fix: resolve build error in animation component"
git push origin feat/your-feature
```

CI re-runs automatically.

---

## Key Constraints & Guardrails

### ✅ MUST DO

- Use **Yarn** (not npm or pnpm) — immutable lockfile enforced
- Run **full validation** locally before push: `yarn lint && yarn typecheck && yarn build && yarn test:e2e`
- Write **strict TypeScript** — no `any`, no unsafe casts without justification
- Use **Zod** for external API schema validation
- Handle **API errors gracefully** — always provide fallbacks
- **Follow branch naming**: `<type>/<kebab-case>`
- **Use conventional commits**: `type(scope): message`
- **Update `context.instructions.md`** if making architectural changes (per `update-context.instructions.md`)
- **Environment variables**: Use `.env.local` locally, GitHub Secrets for CI/CD

### ❌ MUST NOT DO

- Commit secrets or hardcoded keys (use `.env.example` as reference)
- Skip ESLint or TypeScript checks
- Modify Docker base images without approval
- Change Node version (pinned at 22)
- Merge PRs without passing CI (GitHub branch protection enforces this)
- Use `any` type in TypeScript
- Add dependencies without testing full build

---

## Environment Variables

### Local Development (`.env.local` — git-ignored)

```env
# Google Genkit AI
GOOGLE_GENKIT_API_KEY=<your-api-key>

# Firebase (optional, for analytics)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
# ... other Firebase config

# Reference: See .env.example for all available vars
```

### CI/CD (GitHub Secrets)

Set up in GitHub repository settings → Secrets and variables → Actions:

- `GOOGLE_GENKIT_API_KEY` — Genkit API key
- `DOCKER_REGISTRY_TOKEN` — For GHCR push
- SSH keys for remote deploy

---

## Quick Reference

### Common Commands

```bash
# Development
yarn dev                    # Next.js dev server (port 9002)
yarn genkit:dev             # Genkit AI dev server (port 4000)
yarn genkit:watch           # Watch mode for AI flows

# Validation
yarn lint                   # ESLint check
yarn typecheck              # TypeScript check
yarn build                  # Production build
yarn test:e2e               # Playwright e2e tests

# Git
git checkout -b feat/name   # Create feature branch
git commit -m "feat: ..."   # Conventional commit
git push origin feat/name   # Push to remote
git tag v1.2.3              # Create release tag
git push origin v1.2.3      # Push tag (triggers deploy)
```

### File Locations

| Purpose                 | Path                                           |
| ----------------------- | ---------------------------------------------- |
| Agentic workflows guide | `.github/instructions/AGENTS.md`               |
| Architecture reference  | `.github/instructions/context.instructions.md` |
| Git validation script   | `.github/branch-lint.sh`                       |
| CI/CD workflows         | `.github/workflows/`                           |
| AI flows                | `src/ai/flows/`                                |
| API clients             | `src/lib/`                                     |
| Type definitions        | `src/lib/types.ts`                             |
| Shared utilities        | `src/lib/utils.ts`                             |

### Troubleshooting

| Issue                    | Solution                                                   |
| ------------------------ | ---------------------------------------------------------- |
| Port 9002 already in use | `lsof -i :9002` then `kill -9 PID`                         |
| Yarn lock conflicts      | `yarn install --immutable` (respect frozen lock)           |
| TypeScript strict errors | Check `tsconfig.json`, use explicit types instead of `any` |
| ESLint failures          | `yarn lint --fix` to auto-fix                              |
| Build cache stale        | `rm -rf .next && yarn build`                               |
| Genkit API errors        | Verify `GOOGLE_GENKIT_API_KEY` in `.env.local`             |

---

## Integration with AGENTS.md

This skill is the **executable guide** for `AGENTS.md`. Whenever you reference AGENTS.md for:

- Branch/commit conventions
- CI/CD workflows
- Architecture patterns
- API integration
- Testing & validation

...this skill provides the **step-by-step workflow** to implement it.

---

## References

- **Full Guide**: `.github/instructions/AGENTS.md` (authoritative reference)
- **Architecture**: `.github/instructions/context.instructions.md`
- **Project Repo**: https://github.com/AniTrend/anitrend-website
- **Genkit Docs**: https://firebase.google.com/docs/genkit
- **shadcn/ui**: https://ui.shadcn.com/
- **Zod Docs**: https://zod.dev/

---

**Skill Version**: 1.0  
**Last Updated**: April 2026  
**Alignment**: AGENTS.md + context.instructions.md

For questions about this skill or AniTrend project conventions, consult the referenced guides or open an issue in the repository.
