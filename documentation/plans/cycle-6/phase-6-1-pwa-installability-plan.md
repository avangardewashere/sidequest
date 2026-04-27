# Phase 6.1 - PWA Installability (Execution Plan)

Cycle 6 / Phase 6.1. Companion tracker: `phase-6-1-pwa-installability-tracker.md`.

## Goal

Make SideQuest installable as a PWA by adding a web manifest, a minimal service worker scoped to the public app shell, and a dismissable install prompt — without altering authenticated data flows or caching protected API responses.

## Scope

### In scope

- Web app manifest at `/manifest.webmanifest` with name, short name, icons, theme color, background color, `display: standalone`.
- App-shell service worker registered at `/sw.js`, scoped to `/`, caching only an explicit static-asset allowlist.
- Icon set generated and committed under `public/icons/` (192, 512, plus `apple-touch-icon`).
- `<link rel="manifest">` and `theme-color` meta tags wired through the App Router root layout.
- `useInstallPrompt()` hook that captures `beforeinstallprompt` and persists dismissal for 30 days.
- Install prompt UI banner shown only on `/` and dismissable.
- Lighthouse PWA category target >= 90 verified locally.
- Focused unit tests + one Playwright smoke spec.

### Out of scope

- Offline mutation queue or replay (that is Phase 6.2).
- Push notifications via service worker (kept local-only in 4.6; revisit later).
- iOS-specific hints beyond the standard `apple-touch-icon`.
- Caching of any `/api/*` response.

## Architecture decisions

1. SW scope is `/` but its caching strategy is restricted to a static-asset allowlist; protected API requests pass through to the network unconditionally.
2. The SW is registered from a small client component imported into the root layout — never SSR-only, never auto-registered in dev or test.
3. The install prompt is a presentational banner with state owned by `useInstallPrompt`; it cannot block app rendering.
4. Manifest is served as a static file in `public/`, not as an API route, to bypass the auth middleware matcher entirely.
5. Theme color matches the existing Indigo + Ember tokens (`--color-primary`).

## API/data/component contracts

- Static: `public/manifest.webmanifest`, `public/sw.js`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png`.
- New hook: `src/hooks/useInstallPrompt.ts` exposing `{ status, prompt, dismiss }` where `status ∈ { 'unavailable', 'available', 'dismissed', 'installed' }`.
- New component: `src/components/system/install-prompt.tsx` (banner) — reads from `useInstallPrompt`, mounted on `/` only.
- New component: `src/components/system/service-worker-register.tsx` — registers SW on mount only when `process.env.NODE_ENV === 'production'`.
- Modified: `src/app/layout.tsx` adds `<link rel="manifest">`, `theme-color` meta, and mounts `ServiceWorkerRegister`.

## Testing plan

- Unit/integration:
  - `src/tests/use-install-prompt.test.tsx` — capture event, dismissal persistence, 30-day re-show.
  - `src/tests/service-worker-register.test.tsx` — mounts only in production, no-op otherwise.
- E2E:
  - `e2e/pwa-installability.spec.ts` — manifest is reachable, theme-color meta present, banner renders when prompt fires, dismiss persists across reload.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`
- Lighthouse PWA category >= 90 (manual run, screenshot in evidence).

## Acceptance criteria

- `/manifest.webmanifest` returns 200 with valid JSON and the documented fields.
- `/sw.js` returns 200; service worker registers in production and caches only allowlisted shell paths.
- Install prompt banner appears when `beforeinstallprompt` fires, accepts, dismisses, and respects the 30-day cooldown.
- No `/api/*` response is cached by the SW (verified by DevTools Network panel screenshot in evidence).
- Lighthouse PWA score >= 90 captured in evidence.
- Quality gates pass and closeout docs are updated.
