# src/hooks/

## Responsibility

This folder contains client side React hook utilities shared by UI components. The visible hooks cover:

- Toast state access and control through `useToast` and the exported imperative `toast` helper in `use-toast.ts`.
- Mobile viewport detection through `useIsMobile` in `use-mobile.tsx`.

The hooks centralize reusable browser state so components can render responsive UI and transient toast notifications without owning the underlying subscription logic.

## Design

- `use-toast.ts` is a client module with a module scoped store. It keeps `memoryState`, an array of React state listeners, and a timeout map outside React component instances.
- Toast state is changed through a reducer with `ADD_TOAST`, `UPDATE_TOAST`, `DISMISS_TOAST`, and `REMOVE_TOAST` actions. The toast limit is one active toast.
- `toast()` creates a generated id, dispatches an open toast, and returns `id`, `dismiss`, and `update` controls for that toast.
- `useToast()` subscribes the caller to the shared toast store, returns the current toast list, and exposes the `toast` helper plus a global or targeted `dismiss` function.
- Dismissal is two phase. `DISMISS_TOAST` marks matching toasts as `open: false`, then queues delayed removal with `TOAST_REMOVE_DELAY` so UI exit behavior can complete before the item is removed from state.
- `use-mobile.tsx` uses `React.useSyncExternalStore` around `window.matchMedia` and `window.innerWidth`. Its server snapshot returns `false`, which keeps server rendering deterministic until the browser subscription provides the real value.
- The mobile breakpoint is fixed at `768`, with mobile defined as viewport width less than `768px`.

## Flow

Toast flow:

1. A caller invokes `toast(props)` or receives `toast` from `useToast()`.
2. `toast()` generates an id, dispatches `ADD_TOAST`, and sets `open: true` plus an `onOpenChange` callback.
3. `dispatch()` runs the reducer against `memoryState` and notifies every subscribed listener.
4. `useToast()` subscribers update local React state and rerender with the latest `toasts` array.
5. When a toast closes through Radix UI state or a caller invokes `dismiss`, `DISMISS_TOAST` sets `open: false` and queues removal.
6. The removal timeout dispatches `REMOVE_TOAST`, which filters the toast out of shared state.

Mobile breakpoint flow:

1. `useIsMobile()` subscribes to a `matchMedia('(max-width: 767px)')` media query.
2. The current client snapshot is computed from `window.innerWidth < 768`.
3. Media query change events notify React through `useSyncExternalStore`.
4. Consumers rerender when the viewport crosses the breakpoint.

## Integration

- `src/components/ui/toaster.tsx` consumes `useToast()` and renders the shared `toasts` array through the shadcn toast primitives: `ToastProvider`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastClose`, and `ToastViewport`.
- `src/components/anime-preview.tsx` consumes `useIsMobile()` to choose the fetch limit for top anime. Mobile requests three items and desktop requests eight items, then the component renders separate mobile and desktop preview layouts.
- `src/components/ui/sidebar.tsx` consumes `useIsMobile()` inside `SidebarProvider`. The result controls whether `toggleSidebar()` changes `openMobile` for the sheet based mobile sidebar or changes the persisted desktop `open` state.
- The sidebar uses the mobile value again in `Sidebar` to render a `Sheet` with `SIDEBAR_WIDTH_MOBILE` on mobile, while desktop renders the fixed sidebar container and collapse state attributes.
