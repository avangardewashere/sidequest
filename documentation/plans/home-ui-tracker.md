# [HomeUI] - tracker

Tracks progress for the UI-first Home (`Today/Focus`) rollout.

## Scope

- Home (`Today/Focus`) UI plus **read-only and mutation client calls** to existing APIs (no new route handlers or schema changes in the data-wiring phase)
- Adjacent shells (Quest list tab route, Calendar, Codex) still future work

## Color Migration Status

- Theme token migration for Home + Quests View completed using the Indigo + Ember palette.
- Legacy `--sq-*` runtime usage in `src/**` has been removed.
- Remaining dark-mode tuning is tracked as a future phase and not part of this closeout.

## Current Phase

- **Phase 1 extended:** Live dashboard on home (`useTodayDashboard`, mappers, sections, complete-from-row, quick-add sheet). **Phase 2** (per `documentation/plans/today-focus-ui-plan.md`): richer interactions and optional tab routing when ready.

## Checklist Status

### A) Setup And Contracts

- [x] `src/components/home/today-focus-mock-data.ts` created
- [x] Typed contracts exported (`TodayHeaderData`, `TodayXpData`, `TodayStatItem`, `MainQuestData`, `TaskMetaItem`, `TaskRowData`, `TaskSectionData`, `TodayTabItem`)
- [x] Canonical `todayFocusMockData` seeded
- [x] No `any` usage in Home contracts

### B) Build Home Primitives

- [x] `today-focus-header.tsx`
- [x] `today-focus-xp-stats.tsx`
- [x] `today-focus-main-quest.tsx`
- [x] `today-focus-task-row.tsx`
- [x] `today-focus-task-section.tsx`
- [x] `today-focus-fab.tsx`
- [x] `today-focus-tab-bar.tsx`
- [x] Variant coverage confirmed (`done`, `xp`, `meta`, right-side section label/counter)

### C) Compose Home Screen

- [x] `today-focus-shell.tsx`
- [x] Compose section order and anchored controls
- [x] Keep interactions presentational
- [x] Validate responsive layout behavior

### D) Integrate With Route

- [x] Swap authenticated `/` surface to `TodayFocusShell`
- [x] Preserve loading and unauthenticated branches
- [x] Remove obsolete imports if needed

### E) Validate Before Sign-Off

- [x] Lint/type diagnostics for touched files
- [x] Visual QA vs design reference (initial mock phase)
- [x] Confirm no backend/API/model changes (UI-only foundation)

### F) Phase 1 Exit Gate

- [x] Authenticated Home shows Today/Focus UI
- [x] Unauthenticated Home remains unchanged
- [x] Phase 1 acceptance criteria complete

### G) Live data on Home (post-foundation)

- [x] `fetchTodayDashboard` / `useTodayDashboard` consumed by `TodayFocusShell`
- [x] `today-dashboard-mappers.ts` + Vitest coverage
- [x] Header + XP/stats (partial stats) + main quest + sections from snapshot
- [x] Skeleton loading for header/XP block; error + retry path
- [x] Quest row complete → `PATCH` complete + `refresh`; quick-add FAB sheet → `POST /api/quests`
- [x] Authenticated `/` skips redundant `fetchDashboardData` in `useDashboardActions` (`prefetchDashboard: false`)

## Handoff Summary

- Removed transitional color compatibility layer and finalized role-based token usage.
- Verified route behavior remains stable for loading, unauthenticated, and authenticated states.
- Home and Quests View are now aligned with the new color system and ready for future dark-mode refinement.
- Today home reads live progression and quest lists; tab bar remains presentational; manual pass of `today-focus-leftovers-checklist.md` Section E still recommended after visual changes.

## Reference Docs

- `documentation/status/progress-summary.md`
- `documentation/plans/today-focus-ui-plan.md`
- `documentation/reference/design-references/sidequest-demo.jsx`
