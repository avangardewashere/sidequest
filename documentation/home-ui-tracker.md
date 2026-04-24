# [HomeUI] - tracker

Tracks progress for the UI-first Home (`Today/Focus`) rollout.

## Scope

- Client-side UI components only
- No API wiring, no database integration
- Focused on Home (`Today/Focus`) before adjacent screens

## Color Migration Status

- Theme token migration for Home + Quests View completed using the Indigo + Ember palette.
- Legacy `--sq-*` runtime usage in `src/**` has been removed.
- Remaining dark-mode tuning is tracked as a future phase and not part of this closeout.

## Current Phase

- **Phase 1: Home UI Foundation (Today/Focus)**

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
- [x] Visual QA vs design reference
- [x] Confirm no backend/API/model changes

### F) Phase 1 Exit Gate

- [x] Authenticated Home shows Today/Focus UI
- [x] Unauthenticated Home remains unchanged
- [x] Phase 1 acceptance criteria complete

## Handoff Summary

- Removed transitional color compatibility layer and finalized role-based token usage.
- Verified route behavior remains stable for loading, unauthenticated, and authenticated states.
- Home and Quests View are now aligned with the new color system and ready for future dark-mode refinement.

## Reference Docs

- `documentation/today-focus-ui-plan.md`
- `documentation/Design References/sidequest-demo.jsx`
