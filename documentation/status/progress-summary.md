# Progress Summary - Home Data Wiring And Current Status

This chapter summarizes what was delivered in the latest implementation pass and where the project stands now.

## 0) Today accomplishments (Cycle 3 closeout day)

- Closed Cycle 3 and pushed final closeout artifacts to `main`.
- Shipped resilience + feedback improvements (error boundaries, toasts, offline banner, loading boundaries).
- Completed retention/test/performance hardening and deployment readiness checks.
- Published Cycle 3 summary, phase perf notes, and release handoff documentation.

## 1) Project state snapshot

- The authenticated `/` route now renders a live-data Today/Focus home experience.
- The unauthenticated `/` login/register surface remains unchanged.
- Core quest APIs and progression APIs continue to power the main gameplay loop.
- Progress Stats is now a live analytics surface powered by `/api/metrics/summary`.

## 2) What was delivered in this cycle

### Home data pipeline and mapping

- Added typed home snapshot contracts in `src/types/today-dashboard.ts`.
- Added `fetchTodayDashboard()` in `src/lib/client-api.ts` to aggregate:
  - `GET /api/progression`
  - `GET /api/quests?status=active&sort=newest`
  - `GET /api/dailies`
- Added `useTodayDashboard()` in `src/hooks/useTodayDashboard.ts` for client loading/error/refresh behavior.
- Added mapping utilities in `src/lib/today-dashboard-mappers.ts` for:
  - header date/title data
  - XP/level data
  - stats strip (including explicit placeholder policy)
  - main quest selection
  - task section composition

### Home UI wiring and interactions

- Wired `TodayFocusShell` to consume `useTodayDashboard()` live snapshot data.
- Added header/XP skeleton loading state (`today-focus-loading-skeleton.tsx`).
- Added retry path for initial home data load failure.
- Added optimistic quest completion from home rows with rollback on failure.
- Added quick-add bottom sheet (`today-focus-quick-add-sheet.tsx`) posting to existing quest create API.
- Added row click navigation from home tasks to `/quests/[id]/edit`.
- Added progress bar width transitions in XP and main quest cards.

### Fetch deduplication

- Updated `useDashboardActions` with `prefetchDashboard?: boolean`.
- On authenticated `/`, set `prefetchDashboard: false` so the legacy dashboard fetch is skipped while Today/Focus uses `useTodayDashboard`.

## 3) Validation evidence

- `npm run test:ci` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.

## 4) Known gaps and deferred items

- Manual visual/responsive sign-off checklist has been completed for Cycle 1 closeout:
  - `documentation/plans/today-focus-leftovers-checklist.md` (Section E/F marked complete)
- Stats strip keeps `FOCUS` as a placeholder because no reliable focus-time source is wired yet.
- Bottom tab bar on home is still presentational (no route switching behavior yet).
- Focus-time metric source is still placeholder-oriented in home stats.
- Home bottom tab behavior remains presentational and needs route behavior finalization.

## 5) Recommended next steps

1. Start Cycle 3.1: global error handling and toast infrastructure across home/quests/stats.
2. Add retention polish (streak-in-danger cue + celebration behavior + daily-roll feedback).
3. Expand test coverage around analytics interactions and progression edge cases.
4. Run perf/deployment hardening pass (loading states, Lighthouse, telemetry wiring).

## 6) Cycle 1 closure statement

- Cycle 1 is closed: Phase 1.1–1.3 implementation completed, with 1.4/1.5 baseline behavior present and checklist sign-off captured.
- No blocker remains in `today-focus-leftovers-checklist.md`.
- Project is ready to begin Cycle 2 work.
## 7) Related references

- `documentation/status/current-status-architecture.md`
- `documentation/plans/home-ui-tracker.md`
- `documentation/plans/today-focus-ui-plan.md`
- `documentation/plans/today-focus-leftovers-checklist.md`
- `documentation/ops/dev-notes-one-liners.md`

## 8) Cycle 2 kickoff note (solo taxonomy)

- Analytics route is now standardized as `/stats` (replacing `/guild-stats`).
- UI and docs now use solo-first terms (`Progress Stats`, `Today Quests`, `Today Queue`).
- Multiplayer framing is intentionally out of scope for this product iteration.

## 9) Cycle 2 closure statement

- Cycle 2 is complete: analytics API, range switching, KPI deltas, and three core charts are shipped on `/stats`.
- Stats page now includes themed tooltips, chart table fallbacks, responsive tuning, and empty-state/reset UX polish.
- Project is ready to begin Cycle 3 hardening and ship preparation.

## 10) Cycle 3 kickoff priorities

- Phase 3.1: global error handling + toast primitive + offline messaging baseline.
- Phase 3.2: retention effects aligned to solo flow (streak risk cue + celebration control).
- Phase 3.3+: test/perf/deploy readiness with telemetry and release checklist.

## 11) Cycle 4 kickoff - Phase 4.1 closeout

- Added real focus-session backend pipeline:
  - `src/models/FocusSession.ts`
  - `POST /api/focus/start`
  - `POST /api/focus/stop`
  - `GET /api/focus/active`
- Extended `GET /api/metrics/summary` with `kpis.focusMinutesLast7d`.
- Updated today dashboard fetch/mapping path to surface real focus minutes and removed the focus placeholder branch from stats strip.
- Added `useFocusTimer` plus Today-shell active-session UX (start/stop + hydrate restore cue).
- Added test coverage:
  - `src/tests/focus-pipeline.test.ts`
  - `src/tests/api-routes-focus.test.ts`
  - `src/tests/use-focus-timer.test.tsx`
  - `e2e/focus-pipeline.spec.ts`
- Validation:
  - `npm run typecheck` passed
  - targeted `npm run test:ci -- api-routes focus-pipeline api-routes-focus use-focus-timer client-api-today-dashboard today-dashboard-mappers` passed
  - scoped lint `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
- No historical backfill is applied for focus minutes: existing users will display `0m` until they accumulate real focus sessions.
