# Phase 5.6 - Personalization Preferences Editor (Tracker)

Pair with `phase-5-6-personalization-preferences-plan.md`.

Status legend: `[ ]` pending - `[~]` in progress - `[x]` done - `[!]` blocked

Phase status: `[ ]` pending

## A. Contract and scope guardrails

- [ ] Confirm Phase 5.6 introduces no schema changes to `src/models/User.ts`.
- [ ] Confirm Phase 5.6 does not re-trigger or modify the existing `/onboarding` flow.
- [ ] Confirm Phase 5.6 emits no new behavior event names (Phase 5.4 allowlist stays at five).
- [ ] Confirm Phase 5.6 does not modify the Phase 5.5 analytics surface.
- [ ] Confirm Phase 5.6 does not introduce AI/LLM tone preview or A/B variants.

## B. Backend/API

- [ ] Add `src/app/api/you/preferences/route.ts` with a `PATCH` handler only.
- [ ] Reuse the onboarding Zod constraints (`focusArea` enum, `weeklyTarget` integer 1-21, `encouragementStyle` enum) without duplicating new validation rules.
- [ ] Do not touch `onboardingCompletedAt` from the new route.
- [ ] Return `{ onboarding: OnboardingState }` (same shape as `GET /api/onboarding`) on `200`, with stable response shape on both empty and populated saves.
- [ ] Status codes: `200` success, `400` invalid payload, `401` unauthenticated, `404` user missing, `500` unexpected.

## C. UI integration

- [ ] Add a "Personalization preferences" section on `/you` between "Profile basics" and "Password".
- [ ] Wire load via `fetchYouPreferences()` (re-exposed `fetchOnboardingState`) on mount.
- [ ] Wire save via a new `updateYouPreferences()` client action.
- [ ] Use the existing `actionResultToToast` pattern for success / failure feedback.
- [ ] Disable Save while a request is in-flight or while there are no pending changes.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-you-preferences.test.ts` (auth, per-field validation, success path, no `onboardingCompletedAt` mutation, `404` user-missing).
- [ ] Add `src/tests/you-preferences-section.test.tsx` (renders current values, dispatches PATCH on save, save disabled when unchanged, surfaces error toast).
- [ ] Add `e2e/you-preferences.spec.ts` (load `/you`, edit preferences, save, reload reflects new values).
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Append section `22) Cycle 5 - Phase 5.6 closeout (Personalization preferences editor)` to `documentation/status/progress-summary.md`.
- [ ] Mark Phase 5.6 closed in `documentation/plans/cycles/cycles-4-5-6-roadmap.md`, advance Wave 4 numbering, and update `Immediate Next Phase` to point at Phase 6.1 PWA installability (`documentation/plans/cycle-6/phase-6-1-pwa-installability-plan.md`).
- [ ] Append a `Cycle 5 Summary Status` block to `documentation/status/current-status-architecture.md` (Cycle 5 closeout, since Phase 5.6 closes the cycle).
- [ ] Fill the Evidence summary section below at closeout.

## Blockers

- _placeholder_: Local Playwright run is likely to be blocked again by `http://localhost:3000 is already used`, the same environment-only issue documented for Phases 5.3 / 5.4 / 5.5. Record outcome here at closeout.

## Decision log

- 2026-04-27: Add a dedicated `PATCH /api/you/preferences` route instead of overloading `PATCH /api/onboarding`, because the onboarding PATCH re-stamps `onboardingCompletedAt` and requires `complete: true`; reusing it would conflate "first onboarding" with "post-onboarding edits".
- 2026-04-27: New route returns the same `OnboardingState` payload as `GET /api/onboarding`, so `fetchOnboardingState()` can be reused for reads and the UI never needs payload remapping.
- 2026-04-27: Plain controlled inputs and a Save button on `/you`, mirroring the existing "Profile basics" visual style; no new design system primitives are introduced for this phase.
- 2026-04-27: Saving preferences emits no new behavior event; the Phase 5.4 allowlist remains five entries. A future `preferences_updated` event would require both an allowlist update and an analytics surface, neither of which is in scope here.
- 2026-04-27: Phase 5.6 doubles as the Cycle 5 capstone, so its closeout writes a `Cycle 5 Summary Status` block into `documentation/status/current-status-architecture.md`, mirroring the Cycle 4 closeout convention referenced by `documentation/plans/cycle-6/README.md`.

## Out-of-scope confirmations

- [ ] No schema changes to `src/models/User.ts`.
- [ ] No mutation of `onboardingCompletedAt` from the new route.
- [ ] No new behavior event names.
- [ ] No analytics card or analytics route changes.
- [ ] No AI/LLM tone preview or A/B variants.

## Exit criteria

- [ ] `PATCH /api/you/preferences` validates payloads and persists exactly the three onboarding-derived fields.
- [ ] `/you` renders and saves personalization preferences, with success/error toasts, for authenticated users.
- [ ] Tests and quality gates pass.
- [ ] `documentation/status/progress-summary.md`, `documentation/plans/cycles/cycles-4-5-6-roadmap.md`, and `documentation/status/current-status-architecture.md` are updated for the Phase 5.6 closeout and Cycle 5 capstone.

## Evidence summary

- _to fill at closeout_
