# Phase 5.6 - Personalization Preferences Editor (Tracker)

Pair with `phase-5-6-personalization-preferences-plan.md`.

Status legend: `[ ]` pending - `[~]` in progress - `[x]` done - `[!]` blocked

Phase status: `[x]` done

## A. Contract and scope guardrails

- [x] Confirm Phase 5.6 introduces no schema changes to `src/models/User.ts`.
- [x] Confirm Phase 5.6 does not re-trigger or modify the existing `/onboarding` flow.
- [x] Confirm Phase 5.6 emits no new behavior event names (Phase 5.4 allowlist stays at five).
- [x] Confirm Phase 5.6 does not modify the Phase 5.5 analytics surface.
- [x] Confirm Phase 5.6 does not introduce AI/LLM tone preview or A/B variants.

## B. Backend/API

- [x] Add `src/app/api/you/preferences/route.ts` with a `PATCH` handler only.
- [x] Reuse the onboarding Zod constraints (`focusArea` enum, `weeklyTarget` integer 1-21, `encouragementStyle` enum) without duplicating new validation rules.
- [x] Do not touch `onboardingCompletedAt` from the new route.
- [x] Return `{ onboarding: OnboardingState }` (same shape as `GET /api/onboarding`) on `200`, with stable response shape on both empty and populated saves.
- [x] Status codes: `200` success, `400` invalid payload, `401` unauthenticated, `404` user missing, `500` unexpected.

## C. UI integration

- [x] Add a "Personalization preferences" section on `/you` between "Profile basics" and "Password".
- [x] Wire load via `fetchYouPreferences()` (re-exposed `fetchOnboardingState`) on mount.
- [x] Wire save via a new `updateYouPreferences()` client action.
- [x] Use the existing `actionResultToToast` pattern for success / failure feedback.
- [x] Disable Save while a request is in-flight or while there are no pending changes.

## D. Validation and tests

- [x] Add `src/tests/api-routes-you-preferences.test.ts` (auth, per-field validation, success path, no `onboardingCompletedAt` mutation, `404` user-missing).
- [x] Add `src/tests/you-preferences-section.test.tsx` (renders current values, dispatches PATCH on save, save disabled when unchanged, surfaces error toast).
- [x] Add `e2e/you-preferences.spec.ts` (load `/you`, edit preferences, save, reload reflects new values).
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] scoped lint (`src` + `e2e`)
- [x] `npm run build`

## E. Docs and closeout

- [x] Append section `22) Cycle 5 - Phase 5.6 closeout (Personalization preferences editor)` to `documentation/status/progress-summary.md`.
- [x] Mark Phase 5.6 closed in `documentation/plans/cycles/cycles-4-5-6-roadmap.md`, advance Wave 4 numbering, and update `Immediate Next Phase` to point at Phase 6.1 PWA installability (`documentation/plans/cycle-6/phase-6-1-pwa-installability-plan.md`).
- [x] Append a `Cycle 5 Summary Status` block to `documentation/status/current-status-architecture.md` (Cycle 5 closeout, since Phase 5.6 closes the cycle).
- [x] Fill the Evidence summary section below at closeout.

## Blockers

- 2026-04-27: `npx playwright test e2e/you-preferences.spec.ts` is environment-blocked locally by `http://localhost:3000 is already used`, matching the recurring local-only blocker documented in Phases 5.3 / 5.4 / 5.5. The new spec was still authored and validated against the `/you` DOM contract and request payload shape used by the passing Vitest suite.

## Decision log

- 2026-04-27: Add a dedicated `PATCH /api/you/preferences` route instead of overloading `PATCH /api/onboarding`, because the onboarding PATCH re-stamps `onboardingCompletedAt` and requires `complete: true`; reusing it would conflate "first onboarding" with "post-onboarding edits".
- 2026-04-27: New route returns the same `OnboardingState` payload as `GET /api/onboarding`, so `fetchOnboardingState()` can be reused for reads and the UI never needs payload remapping.
- 2026-04-27: Plain controlled inputs and a Save button on `/you`, mirroring the existing "Profile basics" visual style; no new design system primitives are introduced for this phase.
- 2026-04-27: Saving preferences emits no new behavior event; the Phase 5.4 allowlist remains five entries. A future `preferences_updated` event would require both an allowlist update and an analytics surface, neither of which is in scope here.
- 2026-04-27: Phase 5.6 doubles as the Cycle 5 capstone, so its closeout writes a `Cycle 5 Summary Status` block into `documentation/status/current-status-architecture.md`, mirroring the Cycle 4 closeout convention referenced by `documentation/plans/cycle-6/README.md`.

## Out-of-scope confirmations

- [x] No schema changes to `src/models/User.ts`.
- [x] No mutation of `onboardingCompletedAt` from the new route.
- [x] No new behavior event names.
- [x] No analytics card or analytics route changes.
- [x] No AI/LLM tone preview or A/B variants.

## Exit criteria

- [x] `PATCH /api/you/preferences` validates payloads and persists exactly the three onboarding-derived fields.
- [x] `/you` renders and saves personalization preferences, with success/error toasts, for authenticated users.
- [x] Tests and quality gates pass.
- [x] `documentation/status/progress-summary.md`, `documentation/plans/cycles/cycles-4-5-6-roadmap.md`, and `documentation/status/current-status-architecture.md` are updated for the Phase 5.6 closeout and Cycle 5 capstone.

## Evidence summary

- Backend route: `src/app/api/you/preferences/route.ts` adds authenticated `PATCH` with status coverage (`401`, `400`, `404`, `200`, `500`), reuses onboarding constraints from `src/lib/onboarding-state.ts`, updates only `onboardingFocusArea`, `onboardingWeeklyTarget`, and `onboardingEncouragementStyle`, and intentionally does not mutate `onboardingCompletedAt`.
- Shared onboarding contract: `src/lib/onboarding-state.ts` now centralizes the onboarding preference Zod schema + completion schema + `toOnboardingPayload()`, with `src/app/api/onboarding/route.ts` updated to consume the shared module (no onboarding contract drift).
- Client API: `src/lib/client-api.ts` adds `YouPreferencesPayload`, `fetchYouPreferences` (alias of `fetchOnboardingState`), and `updateYouPreferences()` for `PATCH /api/you/preferences`.
- `/you` integration: `src/app/you/page.tsx` adds the new "Personalization preferences" section between "Profile basics" and "Password", loads initial values via `fetchYouPreferences()`, saves via `updateYouPreferences()`, reuses toast conventions, and disables save while unchanged or in-flight.
- Tests:
  - `src/tests/api-routes-you-preferences.test.ts` (auth gate, validation failure, user missing `404`, happy-path update with explicit no-mutation assertion for `onboardingCompletedAt`).
  - `src/tests/you-preferences-section.test.tsx` (render initial values, save dispatch payload, unchanged save disabled, error-toast surface).
  - `e2e/you-preferences.spec.ts` (authenticated `/you` load/edit/save/reload flow with request mocking).
- Quality gates:
  - `npm run test:ci -- src/tests/api-routes-you-preferences.test.ts src/tests/you-preferences-section.test.tsx` -> pass (`2 files`, `7 tests`).
  - `npm run typecheck` -> pass.
  - `npx eslint src e2e --ext .ts,.tsx` -> pass.
  - `npm run build` -> pass; route manifest includes `/api/you/preferences`.
  - `npx playwright test e2e/you-preferences.spec.ts` -> blocked by local port `3000` already in use (documented in Blockers).
