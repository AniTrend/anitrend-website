# React Component and State Guidance

## Purity First

- Keep render pure: no imperative DOM work, mutable shared state, or side effects in render.
- Put user-driven work in event handlers.
- Use Effects only to synchronize with external systems such as subscriptions, timers, browser APIs, or analytics side channels.
- Do not mutate props, context values, or module-level objects during render.

## State Placement

- Keep transient form and UI state close to where it is used.
- Lift state only when multiple components truly need the same source of truth.
- Prefer derived values over duplicated state.
- When switching between logically different entities or forms, consider key-based resets before adding synchronizing Effects.

## Hooks and Custom Hooks

- Extract a custom hook when the same stateful logic repeats, not just because a file is long.
- Custom hooks share logic, not state.
- Keep a custom hook's purpose narrow and data flow explicit.
- Avoid wrapper hooks that hide trivial Effects or lifecycle assumptions.

## Performance Posture

- Default to simple components.
- Reach for `useTransition` when async UI should stay responsive.
- Add `useCallback` or `useMemo` only when identity stability or measured re-render cost justifies it.
- Fix impure rendering or effect churn before adding memoization.

## Repo-Fit Guidance

- Client-heavy pages in AniTrend use local state plus `useTransition` for async UX.
- Prefer typed props and shared types from `src/lib/types.ts`.
- Keep analytics and event logging inside handlers or async actions, not render paths.

## Checklist

- Could this state be derived instead of stored?
- Is an Effect syncing to an external system, or just compensating for structure?
- Is there a smaller child that can own the interactive state?
- Would extracting a hook make intent clearer without hiding important flow?

## Current Repo Examples

- `src/components/discover-client.tsx`
- `src/app/recommend/page.tsx`
