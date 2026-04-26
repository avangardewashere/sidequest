# Phase 5.2 - Historical Review Trend (Tracker)

Pair with `phase-5-2-historical-review-trend-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[~]` in progress

## A. Contract and scope guardrails

- [x] Confirm Phase 5.2 stays within multi-week historical review trend scope.
- [x] Confirm no new persistence is introduced in 5.2.
- [x] Confirm per-day historical drill-in is deferred to a later 5.x phase.
- [x] Confirm sharing/export and event-logged analytics remain out of scope.
- [x] Confirm `weeks` is locked to `4` in 5.2 (configurability deferred).

## B. Backend/API readiness

- [x] Add authenticated `GET /api/review/historical` endpoint.
- [x] Compose 4-week buckets from quest completions and `User.onboardingWeeklyTarget`.
- [x] Implement deterministic trend classification (`rising` / `steady` / `declining`).
- [x] Implement encouragement-style copy variants per trend bucket.
- [x] Apply existing auth/error/logging patterns consistent with `/api/review/weekly`.

## C. UI integration

- [x] Add `src/components/review/historical-review-card.tsx` rendering the 4-week trend card.
- [x] Mount card directly under `WeeklyReviewCard` on `/stats` (`src/app/stats/page.tsx`) without breaking existing sections.
- [x] Reuse existing toast/loading patterns for failure/empty states.

## D. Validation and tests

- [x] Add `src/tests/api-routes-historical-review.test.ts` with auth + payload + trend + tone tests.
- [x] Add `src/tests/historical-review-card.test.tsx` with trend variant render tests.
- [x] Add `e2e/historical-review.spec.ts` happy path.
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] scoped lint (`src` + `e2e`)
- [x] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 5.2 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.2 status.
- [ ] Record evidence summary in this tracker.

## Blockers

- `npx playwright test e2e/historical-review.spec.ts` is blocked in current environment because port `3000` is already in use by another process and the base `playwright.config.ts` has `reuseExistingServer: false`. Same caveat as Phase 5.1.
- Pre-existing `.tsx` test files `src/tests/use-focus-timer.test.tsx` and `src/tests/use-pomodoro-cycle.test.tsx` were silently never running before Phase 5.2 because the vitest `include` glob only matched `.test.ts`. Widening the glob to `.test.{ts,tsx}` (so the review card tests run) surfaced fake-timers/`waitFor()` incompatibilities in those two specs. They are excluded from `vitest.config.ts` with a tracked note; not a Phase 5.2 regression. Follow-up to repair fake-timer usage in those hooks tests.

## Decision log

- 2026-04-26: Phase 5.2 scope is "multi-week historical review trend" using existing `CompletionLog` aggregates and `User` onboarding fields; no new persistence introduced.
- 2026-04-26: Use a dedicated `GET /api/review/historical` endpoint peer of `/api/review/weekly` instead of overloading the weekly route.
- 2026-04-26: Lock `weeks` to `4` in 5.2 to keep payload predictable and defer configurability.
- 2026-04-26: Trend classification is server-side and deterministic so the client only renders ready-to-display copy.
- 2026-04-26: Widen `vitest.config.ts` include glob from `**/*.test.ts` to `**/*.test.{ts,tsx}` so the existing `weekly-review-card.test.tsx` (Phase 5.1) and the new `historical-review-card.test.tsx` (Phase 5.2) actually run; explicitly exclude the two latent-broken focus/pomodoro hook test files (pre-existing fake-timer interaction with `waitFor`), tracked as a follow-up.
- 2026-04-26: Phase 5.2 implementation proceeds with the Playwright e2e wired but not executed locally because port `3000` was already in use; spec will run on the next free environment / CI pass (mirrors Phase 5.1 caveat).

## Out-of-scope confirmations

- [x] No per-day historical drill-in.
- [x] No sharing/export/email of historical view.
- [x] No event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap).
- [x] No new User fields or new collections.
- [x] No configurable week count from the UI in 5.2.

## Exit criteria

- [ ] Authenticated `/stats` renders historical review card under the weekly review card with 4 weekly buckets and trend copy.
- [ ] Historical review API returns expected payload and is auth-gated, with `weeks` validation.
- [ ] Tests and quality gates pass.
- [ ] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- (Filled in at closeout.)
