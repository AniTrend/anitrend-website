# src/app/

## Responsibility

Owns the Next.js App Router surface for the website. This folder defines the shared root shell, route level pages, the global loading fallback, server actions, and API route handlers that expose app scoped behavior.

Route entry points:

- `/`: marketing landing page composed from section components and marketing data.
- `/dashboard`: server rendered hub page with app shortcuts, discover shortcuts, and recommendation teasers.
- `/discover`: server rendered route that parses query parameters, fetches the initial anime list, then hydrates the interactive discover client.
- `/anime/[id]`: server rendered anime detail route that loads anime and character data by route parameter.
- `/api/repositories`: API route for repository display data.

## Design

- `layout.tsx` is the single root layout. It sets document metadata defaults, loads Google font variables, applies global dark theme classes, installs `NextIntlClientProvider`, and wraps every route with `AppHeader`, `AppFooter`, analytics, consent UI, and the toaster.
- Route pages are async server components by default. They fetch server side data, create route specific props, and delegate interactive behavior to client components when needed.
- Route metadata is generated server side through `generateMetadata` where a route needs its own title or description. The root layout owns global metadata defaults and route pages override or extend them.
- Server components use `getTranslations` from `next-intl/server` for page copy and metadata strings. Client components rendered under the root provider use `useTranslations` from `next-intl`.
- Data normalization and external API details stay in `src/lib`. Pages call lib functions such as `getRepositoriesForDisplay`, `getShowcaseScreenshots`, `getTopAnime`, `searchAnime`, `getAnimeById`, and `getAnimeCharacters`, then pass ready to render values into components.
- UI composition stays in `src/components`. App routes import marketing sections, dashboard widgets, anime analytics actions, shadcn UI primitives, and client shells rather than owning reusable component logic.
- `actions.ts` contains server action logic. `submitContactForm` validates input with Zod, returns localized success or error messages, and keeps the action boundary under the App Router tree.
- `loading.tsx` provides the App Router fallback skeleton for route segment loading and mirrors the global page shell enough to avoid a blank transition.

## Flow

1. A request enters the App Router and is wrapped by `RootLayout`.
2. `RootLayout` resolves the locale and message bundle through `next-intl/server`, passes them to `NextIntlClientProvider`, and renders shared shell components around the selected child route.
3. The selected route page runs on the server:
   - `/` fetches metadata copy, builds the feature list, loads pinned repositories with a static fallback, gets showcase screenshots, and renders marketing sections.
   - `/dashboard` loads dashboard copy, builds discover shortcut links, fetches upcoming anime teasers, and renders dashboard widgets plus teaser cards.
   - `/discover` awaits `searchParams`, sanitizes query values into `TopAnimeFilters`, chooses `searchAnime` when `q` is present or `getTopAnime` otherwise, then passes initial state to `DiscoverClient`.
   - `/anime/[id]` awaits the dynamic `id`, fetches anime details and characters, calls `notFound()` when no anime is returned, and renders the detail layout with client side tracking and app handoff controls.
   - `/api/repositories` parses `NextRequest` query parameters, calls `getRepositoriesForDisplay`, and returns JSON or a 500 error response.
4. Client components receive serialized initial state and continue browser side behavior. Examples include discover filtering and pagination, anime view analytics, share actions, open in app actions, consent controls, and toast display.
5. Server actions can be invoked from client or server consumers. `submitContactForm` validates submitted values on the server and returns a simple `{ success, message }` result object.

## Integration

- `src/lib`: supplies repository, screenshot, anime, Firebase, and shared type utilities consumed by route pages and client components.
- `src/components`: supplies the route shell, landing sections, dashboard widgets, interactive discover experience, anime action controls, analytics components, consent banner, toaster, and shadcn UI primitives.
- `src/config/links`: provides external URLs, app handoff status, and static fallback repository data used by landing and anime action flows.
- `src/i18n`: provides the default locale and request configuration used by `next-intl`. App routes consume it indirectly through `getLocale`, `getMessages`, `getTranslations`, `NextIntlClientProvider`, and component level `useTranslations`.
- Next.js App Router conventions connect files to runtime behavior: `layout.tsx` wraps every route, `page.tsx` files define pages, `loading.tsx` supplies the loading state, `actions.ts` exposes server actions, `[id]` creates a dynamic segment, and `route.ts` defines an API handler.
