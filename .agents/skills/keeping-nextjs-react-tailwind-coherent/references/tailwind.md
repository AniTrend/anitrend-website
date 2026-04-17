# Tailwind and Design-System Guidance

## Token-First Styling

- Prefer semantic utilities mapped to repo tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-secondary`, and `text-primary-foreground`.
- Reuse `font-body` and `font-headline`.
- Let `tailwind.config.ts` and `src/app/globals.css` define the visual system. Extend them before scattering new hardcoded values.

## Composition Rules

- For reused UI, extract a React component or a `cva` variant instead of copying long class strings across files.
- Use `cn()` to merge conditional classes and avoid conflicting utilities.
- Use `asChild` composition on shadcn components when wrapping `Link` or custom interactive wrappers.
- Keep custom CSS minimal; use it mainly for base tokens or styling content you do not control.

## Layout and Responsive Design

- Stay mobile-first.
- Reuse the repo's `container` convention and spacing rhythm before inventing new wrappers.
- Prefer gap, grid, and flex utilities over manual margins when composing sections.
- Use responsive variants to progressively enhance layouts, not separate mobile and desktop markup.

## Visual Consistency

- The repo is dark-theme first and uses HSL and CSS variable tokens.
- Motion should be purposeful and fast; reuse existing animation tokens or `tailwindcss-animate` patterns.
- Arbitrary values are acceptable only when there is a clear design reason and no existing token or utility fits.

## When to Add a Token or Variant

Add a token when:

- the value will recur across multiple components
- the value represents brand or system meaning

Add a `cva` variant when:

- a component has named visual states or sizes
- consumers need to switch styles intentionally

Keep it inline when:

- it is a one-off composition detail
- the meaning does not extend beyond that component

## Checklist

- Did I use semantic tokens before raw color values?
- Would a variant make this clearer than repeated conditional classes?
- Does the layout still read cleanly at `md` and `lg`?
- Did I avoid `@apply` or custom CSS for something React composition already solves?

## Current Repo Examples

- `src/app/globals.css`
- `tailwind.config.ts`
- `src/components/ui/button.tsx`
