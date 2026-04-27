# Phase 5.6 - Personalization Preferences Editor (Execution Plan)

Cycle 5 / Phase 5.6 (Cycle 5 capstone). Companion tracker: `phase-5-6-personalization-preferences-tracker.md`.

## Goal

Close the Cycle 5 personalization loop. Phases 5.1 through 5.5 all read `User.onboardingFocusArea`, `User.onboardingWeeklyTarget`, and `User.onboardingEncouragementStyle`, but the only place those fields can be set today is the `/onboarding` flow that runs once at signup. Phase 5.6 adds a "Personalization preferences" section to `/you` so authenticated users can update those three signals at any time, without re-running onboarding and without re-stamping `onboardingCompletedAt`.

This is the Cycle 5 capstone: it shifts personalization from a one-shot signup signal into a durable, user-editable contract that all prior Cycle 5 surfaces will pick up on the next request.

## Scope

### In scope

- New authenticated `PATCH /api/you/preferences` route that writes only the three onboarding-derived fields on `User`.
- Reuse of the existing onboarding Zod constraints for validation (`focusArea` enum, `weeklyTarget` integer 1-21, `encouragementStyle` enum).
- New "Personalization preferences" section on `/you`, mounted between "Profile basics" and "Password".
- Client API additions in `src/lib/client-api.ts`: read via the existing `fetchOnboardingState()` helper (re-exposed as `fetchYouPreferences()`); save via a new `updateYouPreferences()` action.
- Toast feedback on success and validation error, reusing the existing `actionResultToToast` pattern already used by `/you`.
- Unit tests, page section tests, and one e2e happy-path spec.

### Out of scope

- No new persistence; no schema changes to `src/models/User.ts`.
- No re-running of the onboarding flow from `/you` (the `/onboarding` page and its PATCH contract stay unchanged).
- No mutation of `onboardingCompletedAt` from this route - it remains the immutable "first onboarding" timestamp.
- No new behavior event names; the Phase 5.4 allowlist (`BEHAVIOR_EVENT_NAMES`) stays at five entries.
- No analytics card changes; the Phase 5.5 surface (`/api/events/analytics` and `EventAnalyticsCard`) stays unchanged.
- No A/B variants, multi-tone preview, or AI/LLM tone preview.
- No change to the latent fake-timer issues in `use-focus-timer.test.tsx` / `use-pomodoro-cycle.test.tsx`; they remain in the vitest exclude list.

## Architecture decisions

1. Add a dedicated `PATCH /api/you/preferences` route instead of overloading `PATCH /api/onboarding`. The onboarding PATCH currently re-stamps `onboardingCompletedAt = new Date()` and requires `complete: true`; reusing it for post-onboarding edits would either break those semantics or force every preference save to look like a fresh onboarding completion. A separate route keeps "first onboarding" and "post-onboarding edits" as distinct operations on the same fields.
2. The new route returns the same `OnboardingState` shape as `GET /api/onboarding`, so the existing `fetchOnboardingState()` client helper can be reused for reads with no payload remapping in the UI.
3. The UI is plain controlled inputs plus a Save button, mirroring the existing "Profile basics" section visual style on `/you`. No new design system primitives are introduced.
4. Saving emits no new behavior event; the 5.4 allowlist remains five entries. Adding a `preferences_updated` event would be a future-phase change and would require both an allowlist update and a corresponding analytics surface.
5. Phase 5.6 doubles as the Cycle 5 capstone, so its closeout writes a `Cycle 5 Summary Status` block into `documentation/status/current-status-architecture.md`, mirroring the Cycle 4 closeout convention referenced by `documentation/plans/cycle-6/README.md`.

## API/data/component contracts

