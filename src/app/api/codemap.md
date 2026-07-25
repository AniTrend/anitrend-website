# src/app/api/

## Responsibility

The API namespace contains App Router route handlers that expose server-side data providers to the website through JSON endpoints. Its current public route is `/api/repositories`, which returns GitHub repository data for display in product and community surfaces.

This namespace owns request parsing, response shaping at the HTTP boundary, and graceful error responses for API consumers. Provider-specific fetching and normalization stay outside the route handler in library services.

## Design

- Routes use Next.js `route.ts` files and `NextRequest` plus `NextResponse` for the HTTP contract.
- Route handlers stay thin. They read query parameters, coerce simple values, call a provider service, and return JSON.
- Provider logic is delegated to `@/lib/github-service` through `getRepositoriesForDisplay`, keeping GitHub API concerns out of the route namespace.
- The repositories endpoint supports query driven behavior: `starred`, `pinned`, `limit`, `username`, and `sort`.
- `pinned` defaults to enabled unless explicitly set to `false`, and `sort` defaults to `updated`.

## Flow

1. A client requests `/api/repositories` with optional query parameters.
2. The route reads `request.url` and extracts `searchParams`.
3. Boolean, numeric, and enum-like options are derived from the query string.
4. The route calls `getRepositoriesForDisplay` with the derived options.
5. The service returns repository records ready for display.
6. The route returns those records as JSON.
7. If any error reaches the route handler, it logs the API error and returns `{ "error": "Failed to fetch repositories" }` with status `500`.

## Integration

The API namespace is the server boundary between frontend consumers and provider services. `/api/repositories` is related to the GitHub provider through `@/lib/github-service`, but it does not call GitHub directly. This keeps provider configuration, external request details, repository filtering, and display mapping in the service layer.

Provider route relationship:

- `/api/repositories` maps HTTP query input to `getRepositoriesForDisplay` options.
- `@/lib/github-service` owns the GitHub organization or user repository lookup, sorting, filtering, and display transformation.
- Frontend components can depend on the route contract without depending on GitHub API response shapes.
