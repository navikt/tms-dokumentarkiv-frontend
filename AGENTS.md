# tms-dokumentarkiv-frontend

Astro 7 SSR app that shows the documents a person has sent to or received from Nav, also on behalf of someone who has given them a power of attorney ("fullmakt"), at `nav.no/dokumentarkiv` in nb, nn and en. React 19, Aksel 8 (`--ax-*` tokens), TypeScript 5, pnpm 10, Node 24.

## Commands

- Install: `pnpm install`. The `@navikt` packages need a GitHub token with `read:packages` in `~/.npmrc`; if install fails on auth, stop and ask.
- Dev: `pnpm run dev`, served at `http://localhost:4321/dokumentarkiv`. `@navikt/astro-mocks` answers the browser's backend calls inside it: each entry in `src/mocks/dokumentarkiv.ts` is a route at the origin root, and its `path` must equal the path of the `local` URL in `src/urls.client.ts` that fetches it.
- Before you say a change is done: `pnpm run verify` (`astro check`, then Vitest). Vitest only runs `test/unit/**/*.test.{ts,tsx}`: put unit tests there, in the folder that mirrors the source file's, and import from `src/` with the `@src/*` alias.
- When a page, visible text or anything in `src/mocks/` changed: `pnpm run test:e2e`. The Playwright specs in `test/integration` assert on visible text in nb, nn and en, the mock data, the locale redirects and accessibility (axe). Playwright starts the dev server itself, or reuses one already running on port 4321. Needs `pnpm exec playwright install chromium` once.
- Biome runs in the husky pre-commit hook (lint-staged) on staged JS, TS, JSON and Astro files (formats, sorts imports, applies safe lint fixes) and stops the commit on errors it cannot fix. For CSS, run `pnpm exec biome check --write <file>` yourself. Never run it on `nais/*/nais.yaml` (it rewrites `{{ image }}`) or on the whole repo: `biome check .` is not clean on main.

## Rules

- Use the `astro` skill before editing `.astro`, `.tsx`, `.ts` or `.css` files. If `/astro` or `/commit` is missing, tell the developer to trust this folder in Copilot CLI and start a new session.
- Ask first before changing authentication (`src/middleware.ts`, `@navikt/astro-auth`, the ID-porten redirect in `src/utils/client/redirect.ts`), `astro.config.mjs`, `nais/` or `.github/workflows/` (a push to `main` runs `deploy-main.yaml` for dev and prod), or anything that logs personal data, and before adding a dependency or a server-side backend call (no page makes one, and `accessPolicy.outbound` in the nais files allows only nav-dekoratoren).
- The backend (mine-saker-api) is called from the browser: `client:only="react"` islands fetch with SWR and `fetcher` from `src/utils/client/api.ts`. A new call is an export in `src/urls.client.ts` plus a mock. Islands import URLs only from `src/urls.client.ts`; `src/urls.ts` reads `process.env` and is for server-rendered code.
- Pages are in `src/pages/[locale]/`. `src/middleware.ts` redirects every path without a locale prefix to `/dokumentarkiv/nb/...`, except paths containing `/internal/`, so an endpoint in `src/pages/api/` outside `internal/` and a `server:defer` section are never reached. Ask first before using `server:defer`.
- New visible text goes in nb, nn and en in `src/language/text.ts`, read as `text.key[language]`; leave old hardcoded strings alone.
- Never send a document title, a person's name or an ident to analytics (`src/utils/client/analytics.ts`): titles are free text and can hold personal data.