- `PATCH /api/you/preferences`
  - Auth gate via `getAuthSession()`; returns `401` when missing.
  - Body validated with Zod equivalent to the onboarding PATCH body **minus** `complete`:
    - `focusArea`: `"work" | "health" | "learning" | "life"`
    - `weeklyTarget`: integer in `[1, 21]`
    - `encouragementStyle`: `"gentle" | "direct" | "celebration"`
  - On valid payload: `connectToDatabase()`, load the user, update only `onboardingFocusArea`, `onboardingWeeklyTarget`, `onboardingEncouragementStyle`. Do not touch `onboardingCompletedAt`.
  - Response shape: `{ onboarding: OnboardingState }` (same shape as `GET /api/onboarding`).
  - Status codes: `200` on success, `400` on invalid payload, `401` unauthenticated, `404` user not found, `500` on unexpected exception.
- `src/lib/client-api.ts`
  - Re-expose `fetchOnboardingState` as `fetchYouPreferences` for naming clarity at the call site, **without** removing the `fetchOnboardingState` export (the onboarding page still uses it).
  - Add `updateYouPreferences(payload: { focusArea, weeklyTarget, encouragementStyle }): Promise<ActionResult<{ onboarding: OnboardingState }>>` that PATCHes `/api/you/preferences` through `runAction()`.
- `src/app/you/page.tsx`
  - New `Personalization preferences` section between "Profile basics" and "Password".
  - Loads current values via `fetchYouPreferences()` once on mount; renders three controls:
    - Focus area: a four-button radio strip (`Work`, `Health`, `Learning`, `Life`).
    - Weekly target: `<input type="number" min="1" max="21" step="1">` plus inline helper text.
    - Encouragement style: a three-button radio strip (`Gentle`, `Direct`, `Celebration`).
  - Save button is disabled while a save is in flight or while the form is unchanged from the loaded values.
  - On success, refresh local form state from the response payload and emit a success toast via `actionResultToToast`.
  - On validation/server error, surface a warning toast (no inline field errors required for 5.6).

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-you-preferences.test.ts`
    - `401` when unauthenticated.
    - `400` when payload misses any field.
    - `400` when `focusArea` / `encouragementStyle` are out-of-enum or `weeklyTarget` is outside `[1, 21]` (or non-integer).
    - `404` when the user document is missing.
    - `200` happy path: returns the updated `OnboardingState`, persists exactly the three fields, leaves `onboardingCompletedAt` untouched.
  - `src/tests/you-preferences-section.test.tsx`
    - Renders the loaded values into the three controls.
    - Save dispatches PATCH with the chosen payload and updates UI state from the response.
    - Save is disabled when there are no pending changes.
    - Surfaces error toast on `ActionResult` failure.
- E2E:
  - `e2e/you-preferences.spec.ts`
    - Mocks `/api/auth/session`, `/api/you/profile`, `/api/onboarding`, `/api/you/preferences`, plus the `/api/dailies` / `/api/quests` / `/api/progression` plumbing the page already triggers.
    - Loads `/you`, asserts current focus / target / style are visible, edits all three, clicks Save, asserts the success toast and that the controls now reflect the saved values.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`npx eslint src e2e --ext .ts,.tsx`)
- `npm run build` (verify `/api/you/preferences` appears in the route manifest)
- Targeted Playwright run for `e2e/you-preferences.spec.ts` (best-effort; record port-3000 blocker in the tracker if it recurs as it has on prior phases).

## Acceptance criteria

- Authenticated users can update `focusArea`, `weeklyTarget`, and `encouragementStyle` from `/you`, see those values reflected immediately, and reload the page to confirm persistence.
- The new route persists exactly the three fields and leaves `onboardingCompletedAt` untouched (verified by unit test).
- The onboarding flow (`/onboarding` page + `PATCH /api/onboarding`) continues to work unchanged.
- No new behavior event names are emitted.
- Quality gates pass and tracker closeout evidence is complete.
- Phase 5.6 closeout updates the roadmap to mark Phase 5.6 closed, advances the `Immediate Next Phase` pointer to Phase 6.1, and appends a `Cycle 5 Summary Status` block to `documentation/status/current-status-architecture.md`.
