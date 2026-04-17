# Curated App Route Contract

This contract records currently known AniTrend app deeplink actions for website handoff decisions.

## Provenance

- Evidence base: AniTrend Android app route evidence listed in `docs/superpowers/specs/2026-04-17-anitrend-customization-pack-design.md`.
- Reviewed source set: curated Android route evidence from `anitrend-v2` plus current website emitters in this repository.
- Reviewed reference branch for app evidence: `AniTrend/anitrend-v2` `develop`.
- Review date: 2026-04-17. Re-verify when the Android app routing model changes.

Verification labels used here:

- Verified: verified against the Android app evidence base above (not merely because the website emits the URI).
- Pending verification: present or usable on the website, but app-scheme parity and native handling still require re-verification before expanded reliance.

## Known Actions

| Action       | URI pattern                         | Contract status      | App evidence (Android evidence base)                                                    | Website evidence                                                                           |
| ------------ | ----------------------------------- | -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| profile      | `app.anitrend://action/profile`     | Verified             | Included in reviewed `anitrend-v2` app route evidence set (2026-04-17)                  | Emitted in `src/app/dashboard/page.tsx`; also defined in `src/config/links.ts`             |
| discover     | `app.anitrend://action/discover`    | Verified             | Included in reviewed `anitrend-v2` app route evidence set (2026-04-17)                  | No current emitting surface documented                                                     |
| social       | `app.anitrend://action/social`      | Verified             | Included in reviewed `anitrend-v2` app route evidence set (2026-04-17)                  | No current emitting surface documented                                                     |
| suggestions  | `app.anitrend://action/suggestions` | Verified             | Included in reviewed `anitrend-v2` app route evidence set (2026-04-17)                  | No current emitting surface documented                                                     |
| settings     | `app.anitrend://action/settings`    | Verified             | Included in reviewed `anitrend-v2` app route evidence set (2026-04-17)                  | No current emitting surface documented                                                     |
| anime detail | `app.anitrend://action/anime/{id}`  | Pending verification | Requires explicit app-scheme parity confirmation in Android app before upgrading status | Emitted in `src/components/anime-analytics.tsx`; also constructed in `src/config/links.ts` |

## Handoff Guidance

- Prefer constants in `src/config/links.ts` for any route already represented there.
- For verified actions without web emitters, treat additions as low-risk but still validate analytics and UX intent.
- For pending verification actions (currently anime detail), preserve existing behavior but verify native route compatibility before introducing new surfaces or route variants.

## Maintenance Rules

- Update this file whenever new app routes are introduced or route confidence changes.
- Keep route status, app evidence, and website evidence separate so "implemented in web" is not conflated with "native contract validated."
