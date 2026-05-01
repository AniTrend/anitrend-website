# Website Cleanup and App Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver three sequenced PRs that unblock Docker deploys, retire the unsupported Genkit recommendation feature, and expand app handoff plus refresh key surfaces with the approved Editorial Neon direction.

**Architecture:** Keep the work split into three reviewable branches. PR 1 is a surgical Docker fix. PR 2 removes the unsupported recommendation feature and all of its repo surface area. PR 3 builds on the cleaned state to expand verified native-app intents and refresh landing, dashboard, header, and footer without changing unrelated backend architecture.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, `next-intl`, Docker, GitHub Actions

---

### Task 1: Create the PR 1 Isolated Workspace

**Files:**

- Modify: `.gitignore` only if a project-local worktree directory must be ignored

- [ ] **Step 1: Inspect worktree location options**

Run: `git rev-parse --show-toplevel`
Expected: repository root path is returned.

- [ ] **Step 2: Prefer an isolated worktree location that will not pollute git status**

Run one of:

```bash
mkdir -p "$HOME/.config/superpowers/worktrees/anitrend-website"
git worktree add "$HOME/.config/superpowers/worktrees/anitrend-website/fix-copy-messages-into-docker-build" -b fix/copy-messages-into-docker-build
```

Expected: new worktree is created on branch `fix/copy-messages-into-docker-build`.

- [ ] **Step 3: Install dependencies in the new worktree**

Run: `yarn install --immutable`
Expected: dependency install completes without mutating `yarn.lock` unexpectedly.

- [ ] **Step 4: Capture a clean baseline before edits**

Run: `yarn build`
Expected: local repository build succeeds before Docker-specific changes.

### Task 2: Implement PR 1 Docker Message Copy Fix

**Files:**

- Modify: `Dockerfile`

- [ ] **Step 1: Write the minimal Dockerfile change**

Update the builder-stage copy list so `messages/` is present before `yarn build` runs.

```dockerfile
COPY src ./src
COPY public ./public
COPY messages ./messages
COPY next.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY components.json ./
```

- [ ] **Step 2: Keep the change surgical**

Do not reorder unrelated build instructions, change the base image, or modify runtime-stage behavior in this PR.

- [ ] **Step 3: Inspect the resulting diff**

Run: `git diff -- Dockerfile`
Expected: only the `COPY messages ./messages` addition appears.

### Task 3: Verify PR 1 End-To-End

**Files:**

- Verify: `Dockerfile`
- Verify: `messages/en/*.json`

- [ ] **Step 1: Verify the app still builds locally**

Run: `yarn build`
Expected: Next.js build exits 0.

- [ ] **Step 2: Verify the Docker build path now includes locale messages**

Run: `docker build -t anitrend-website:pr1-test .`
Expected: image build exits 0 and the prior `Module not found` errors for `messages/en/*.json` do not appear.

- [ ] **Step 3: Confirm worktree status is clean except for intended PR 1 files**

Run: `git status --short`
Expected: only `Dockerfile` is modified unless a worktree-ignore adjustment was intentionally required.

- [ ] **Step 4: Commit the PR 1 change**

```bash
git add Dockerfile
git commit -m "fix(docker): copy locale messages into build stage"
```

Expected: one conventional commit on `fix/copy-messages-into-docker-build`.

### Task 4: Prepare PR 2 Branch After PR 1 Is Merged or Available

**Files:**

- Modify: `package.json`
- Delete: `src/ai/dev.ts`
- Delete: `src/ai/genkit.ts`
- Delete: `src/ai/flows/recommend-anime-flow.ts`
- Delete: `src/app/recommend/**`
- Delete: `src/components/sections/ai-recommender-section.tsx`
- Delete: `messages/en/recommend.json`
- Modify: `src/i18n/request.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/header.tsx`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `.github/instructions/context.instructions.md`

- [ ] **Step 1: Branch from the cleaned base**

Run:

```bash
git worktree add "$HOME/.config/superpowers/worktrees/anitrend-website/refactor-remove-genkit-recommendation-surface" -b refactor/remove-genkit-recommendation-surface
```

Expected: isolated worktree for PR 2 is created.

- [ ] **Step 2: Remove package-level Genkit surface**

Delete scripts `genkit:dev` and `genkit:watch`, and remove dependencies `@genkit-ai/googleai`, `@genkit-ai/next`, `genkit`, and `genkit-cli`.

