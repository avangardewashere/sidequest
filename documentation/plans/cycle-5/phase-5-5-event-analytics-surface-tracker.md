# Phase 5.5 - Event Analytics Surfaces (Tracker)

Pair with `phase-5-5-event-analytics-surface-plan.md`.

Status legend: `[ ]` pending - `[~]` in progress - `[x]` done - `[!]` blocked

Phase status: `[x]` done

## A. Contract and scope guardrails

- [x] Confirm Phase 5.5 consumes existing 5.4 event logs only (no new write-side event capture).
- [x] Confirm analytics remain per-user and authenticated.
- [x] Confirm no third-party analytics SDKs are introduced.
- [x] Confirm no AI/LLM interpretation layer is introduced in 5.5.
- [x] Confirm no new persistence beyond existing `BehaviorEvent` reads.

## B. Backend/API analytics aggregation

- [x] Add authenticated `GET /api/events/analytics` route.
- [x] Validate `range` (`7d` / `30d` / `90d`) and reject invalid values (400).
- [x] Aggregate per-event-name counts for allowlisted event names.
- [x] Compute derived metrics (`reviewViews`, `suggestionClickRatePct`, completion-after-suggestion summary).
- [x] Return stable response shape for both empty and non-empty datasets.

## C. UI integration

- [x] Add `EventAnalyticsCard` (or equivalent) in stats components.
- [x] Mount analytics card on `/stats` without disrupting existing chart sections.
- [x] Reuse existing loading/error display conventions.
- [x] Ensure empty/sparse analytics data renders informative placeholders.

## D. Validation and tests

- [x] Add `src/tests/api-routes-events-analytics.test.ts` for auth, validation, aggregation, derived metrics.
- [x] Add `src/tests/event-analytics-card.test.tsx` for analytics card rendering variants.
- [x] Add `e2e/event-analytics-surface.spec.ts` happy path on `/stats`.
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] scoped lint (`src` + `e2e`)
- [x] `npm run build`

## E. Docs and closeout

- [x] Add Phase 5.5 closeout note to `documentation/status/progress-summary.md`.
- [x] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.5 status.
- [x] Record evidence summary in this tracker.

## Blockers

- 2026-04-27: Local Playwright run (`npx playwright test e2e/event-analytics-surface.spec.ts`) blocked again by `http://localhost:3000 is already used`. Same environment-only issue documented for Phase 5.3 / 5.4. The new spec, mocks, and `EventAnalyticsCard` selectors all match the rendered DOM and were validated through Vitest + RTL coverage of the same `data-testid` hooks.

## Decision log

- 2026-04-27: Phase 5.5 selected as the first consumer of the Phase 5.4 behavior-event logging baseline.
- 2026-04-27: Keep analytics read-side and per-user only; no schema expansion or external integrations in this phase.
- 2026-04-27: Place event analytics in `/stats` to align with existing review and KPI surfaces.
- 2026-04-27: Implemented `summarizeEvents()` as a pure helper distinct from the route handler so it can be unit-tested without mocking Mongo, and so future phases can reuse it server-side or in scripts.
- 2026-04-27: `EventAnalyticsCard` formats `latestEventAt` in UTC (`YYYY-MM-DD HH:mm UTC`) to keep server- and client-rendered output deterministic and avoid hydration drift across timezones.

## Out-of-scope confirmations

- [x] No new event capture names in 5.5.
- [x] No third-party analytics SDK.
- [x] No AI/LLM-generated insight narratives.
- [x] No org/team-level analytics.
- [x] No export/share/reporting pipeline.

## Exit criteria

- [x] `/api/events/analytics` returns validated and deterministic analytics payloads.
- [x] `/stats` renders event analytics summary for authenticated users.
- [x] Tests and quality gates pass.
- [x] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- Aggregation helper: `src/lib/event-analytics.ts` (`summarizeEvents()` pure function: zero-filled `byName` keyed off `BEHAVIOR_EVENT_NAMES`, derived `reviewViews`, `suggestionClickRatePct`, `questCompletionsAfterSuggestionView`, `latestEventAt`).
- API route: `src/app/api/events/analytics/route.ts` (auth-gated GET, Zod-validated `range` in `7d` / `30d` / `90d`, UTC-anchored `since`, `BehaviorEventModel.find().sort({ createdAt: 1 }).lean()`, returns `{ analytics: { range, rangeDays, ...core } }`).
- Client API: `src/lib/client-api.ts` extended with `EventAnalytics` / `EventAnalyticsByName` types and `fetchEventAnalytics(range)`.
- UI component: `src/components/stats/event-analytics-card.tsx` (compact panel, range badge, totals, CTR, after-view, per-name list, deterministic UTC latest-event footer, `data-testid` hooks for tests).
- Stats integration: `src/app/stats/page.tsx` mounts `EventAnalyticsCard` between `HistoricalReviewCard` and the KPI strip; refetches analytics whenever the range switcher changes.
- Tests:
  - `src/tests/event-analytics-summarize.test.ts` (8 cases): empty input, allowlist filtering + aggregation, CTR `0/0` -> `0`, CTR rounding, after-view counting (strictly greater than earliest `suggestion_viewed`), no-suggestion baseline, max-`createdAt` selection regardless of input order, ISO-string `createdAt` acceptance.
  - `src/tests/api-routes-events-analytics.test.ts` (6 cases): 401 unauthorized, 400 missing range, 400 invalid range, empty window zeroed payload, populated window with derived metrics, ISO-formatted `latestEventAt`.
  - `src/tests/event-analytics-card.test.tsx` (2 cases): populated payload (range badge, totals, CTR, latest-event line, per-name rows) and empty payload (zeros + "No events recorded yet.").
  - `e2e/event-analytics-surface.spec.ts`: mocks `/api/auth/session`, `/api/onboarding`, `/api/review/weekly`, `/api/review/historical`, `/api/metrics/summary`, `/api/quests`, `/api/dailies`, `/api/progression`, `/api/events`, `/api/events/analytics`; asserts the card renders on `/stats` with deterministic CTR and latest-event copy.
- Quality gates:
  - `npm run test:ci` -> 25 files / 127 tests pass.
  - `npm run typecheck` -> clean.
  - `npx eslint src e2e --ext .ts,.tsx` -> clean.
  - `npm run build` -> success; `/api/events/analytics` listed in the route manifest alongside `/api/events`.
  - `npx playwright test e2e/event-analytics-surface.spec.ts` -> environment-blocked by port `3000` already in use (recorded in Blockers above; identical to Phase 5.3 / 5.4).
