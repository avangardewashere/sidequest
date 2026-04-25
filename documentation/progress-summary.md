# Progress Summary - Home Data Wiring And Current Status

This chapter summarizes what was delivered in the latest implementation pass and where the project stands now.

## 1) Project state snapshot

- The authenticated `/` route now renders a live-data Today/Focus home experience.
- The unauthenticated `/` login/register surface remains unchanged.
- Core quest APIs and progression APIs continue to power the main gameplay loop.
- Progress Stats remains a placeholder UI pending chart wiring.

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
  - `documentation/today-focus-leftovers-checklist.md` (Section E/F marked complete)
- Stats strip keeps `FOCUS` as a placeholder because no reliable focus-time source is wired yet.
- Bottom tab bar on home is still presentational (no route switching behavior yet).
- Progress Stats charts and metrics consumer wiring are still not implemented.

## 5) Recommended next steps

1. Start Cycle 2: implement Progress Stats charts by wiring `/stats` to `/api/metrics/summary`.
2. Decide and implement tab behavior (`Today`, `Quests`, `Calendar`, `Codex`) with route-safe navigation.
3. Expand automated coverage around home interactions (quick-add, optimistic completion, retries).
4. Add celebration/toast polish once Cycle 2 baseline is stable.

## 6) Cycle 1 closure statement

- Cycle 1 is closed: Phase 1.1–1.3 implementation completed, with 1.4/1.5 baseline behavior present and checklist sign-off captured.
- No blocker remains in `today-focus-leftovers-checklist.md`.
- Project is ready to begin Cycle 2 work.
## 7) Related references

- `documentation/current-status-architecture.md`
- `documentation/home-ui-tracker.md`
- `documentation/today-focus-ui-plan.md`
- `documentation/today-focus-leftovers-checklist.md`
- `documentation/dev-notes-one-liners.md`

## 8) Cycle 2 kickoff note (solo taxonomy)

- Analytics route is now standardized as `/stats` (replacing `/guild-stats`).
- UI and docs now use solo-first terms (`Progress Stats`, `Today Quests`, `Today Queue`).
- Multiplayer framing is intentionally out of scope for this product iteration.