- [ ] **Step 3: Remove runtime and route files**

Delete the `src/ai` implementation files, `src/app/recommend/**`, and the dedicated AI marketing section component.

- [ ] **Step 4: Remove feature entry points**

Update landing, dashboard, and header so no route or CTA points to `/recommend`.

- [ ] **Step 5: Remove now-dead i18n and docs**

Delete `messages/en/recommend.json`, remove that namespace from `src/i18n/request.ts`, and scrub docs that still describe Genkit or AI recommendation as supported.

- [ ] **Step 6: Verify feature retirement completely**

Run:

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn build
rg -n "genkit|recommendAnime|/recommend|recommendation_request|recommendation_received" src README.md AGENTS.md .github/instructions messages package.json
```

Expected: lint, typecheck, and build pass; grep only returns intentional references if any remain.

- [ ] **Step 7: Commit PR 2**

```bash
git add .
git commit -m "refactor(recommend): remove genkit recommendation surface"
```

### Task 5: Prepare PR 3 Branch for Handoff Expansion and Editorial Refresh

**Files:**

- Modify: `src/config/links.ts`
- Modify: `src/lib/app-handoff.ts`
- Modify: `src/components/app-handoff/open-in-app-button.tsx`
- Modify: `src/components/app-handoff/app-handoff-fallback-dialog.tsx`
- Modify: `src/components/dashboard-open-lists-button.tsx` or replacement shortcut component
- Modify: `src/components/anime-analytics.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/components/sections/hero-section.tsx`
- Modify: `src/components/sections/features-section.tsx`
- Modify: `src/components/sections/app-showcase-section.tsx`
- Modify: replacement section for the removed AI slot
- Modify: `src/app/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts` if global token changes are needed
- Modify: `.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md`

- [ ] **Step 1: Create the PR 3 worktree**

Run:

```bash
git worktree add "$HOME/.config/superpowers/worktrees/anitrend-website/feat-expand-app-handoff-and-editorial-refresh" -b feat/expand-app-handoff-and-editorial-refresh
```

Expected: isolated worktree for PR 3 is created.

- [ ] **Step 2: Expand the centralized app intent contract**

Add verified intents for `discover`, `social`, `suggestions`, and `settings` in `src/config/links.ts`, keeping `anime-detail` as `pendingVerification`.

- [ ] **Step 3: Generalize fallback copy handling**

Update the fallback dialog so it no longer assumes every non-profile intent is anime detail.

- [ ] **Step 4: Expand dashboard-native shortcuts conservatively**

Expose the new verified destinations primarily from the dashboard while keeping web `discover` strong as a first-class web path.

- [ ] **Step 5: Refresh landing and chrome in the approved Editorial Neon direction**

Apply the approved stronger hierarchy, richer dark surfaces, premium header, improved section contrast, and app-value bridge section in the former AI slot.

- [ ] **Step 6: Verify the refreshed handoff and UI behavior**

Run:

```bash
yarn lint
yarn typecheck
yarn build
```

Then manually verify landing, dashboard, discover, and anime detail behavior in the browser, including app-handoff fallback states.

- [ ] **Step 7: Commit PR 3**

```bash
git add .
git commit -m "feat(marketing): expand app handoff and refresh editorial surfaces"
```

### Task 6: Push and Open PRs Without Committing Scratch Files

**Files:**

- Verify: `.superpowers/` remains untracked and unstaged
- Verify: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Confirm `.superpowers/` is not staged**

Run: `git status --short`
Expected: `.superpowers/` does not appear in staged changes for any PR branch.

- [ ] **Step 2: Push each branch with upstream tracking**

Run one per branch:

```bash
git push -u origin fix/copy-messages-into-docker-build
git push -u origin refactor/remove-genkit-recommendation-surface
git push -u origin feat/expand-app-handoff-and-editorial-refresh
```

- [ ] **Step 3: Create each PR with the repository template structure**

Use `gh pr create` with a body derived from `.github/PULL_REQUEST_TEMPLATE.md`, adapting the base branch to the repository's active target branch at time of creation.

- [ ] **Step 4: Verify PR metadata and checks**

Run: `gh pr view --json number,title,baseRefName,headRefName,url` and `gh pr checks <number>`
Expected: the branch names, titles, and base branches match the intended rollout.
