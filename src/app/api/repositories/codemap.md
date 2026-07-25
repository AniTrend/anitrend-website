# src/app/api/repositories/

## Responsibility

Expose `GET /api/repositories` as a JSON endpoint for repository cards. The route parses repository display options from the request URL, delegates all GitHub fetching and shaping to `getRepositoriesForDisplay`, then returns the shaped array through `NextResponse.json`.

## Design

The route is intentionally thin. It does not call GitHub directly and it does not transform GitHub API payloads itself. Query values are converted into the option shape expected by `src/lib/github-service.ts`:

- `starred`: true only when the query value is exactly `true`, otherwise false.
- `pinned`: false only when the query value is exactly `false`, otherwise true by default.
- `limit`: parsed with `parseInt`, defaulting to `10` when absent.
- `username`: passed as a string when present, otherwise `undefined`.
- `sort`: defaults to `updated` and is cast to one of `created`, `updated`, `pushed`, or `full_name` without runtime validation.

The service returns display objects with this shape: `name`, `description`, `url`, `homepage`, `language`, `stars`, `forks`, `topics`, and `updatedAt`.

## Flow

1. `GET` receives a `NextRequest` and reads `request.url` through `new URL(request.url)`.
2. Parsed query options are passed to `getRepositoriesForDisplay`.
3. `getRepositoriesForDisplay` selects the service path:
   - `starred=true`: calls `getStarredRepositories(username, ...)`, using only `created` or `updated` sort values and fetching up to `Math.min(limit * 2, 100)`.
   - `starred=false` and `pinned=true`: calls `getPinnedRepositories(limit)`.
   - `pinned=false`: calls `getAniTrendRepositories({ sort, direction: 'desc', per_page: 100 })`.
4. Pinned repositories are fetched from the AniTrend organization, transformed, deduplicated, scored, sorted by score, sliced to the requested limit, and stripped of the temporary `score` field.
5. Organization repository fetches call `https://api.github.com/orgs/AniTrend/repos` with GitHub API headers, filter out private and archived repositories, transform GitHub fields into the internal `Repository` type, and remove duplicates by id.
6. Starred repository fetches call `https://api.github.com/users/{username}/starred`, filter out private repositories, transform records, and remove duplicates by id.
7. `getRepositoriesForDisplay` slices to `limit`, maps internal repositories into the smaller display shape, and returns the array.
8. The route returns the array as JSON. If any error reaches the route, it logs `API Error:` and returns `{ error: 'Failed to fetch repositories' }` with status `500`.

## Integration

GitHub fetches use Next.js server fetch caching where configured. Organization repository requests revalidate after 300 seconds. Starred repository requests revalidate after 600 seconds. A failed starred repository request falls back to AniTrend organization repositories. A failed organization repository request is logged and rethrown, which makes the route return a 500 response.

Visible consumers include `src/components/repository-showcase.tsx`, which fetches `/api/repositories?starred=${starred}&limit=6` when toggling between organization and starred repositories. `src/app/page.tsx` uses `getRepositoriesForDisplay` directly for the initial landing page data and falls back to `fallbackRepos` if that server side call fails.
