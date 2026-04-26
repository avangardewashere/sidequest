# Phase 5.2 - Historical Review Trend (Tracker)

Pair with `phase-5-2-historical-review-trend-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[~]` in progress

## A. Contract and scope guardrails

- [ ] Confirm Phase 5.2 stays within multi-week historical review trend scope.
- [ ] Confirm no new persistence is introduced in 5.2.
- [ ] Confirm per-day historical drill-in is deferred to a later 5.x phase.
- [ ] Confirm sharing/export and event-logged analytics remain out of scope.
- [ ] Confirm `weeks` is locked to `4` in 5.2 (configurability deferred).

## B. Backend/API readiness

- [ ] Add authenticated `GET /api/review/historical` endpoint.
- [ ] Compose 4-week buckets from quest completions and `User.onboardingWeeklyTarget`.
- [ ] Implement deterministic trend classification (`rising` / `steady` / `declining`).
- [ ] Implement encouragement-style copy variants per trend bucket.
- [ ] Apply existing auth/error/logging patterns consistent with `/api/review/weekly`.

## C. UI integration

- [ ] Add `src/components/review/historical-review-card.tsx` rendering the 4-week trend card.
- [ ] Mount card directly under `WeeklyReviewCard` on `/stats` (`src/app/stats/page.tsx`) without breaking existing sections.
- [ ] Reuse existing toast/loading patterns for failure/empty states.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-historical-review.test.ts` with auth + payload + trend + tone tests.
- [ ] Add `src/tests/historical-review-card.test.tsx` with trend variant render tests.
- [ ] Add `e2e/historical-review.spec.ts` happy path.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 5.2 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.2 status.
- [ ] Record evidence summary in this tracker.

## Blockers

- None.

## Decision log

- 2026-04-26: Phase 5.2 scope is "multi-week historical review trend" using existing `CompletionLog` aggregates and `User` onboarding fields; no new persistence introduced.
- 2026-04-26: Use a dedicated `GET /api/review/historical` endpoint peer of `/api/review/weekly` instead of overloading the weekly route.
- 2026-04-26: Lock `weeks` to `4` in 5.2 to keep payload predictable and defer configurability.
- 2026-04-26: Trend classification is server-side and deterministic so the client only renders ready-to-display copy.

## Out-of-scope confirmations

- [ ] No per-day historical drill-in.
- [ ] No sharing/export/email of historical view.
- [ ] No event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap).
- [ ] No new User fields or new collections.
- [ ] No configurable week count from the UI in 5.2.

## Exit criteria

- [ ] Authenticated `/stats` renders historical review card under the weekly review card with 4 weekly buckets and trend copy.
- [ ] Historical review API returns expected payload and is auth-gated, with `weeks` validation.
- [ ] Tests and quality gates pass.
- [ ] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- (Filled in at closeout.)
