# src/i18n/

## Responsibility

Owns the application locale contract and the `next-intl` request configuration.
It defines which locales the app supports, exposes the default locale, and
provides the request scoped messages that `next-intl` uses across server and
client rendering.

## Design

- `config.ts` is the locale source of truth. `defaultLocale` is `en`, `locales`
  contains only that locale, and `AppLocale` is derived from the tuple so type
  checks stay aligned with the configured values.
- `isSupportedLocale(value)` is the runtime guard for narrowing arbitrary
  strings to `AppLocale`.
- `request.ts` exports the default `getRequestConfig` result consumed by
  `next-intl`. It pins each request to `defaultLocale` and assembles the
  namespaced message object through dynamic imports from `messages/en`.
- The message namespaces are loaded by key and exposed as one messages object,
  which keeps component consumers independent from individual JSON file paths.

## Flow

1. Next.js starts with `next.config.ts`, where `createNextIntlPlugin` is pointed
   at `./src/i18n/request.ts`.
2. For each request, `next-intl` evaluates the request config and receives the
   locale plus the namespaced messages.
3. Server components call `getTranslations`, `getLocale`, or `getMessages` from
   `next-intl/server`. These calls resolve against the request config from this
   folder.
4. `src/app/layout.tsx` reads the locale and messages, writes the locale to the
   root `<html lang>` attribute, and passes both into `NextIntlClientProvider`.
5. Client components call `useTranslations` and read from the provider messages
   already prepared for the active request.

## Integration

- `next.config.ts` wires `next-intl` into the Next.js build and runtime by
  wrapping the exported config with the plugin created from `src/i18n/request.ts`.
- `src/app/layout.tsx` is the bridge from request configuration to the React
  tree. It supplies locale and messages to `NextIntlClientProvider` for every
  route.
- Server side consumers include root metadata, app actions, route pages, the
  header, footer, and marketing sections through `getTranslations`.
- Client side consumers include anime cards, analytics consent UI, dashboard
  shortcuts, discovery UI, app handoff dialogs, settings, and shared UI
  primitives through `useTranslations`.
