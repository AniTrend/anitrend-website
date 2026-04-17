---
name: keeping-nextjs-react-tailwind-coherent
description: Use when adding or editing Next.js App Router pages, React components, or Tailwind styles in the AniTrend website and you need guidance on server vs client boundaries, metadata, state placement, shadcn/ui reuse, or token-based responsive styling.
argument-hint: What page, component, or styling change needs to stay coherent?
---

# Keeping Next.js, React, and Tailwind Coherent

## Overview

Use this skill to keep AniTrend UI work aligned with the repo's actual stack: Next.js App Router, React 19, shadcn/ui primitives, and token-driven Tailwind styling. Prefer existing repo patterns before introducing new abstractions.

## When to Use

- Adding or changing pages under `src/app/`
- Splitting server and client responsibilities
- Building or extracting reusable UI components
- Adding Tailwind classes, variants, or design tokens
- Touching route metadata, images, loading states, or responsive layouts

Do not use this skill for:

- Pure backend or deployment changes with no UI or component impact
- AI flow internals unless they affect route, component, or state boundaries

## Decision Table

| If you need...                                               | Prefer...                                  |
| ------------------------------------------------------------ | ------------------------------------------ |
| metadata, direct data fetching, or secure-only logic         | Server Component page or layout            |
| state, transitions, browser APIs, or `next/navigation` hooks | Child Client Component with `'use client'` |
| a repeated visual pattern across files                       | Extracted React component or `cva` variant |
| a one-off layout tweak using existing tokens                 | Inline Tailwind utilities                  |
| a new spacing, color, or typography pattern across screens   | Design token update, then component usage  |

## Procedure

1. Classify the change.
   - Route or layout and metadata
   - Data loading and transformation
   - Client interaction and local state
   - Reusable section or primitive
   - Styling, tokens, and responsive layout

2. Set the server/client boundary.
   - Keep `page.tsx` and `layout.tsx` server-first by default.
   - Export `metadata` or `generateMetadata` from the server file.
   - Move interactivity into a leaf client component instead of promoting the whole route to client.

3. Reuse repo primitives before building new ones.
   - Check `src/components/ui/` for a primitive.
   - Check `src/components/sections/` for marketing-page structure.
   - Use `cn()` from `src/lib/utils.ts` and `cva` when a component has named variants.

4. Keep data and state in the right place.
   - Fetch on the server when the data is needed at render time.
   - Keep API normalization in `src/lib/*.ts` and shared contracts in `src/lib/types.ts`.
   - Keep component state local and derived when possible.
   - Use Effects only for external synchronization, not for simple derivations.

5. Style with tokens, not ad hoc values.
   - Prefer semantic utilities like `bg-background`, `text-muted-foreground`, `border-border`, and `font-headline`.
   - Reuse the `container` layout and existing spacing rhythm.
   - Add raw hex or arbitrary values only when the design requires something not already represented by tokens or variants.

6. Validate coherence before finishing.
   - Mobile-first layout still works at desktop sizes.
   - Route-level pages have accurate metadata.
   - Interactive elements have keyboard and focus support.
   - Client boundary is minimal.
   - `yarn lint` and `yarn typecheck` stay clean for the touched area.
   - Use browser verification when the change affects visible UI behavior.

## Repo Anchors

- App shell and global metadata: `src/app/layout.tsx`
- Theme tokens and base styles: `src/app/globals.css`
- Tailwind theme and container rules: `tailwind.config.ts`
- Utility merge helper: `src/lib/utils.ts`
- Variant composition example: `src/components/ui/button.tsx`
- Server-to-client split example: `src/app/discover/page.tsx` and `src/components/discover-client.tsx`

## References

- [Next.js route and boundary guidance](./references/nextjs.md)
- [React component and state guidance](./references/react.md)
- [Tailwind and design-system guidance](./references/tailwind.md)
- [Repo-specific patterns and checklist](./references/repo-patterns.md)

## Common Mistakes

- Marking an entire route as client because one child needs state
- Putting metadata logic inside a client component
- Using Effects to mirror props or derive obvious state
- Duplicating a primitive that should be a `cva` variant or `asChild` composition
- Hardcoding colors or spacing when tokens already exist
- Letting API transformation leak into presentational JSX
