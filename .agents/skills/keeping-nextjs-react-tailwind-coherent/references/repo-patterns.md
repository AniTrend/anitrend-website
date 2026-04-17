# Repo Patterns and Completion Checklist

## Existing Patterns to Preserve

| Area               | Pattern                                                         | Example                                                               |
| ------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| pages and layouts  | server-first route files with metadata                          | `src/app/page.tsx`, `src/app/discover/page.tsx`, `src/app/layout.tsx` |
| client interaction | isolated `'use client'` component receiving typed initial props | `src/components/discover-client.tsx`                                  |
| UI primitives      | shadcn or Radix plus `cva` plus `cn`                            | `src/components/ui/button.tsx`                                        |
| service layer      | external API calls in `src/lib` with normalized app types       | `src/lib/anime-service.ts`, `src/lib/github-service.ts`               |
| marketing sections | route assembles section components, section owns markup         | `src/app/page.tsx`, `src/components/sections/*`                       |

## Working Process

1. Identify whether the change belongs to a route, shared component, section, or service layer.
2. Start from the nearest existing pattern file and mirror its boundary choices.
3. Only introduce a new primitive, hook, token, or variant if an existing one cannot express the need cleanly.
4. Keep SEO, accessibility, and responsive behavior part of the first implementation, not a cleanup task.

## Completion Checklist

- User-facing pages expose accurate metadata.
- Shared UI reuses existing primitives or extends them intentionally.
- Search params, props, and service results are typed.
- No unnecessary `'use client'` at the route boundary.
- Tailwind classes use existing tokens, fonts, and layout conventions.
- Any changed UI was sanity-checked in a browser or with screenshots.
- Lint and typecheck pass for the touched area.
- If architecture changed, update `.github/instructions/context.instructions.md`.

## Escalation Points

- If a new visual pattern repeats across more than one surface, convert it into a token or reusable component.
- If a client component starts fetching, parsing, and orchestrating too much data, push orchestration back to a server page or service.
- If a file needs several Effects to stay in sync, revisit the state structure before adding more Effects.
