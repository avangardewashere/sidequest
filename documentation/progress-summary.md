# Progress Summary - Home Data Wiring And Current Status

This chapter summarizes what was delivered in the latest implementation pass and where the project stands now.

## 1) Project state snapshot

- The authenticated `/` route now renders a live-data Today/Focus home experience.
- The unauthenticated `/` login/register surface remains unchanged.
- Core quest APIs and progression APIs continue to power the main gameplay loop.
- Guild Stats remains a placeholder UI pending chart wiring.

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

- Manual visual/responsive sign-off checklist is still pending:
  - `documentation/today-focus-leftovers-checklist.md` (Section E/F verification workflow)
- Stats strip keeps `FOCUS` as a placeholder because no reliable focus-time source is wired yet.
- Bottom tab bar on home is still presentational (no route switching behavior yet).
- Guild Stats charts and metrics consumer wiring are still not implemented.

## 5) Recommended next steps

1. Complete manual Section E/F QA checklist and record findings under **Issues** in `today-focus-leftovers-checklist.md`.
2. Decide and implement tab behavior (`Today`, `Quests`, `Calendar`, `Codex`) with route-safe navigation.
3. Start Guild Stats implementation by wiring `/guild-stats` to `/api/metrics/summary`.
4. Expand automated coverage around home interactions (quick-add, optimistic completion, retries).

## 6) Related references

- `documentation/current-status-architecture.md`
- `documentation/home-ui-tracker.md`
- `documentation/today-focus-ui-plan.md`
- `documentation/today-focus-leftovers-checklist.md`
- `documentation/dev-notes-one-liners.md`
