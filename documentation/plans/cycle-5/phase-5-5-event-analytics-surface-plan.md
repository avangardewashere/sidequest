# Phase 5.5 - Event Analytics Surfaces (Execution Plan)

Cycle 5 / Phase 5.5. Companion tracker: `phase-5-5-event-analytics-surface-tracker.md`.

## Goal

Consume the stable behavior-event baseline shipped in Phase 5.4 and expose first-party, user-facing analytics surfaces for review engagement and suggestion effectiveness. Phase 5.5 introduces read-only aggregation and lightweight UI insights; it does not expand event capture scope, add third-party analytics SDKs, or introduce AI interpretation.

## Scope

### In scope

- Add authenticated analytics endpoint(s) that aggregate `BehaviorEvent` for the signed-in user.
- Aggregate event insights for the existing allowlist:
  - `weekly_review_viewed`
  - `historical_review_viewed`
  - `suggestion_viewed`
  - `suggestion_clicked`
  - `quest_completed`
- Add a compact analytics panel on `/stats` that summarizes behavior-event trends over selected range windows.
- Extend client API/types to fetch event analytics payload.
- Add focused tests and one event-analytics e2e happy path.

### Out of scope

- New event capture names or schema expansion beyond the 5.4 allowlist.
- Third-party analytics SDKs, tracking pixels, or external BI exports.
- AI/LLM insight generation or automated recommendations.
- Team/org/multi-user analytics; Phase 5.5 remains per-user only.
- Background jobs or data warehouse ETL.

## Architecture decisions

1. Phase 5.5 reads from `BehaviorEvent` only; no additional persistence is introduced.
2. Aggregation is computed server-side in authenticated API routes and returned as ready-to-render metrics.
3. Stats UI integration is additive and compact, reusing existing loading/error section patterns.
4. Event analytics must gracefully degrade when data is sparse (zero counts are valid).
5. Existing metrics endpoints remain intact; behavior analytics is additive rather than replacing current KPIs.

## API/data/component contracts

- `GET /api/events/analytics?range=7d|30d|90d` returns:
  - `{ analytics: { range, totalEvents, byName, reviewViews, suggestionViews, suggestionClicks, suggestionClickRatePct, questCompletionsAfterSuggestionView, latestEventAt } }`
- Response field intent:
  - `byName`: per-event counts for allowlisted names.
  - `reviewViews`: `weekly_review_viewed + historical_review_viewed`.
  - `suggestionClickRatePct`: `suggestion_clicked / suggestion_viewed * 100` (0 when denominator is 0).
  - `questCompletionsAfterSuggestionView`: count of `quest_completed` events occurring after at least one suggestion view in the selected window.
  - `latestEventAt`: ISO string or `null`.
- Validation:
  - 401 unauthenticated.
  - 400 invalid `range`.
- UI:
  - New `EventAnalyticsCard` (or equivalent section) in `src/components/stats/`.
  - Mounted on `/stats` under existing review cards and above chart-heavy sections.
  - Reuses warning/loading surfaces already used by `WeeklyReviewCard` and `HistoricalReviewCard`.

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-events-analytics.test.ts`
    - auth requirements
    - range validation
    - empty-state payload
    - count aggregation by event name
    - click-rate calculation edge cases (`0/0`, partial, full)
  - `src/tests/event-analytics-card.test.tsx`
    - rendering with populated and empty payloads
    - rate/summary labels formatting
- E2E:
  - `e2e/event-analytics-surface.spec.ts`
    - mocked analytics payload visible on `/stats`
    - key summary fields/assertions render correctly

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`
- targeted Playwright run for `e2e/event-analytics-surface.spec.ts` (record blocker if local port-3000 conflict persists).

## Acceptance criteria

- Authenticated `/stats` renders event analytics summary from real `BehaviorEvent` data.
- API validates range and returns stable, typed analytics payload with deterministic derived metrics.
- Empty and sparse datasets render without UI breakage.
- No new write-side event capture is added in 5.5.
- Quality gates pass and tracker closeout evidence is complete.
