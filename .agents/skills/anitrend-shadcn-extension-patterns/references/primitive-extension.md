# Primitive Extension Guide

## Current Repo Facts

- `src/components/ui/button.tsx` is the primary extension pattern: it uses `cva` for variants/sizes, `VariantProps` for type-safe props, `cn()` for class merging, and `asChild` with Radix `Slot` for semantic composition.
- `src/lib/utils.ts` exports `cn()` built from `clsx` and `tailwind-merge`.
- `src/app/globals.css` defines token variables in `:root`/`.dark` and applies base styles with `@apply border-border` and `@apply bg-background text-foreground`.
- `tailwind.config.ts` is token-first: `darkMode: ['class']`, centered `container`, font families (`body`, `headline`, `code`), semantic colors mapped to CSS vars, token-driven border radii, and animation/keyframe extensions.

## Use a Variant When

- The same primitive needs a named visual style.
- Consumers need to switch styles intentionally.
- The style belongs to a stable API surface shared across screens.

## Use a Wrapper When

- You are combining a primitive with a consistent icon, label, or composition pattern.
- `asChild` keeps semantics correct when wrapping `Link` or another interactive element.
- The wrapper improves call-site readability without concealing important props.

## Keep It Inline When

- The change is isolated to one surface.
- The style does not need a named API.
- Extracting a variant would increase API weight without reducing duplication.

## Repo Anchors

- `src/components/ui/button.tsx`
- `src/lib/utils.ts`
- `src/app/globals.css`
- `tailwind.config.ts`

## Review Questions

- Would adding a variant remove duplication across more than one surface?
- Is this wrapper hiding too much behavior?
- Did I use semantic tokens before raw values?
- Did I preserve the existing `cn(cva(...))` and `asChild` composition style used by core primitives?
