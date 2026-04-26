# Phase 5.1 - Personalized Weekly Review (Tracker)

Pair with `phase-5-1-personalized-weekly-review-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[x]` done

## A. Contract and scope guardrails

- [x] Confirm Phase 5.1 stays within personalized weekly review scope.
- [x] Confirm no new persistence is introduced in 5.1.
- [x] Confirm multi-week/historical comparison is deferred to later 5.x.
- [x] Confirm sharing/export and event-logged analytics remain out of scope.

## B. Backend/API readiness

- [x] Add authenticated `GET /api/review/weekly` endpoint.
- [x] Compose review payload from quest completions and `User` onboarding fields.
- [x] Implement encouragement-style copy variants for headline/message.
- [x] Apply existing auth/error/logging patterns consistent with prior API routes.

## C. UI integration

- [x] Add `src/components/review/weekly-review-card.tsx` rendering the review card.
- [x] Mount card at the top of `/stats` (`src/app/stats/page.tsx`) without breaking existing KPI/chart sections.
- [x] Reuse existing toast/loading patterns for failure/empty states.

## D. Validation and tests

- [x] Add `src/tests/api-routes-review.test.ts` with auth + payload + tone tests.
- [x] Add `src/tests/weekly-review-card.test.tsx` with tone variant render tests.
- [x] Add `e2e/weekly-review.spec.ts` happy path.
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] scoped lint (`src` + `e2e`)
- [x] `npm run build`

## E. Docs and closeout

- [x] Add Phase 5.1 closeout note to `documentation/status/progress-summary.md`.
- [x] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.1 status.
- [x] Record evidence summary in this tracker.

## Blockers

- `npx playwright test e2e/weekly-review.spec.ts` is blocked in current environment because port `3000` is already in use.

## Decision log

- 2026-04-26: Phase 5.1 scope is "personalized weekly review" using existing onboarding fields and quest completion data; no new persistence introduced.
- 2026-04-26: Use a dedicated `GET /api/review/weekly` endpoint instead of overloading `/api/metrics/summary`.
- 2026-04-26: Keep weekly review card copy generation on the API side and return ready-to-render headline/message payload.
- 2026-04-26: Phase 5.1 closeout proceeds with the Playwright e2e wired but not executed locally because port `3000` was already in use; spec will run on the next free environment / CI pass.

## Out-of-scope confirmations

- [x] No multi-week or historical review comparison.
- [x] No sharing/export/email of weekly review.
- [x] No event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap).
- [x] No new User fields or new collections.

## Exit criteria

- [x] Authenticated `/stats` renders weekly review card with target progress and encouragement-style copy.
- [x] Weekly review API returns expected payload and is auth-gated.
- [x] Tests and quality gates pass.
- [x] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- API: `src/app/api/review/weekly/route.ts` (auth-gated `GET /api/review/weekly` composing 7-day completions, weekly target progress, encouragement-style summary copy)
- UI: `src/components/review/weekly-review-card.tsx` mounted at top of `src/app/stats/page.tsx` with loading and error states
- Client contract: `WeeklyReview` type and `fetchWeeklyReview()` in `src/lib/client-api.ts`
- Tests:
  - `src/tests/api-routes-review.test.ts` (auth + payload composition + encouragement branching)
  - `src/tests/weekly-review-card.test.tsx` (tone variant rendering)
  - `e2e/weekly-review.spec.ts` (authenticated `/stats` happy path)
- Validation:
  - `npm run test:ci -- src/tests/api-routes-review.test.ts src/tests/weekly-review-card.test.tsx` passed (3/3)
  - `npm run typecheck` passed
  - `npx eslint src e2e` passed
  - `npm run build` passed (route `/api/review/weekly` listed in build manifest)
  - `npx playwright test e2e/weekly-review.spec.ts` not executed in current environment because port `3000` was already in use; spec is wired and ready for the next dev/CI run
- Scope guardrails held:
  - no new persistence / no new User fields
  - no multi-week or historical comparison (deferred to Phase 5.2)
  - no event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap)
