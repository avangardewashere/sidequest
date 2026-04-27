# Phase 5.2 - Historical Review Trend (Execution Plan)

Cycle 5 / Phase 5.2. Companion tracker: `phase-5-2-historical-review-trend-tracker.md`.

## Goal

Extend the personalized weekly review (Phase 5.1) with a multi-week trend view so authenticated solo users can see their last four weeks of completions against their weekly target, with encouragement-style tone, without introducing new persistence or behavioral event logging.

## Scope

### In scope

- Add an authenticated historical review API that composes a 4-week summary from existing sources.
- Reuse `User.onboardingWeeklyTarget` (Phase 4.5) as the per-week target reference.
- Reuse `User.onboardingEncouragementStyle` (Phase 4.5) to drive trend-aware tone copy.
- Classify the trend across the last four weeks as `rising` / `steady` / `declining`.
- Add a `HistoricalReviewCard` UI component on `/stats`, placed directly under the existing `WeeklyReviewCard`.
- Add focused tests and one historical review e2e happy path.

### Out of scope

- Per-day historical drill-in (potential 5.3).
- Configurable week count from the UI; lock to 4 in 5.2.
- Sharing/export/email of the historical view (Cycle 6 distribution work).
- Event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap).
- New persistence: no new collections or User fields introduced in 5.2.

## Architecture decisions

1. Phase 5.2 introduces a dedicated `GET /api/review/historical` endpoint, peer of `/api/review/weekly`, to keep the 7-day and multi-week surfaces independently versionable.
2. Composition is server-side: weekly buckets are computed from `CompletionLog` aggregates and the current `User.onboardingWeeklyTarget` is applied uniformly across all four weeks.
3. Trend classification is server-side and returns ready-to-render copy; the client only renders.
4. UI lives directly under the `WeeklyReviewCard` on `/stats`, reusing the same loading/error patterns and tone badge style.
5. Week count is fixed at 4 in 5.2 to keep payload predictable and defer configurability.

## API/data/component contracts

- `GET /api/review/historical?weeks=4` returns:
  - `{ historicalReview: { weeks: Array<{ rangeStart, rangeEnd, completions, weeklyTarget, progressPct }>, trend: "rising" | "steady" | "declining", encouragementStyle, summaryHeadline, summaryMessage } }`
  - `weeks` is ordered oldest -> newest with exactly 4 entries when `weeks=4`.
  - `weeks` parameter is validated and clamped to `4` in 5.2 (other values rejected with 400).
- Trend classification rule (deterministic, server-side):
  - Compare the last week's `completions` to the average of the prior three weeks.
  - `rising` when last >= avg + 20% of weeklyTarget
  - `declining` when last <= avg - 20% of weeklyTarget
  - otherwise `steady`
- Encouragement-style copy table (same three styles as 5.1: gentle / direct / celebration), branched per trend bucket.
- UI:
  - `src/components/review/historical-review-card.tsx` (new) renders the 4-week summary and trend headline.
  - `src/app/stats/page.tsx` mounts the card directly under `WeeklyReviewCard`.
  - Loading/error states reuse the same patterns as the weekly review card.

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-historical-review.test.ts` covers auth + payload composition + trend classification + encouragement-style branching.
  - `src/tests/historical-review-card.test.tsx` covers trend variant rendering.
- E2E:
  - `e2e/historical-review.spec.ts` covers the authenticated `/stats` happy path with a mocked historical review payload.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`
- targeted Playwright run for the historical review spec

## Acceptance criteria

- Authenticated `/stats` shows the historical review card under the existing weekly review card.
- The card renders four weekly buckets with completions, weekly target, and progress percentage.
- Trend tone is reflected in the rendered copy and matches the encouragement style.
- API returns the historical review payload with proper auth checks and parameter validation.
- No new persistence is introduced and no Phase 5.3-5.6 behavior is preempted.
- All quality gates pass and Phase 5.2 closeout docs are updated.
