# Phase 5.1 - Personalized Weekly Review (Tracker)

Pair with `phase-5-1-personalized-weekly-review-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[~]` in progress

## A. Contract and scope guardrails

- [ ] Confirm Phase 5.1 stays within personalized weekly review scope.
- [ ] Confirm no new persistence is introduced in 5.1.
- [ ] Confirm multi-week/historical comparison is deferred to later 5.x.
- [ ] Confirm sharing/export and event-logged analytics remain out of scope.

## B. Backend/API readiness

- [ ] Add authenticated `GET /api/review/weekly` endpoint.
- [ ] Compose review payload from quest completions and `User` onboarding fields.
- [ ] Implement encouragement-style copy variants for headline/message.
- [ ] Apply existing auth/error/logging patterns consistent with prior API routes.

## C. UI integration

- [ ] Add `src/components/review/weekly-review-card.tsx` rendering the review card.
- [ ] Mount card at the top of `/stats` (`src/app/stats/page.tsx`) without breaking existing KPI/chart sections.
- [ ] Reuse existing toast/loading patterns for failure/empty states.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-review.test.ts` with auth + payload + tone tests.
- [ ] Add `src/tests/weekly-review-card.test.tsx` with tone variant render tests.
- [ ] Add `e2e/weekly-review.spec.ts` happy path.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 5.1 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.1 status.
- [ ] Record evidence summary in this tracker.

## Blockers

- None.

## Decision log

- 2026-04-26: Phase 5.1 scope is "personalized weekly review" using existing onboarding fields and quest completion data; no new persistence introduced.
- 2026-04-26: Use a dedicated `GET /api/review/weekly` endpoint instead of overloading `/api/metrics/summary`.

## Out-of-scope confirmations

- [ ] No multi-week or historical review comparison.
- [ ] No sharing/export/email of weekly review.
- [ ] No event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap).
- [ ] No new User fields or new collections.

## Exit criteria

- [ ] Authenticated `/stats` renders weekly review card with target progress and encouragement-style copy.
- [ ] Weekly review API returns expected payload and is auth-gated.
- [ ] Tests and quality gates pass.
- [ ] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- (Filled in at closeout.)
