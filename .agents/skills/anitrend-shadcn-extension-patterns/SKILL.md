---
name: anitrend-shadcn-extension-patterns
description: Use when extending AniTrend UI primitives with shadcn, cva, asChild, or Tailwind tokens instead of duplicating components or scattering raw classes.
argument-hint: Which primitive or UI pattern needs extending?
---

# AniTrend Shadcn Extension Patterns

## Overview

Use this skill when a UI change belongs in an existing primitive, variant, or wrapper rather than a brand new component tree. Prefer extension over duplication.

## When to Use

- Adding a new variant or size to `src/components/ui/**`
- Deciding between inline composition, wrapper component, and `cva` variant
- Reusing Tailwind tokens across multiple surfaces
- Wrapping `Link` or custom interactive elements with `asChild`

Do not use this skill for route metadata or app-handoff decisions unless the component also emits an app CTA.

## Decision Table

| Need                                           | Prefer                                   |
| ---------------------------------------------- | ---------------------------------------- |
| named visual state or size                     | `cva` variant                            |
| small composition around an existing primitive | wrapper with `asChild` where appropriate |
| one-off local layout detail                    | inline Tailwind classes                  |

## Procedure

1. Start from the nearest existing primitive in `src/components/ui/**`.
2. Reuse `cn()` and existing tokens before introducing new raw values.
3. Add a `cva` variant when consumers need intentional switching.
4. Use a wrapper only when composition improves readability without hiding behavior.
5. Keep the final API smaller than the duplication it replaces.

## Repo Anchors

- `src/components/ui/button.tsx`
- `src/lib/utils.ts`
- `src/app/globals.css`
- `tailwind.config.ts`

## References

- [Primitive extension guide](./references/primitive-extension.md)

## Common Mistakes

- Duplicating a primitive instead of adding a variant
- Hardcoding colors or spacing already represented by tokens
- Using custom CSS for a problem React composition already solves
- Skipping `asChild` and creating unnecessary wrapper markup
