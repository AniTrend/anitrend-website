# src/config/

## Responsibility

`src/config` owns static configuration values that are shared across the website. The current configuration surface is `links.ts`, which centralizes external URLs, native app deep links, social links, banner media configuration, and fallback repository metadata.

`links.ts` is the ownership point for exported link constants so consumers do not hardcode AniTrend URLs or native app intent URLs in feature code.

## Design

`links.ts` exports these static and environment-backed values:

- `playStoreUrl`: Google Play listing for the Android app.
- `githubReleasesUrl`: GitHub releases page for `AniTrend/anitrend-app`.
- `discordInviteUrl`: Discord invite URL built from `NEXT_PUBLIC_DISCORD_INVITE_CODE`.
- `githubOrgUrl`: GitHub organization URL for AniTrend.
- `supabaseBannerUrl`: Supabase-hosted banner image URL built from `NEXT_PUBLIC_SUPABASE_BASE_URL`, or `null` when the base URL is not set.
- `fallbackRepos`: Static fallback repository data for `anitrend-app` and `anitrend-api`.

The app deep link model is defined through:

- `AppIntent`: Supported native app intent types.
- `AppIntentStatus`: Verification state for each intent.
- `appIntentStatus`: Per-intent verification status, with `anime-detail` marked `pendingVerification` and the other intents marked `verified`.
- `getAppIntentHref(intent)`: Converts a typed intent into an `app.anitrend://action/...` URL.
- `deepLinks`: Prebuilt deep links for profile, discover, suggestions, social, settings, plus an `anime(id)` helper for anime detail links.

## Flow

Static configuration flows from `links.ts` to application consumers by named imports.

Environment-backed link creation works as follows:

1. `NEXT_PUBLIC_DISCORD_INVITE_CODE` is read into `discordCode`.
2. `discordInviteUrl` is built as `https://discord.gg/${discordCode}`.
3. `NEXT_PUBLIC_SUPABASE_BASE_URL` is read into `supabaseBaseUrl`.
4. `supabaseBannerUrl` is built by appending the banner media path when `supabaseBaseUrl` is present, otherwise it is `null`.

Native app deep link creation works as follows:

1. Consumers pass an `AppIntent` into `getAppIntentHref`, or use `deepLinks` for predefined routes.
2. `getAppIntentHref` maps each supported intent type to an `app.anitrend://action/...` URL.
3. Anime detail links include the dynamic anime id in `app.anitrend://action/anime/{animeId}`.
4. Consumers can check `appIntentStatus` before presenting or relying on a native app intent.

## Integration

Consumers should import configuration from `@/config/links` instead of duplicating URL strings. The exported constants cover app distribution links, source links, community links, native app deep links, banner media, and fallback repository data.

Social link integration is represented by `discordInviteUrl` and `githubOrgUrl`. App distribution integration is represented by `playStoreUrl` and `githubReleasesUrl`. Native app integration is represented by `getAppIntentHref`, `appIntentStatus`, and `deepLinks`.

The consumer contract is:

- Use named exports from `links.ts` as the single source of truth for static link configuration.
- Use `deepLinks` for common native app destinations.
- Use `deepLinks.anime(id)` or `getAppIntentHref({ type: 'anime-detail', animeId: id })` for anime-specific native app destinations.
- Use `fallbackRepos` when repository data needs a static fallback shape with repository name, description, URL, homepage, language, stars, forks, topics, and update timestamp.
