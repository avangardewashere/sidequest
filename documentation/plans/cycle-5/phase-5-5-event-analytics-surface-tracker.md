# Phase 5.5 - Event Analytics Surfaces (Tracker)

Pair with `phase-5-5-event-analytics-surface-plan.md`.

Status legend: `[ ]` pending - `[~]` in progress - `[x]` done - `[!]` blocked

Phase status: `[~]` in progress

## A. Contract and scope guardrails

- [ ] Confirm Phase 5.5 consumes existing 5.4 event logs only (no new write-side event capture).
- [ ] Confirm analytics remain per-user and authenticated.
- [ ] Confirm no third-party analytics SDKs are introduced.
- [ ] Confirm no AI/LLM interpretation layer is introduced in 5.5.
- [ ] Confirm no new persistence beyond existing `BehaviorEvent` reads.

## B. Backend/API analytics aggregation

- [ ] Add authenticated `GET /api/events/analytics` route.
- [ ] Validate `range` (`7d` / `30d` / `90d`) and reject invalid values (400).
- [ ] Aggregate per-event-name counts for allowlisted event names.
- [ ] Compute derived metrics (`reviewViews`, `suggestionClickRatePct`, completion-after-suggestion summary).
- [ ] Return stable response shape for both empty and non-empty datasets.

## C. UI integration

- [ ] Add `EventAnalyticsCard` (or equivalent) in stats components.
- [ ] Mount analytics card on `/stats` without disrupting existing chart sections.
- [ ] Reuse existing loading/error display conventions.
- [ ] Ensure empty/sparse analytics data renders informative placeholders.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-events-analytics.test.ts` for auth, validation, aggregation, derived metrics.
- [ ] Add `src/tests/event-analytics-card.test.tsx` for analytics card rendering variants.
- [ ] Add `e2e/event-analytics-surface.spec.ts` happy path on `/stats`.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 5.5 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.5 status.
- [ ] Record evidence summary in this tracker.

## Blockers

- (None yet.) Record any local Playwright environment caveat (e.g. port `3000` already in use) if encountered.

## Decision log

- 2026-04-27: Phase 5.5 selected as the first consumer of the Phase 5.4 behavior-event logging baseline.
- 2026-04-27: Keep analytics read-side and per-user only; no schema expansion or external integrations in this phase.
- 2026-04-27: Place event analytics in `/stats` to align with existing review and KPI surfaces.

## Out-of-scope confirmations

- [ ] No new event capture names in 5.5.
- [ ] No third-party analytics SDK.
- [ ] No AI/LLM-generated insight narratives.
- [ ] No org/team-level analytics.
- [ ] No export/share/reporting pipeline.

## Exit criteria

- [ ] `/api/events/analytics` returns validated and deterministic analytics payloads.
- [ ] `/stats` renders event analytics summary for authenticated users.
- [ ] Tests and quality gates pass.
- [ ] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- (Filled in at closeout.)
