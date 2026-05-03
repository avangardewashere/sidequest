# Phase 9.6 — PWA shell minimum

## Artifacts

- **`public/manifest.json`** — `name`, `short_name`, `theme_color`, `background_color`, `display: standalone`, icons **192** / **512** (maskable purpose where applicable).
- **`src/app/layout.tsx`** — `viewport.themeColor` for light/dark; `metadata.manifest` → `/manifest.json`.
- **`public/sw.js`** — Install event: precache app shell (`/` + manifest); fetch handler: cache-first or stale network for `GET` `/api/*` (SW best-effort; app works without SW).
- **Client registration** — Register SW in production after load (avoid dev HMR conflicts).
- **Install banner** — Listen for `beforeinstallprompt`; dismiss persists ~30 days in `localStorage`.

## Verification

- Manual Lighthouse PWA category ≥ 90 when run locally against production build (CI integration deferred).
