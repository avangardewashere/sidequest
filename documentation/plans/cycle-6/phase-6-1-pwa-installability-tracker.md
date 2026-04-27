# Phase 6.1 - PWA Installability (Tracker)

Pair with `phase-6-1-pwa-installability-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[ ]` pending

## A. Contract and scope guardrails

- [ ] Confirm SW caching is allowlist-only (no `/api/*`).
- [ ] Confirm manifest is a static file under `public/`.
- [ ] Confirm install prompt is dismissable and never blocks render.
- [ ] Confirm offline queue work is deferred to Phase 6.2.

## B. Static assets and shell

- [ ] Generate icon set (192, 512, apple-touch) into `public/icons/`.
- [ ] Add `public/manifest.webmanifest` with documented fields.
- [ ] Add `public/sw.js` with allowlist cache strategy.

## C. UI and hooks

- [ ] Add `src/hooks/useInstallPrompt.ts`.
- [ ] Add `src/components/system/install-prompt.tsx`.
- [ ] Add `src/components/system/service-worker-register.tsx` (production-only).
- [ ] Wire `<link rel="manifest">` + `theme-color` meta in `src/app/layout.tsx`.
- [ ] Mount install prompt in the Today/Focus shell only.

## D. Validation and tests

- [ ] Add `src/tests/use-install-prompt.test.tsx`.
- [ ] Add `src/tests/service-worker-register.test.tsx`.
- [ ] Add `e2e/pwa-installability.spec.ts`.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`
- [ ] Lighthouse PWA score >= 90 (capture screenshot).

## E. Docs and closeout

- [ ] Add Phase 6.1 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 6.1 status.
- [ ] Record evidence summary below.

## Blockers

- None yet.

## Decision log

- YYYY-MM-DD: Choose icon source (existing brand asset vs generated placeholder).
- YYYY-MM-DD: Confirm SW scope `/` and static-allowlist policy.

## Out-of-scope confirmations

- [ ] No `/api/*` caching in SW.
- [ ] No offline mutation queue.
- [ ] No push notification handlers.

## Exit criteria

- [ ] Manifest + SW + icons in place; install prompt functional.
- [ ] Lighthouse PWA >= 90.
- [ ] Tests and quality gates pass.
- [ ] Closeout docs updated.

## Evidence summary

- (Filled in at closeout.)
