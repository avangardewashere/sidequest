# [HomeUI] - tracker

Tracks progress for the UI-first Home (`Today/Focus`) rollout.

## Scope

- Client-side UI components only
- No API wiring, no database integration
- Focused on Home (`Today/Focus`) before adjacent screens

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

- [ ] `today-focus-shell.tsx`
- [ ] Compose section order and anchored controls
- [ ] Keep interactions presentational
- [ ] Validate responsive layout behavior

### D) Integrate With Route

- [ ] Swap authenticated `/` surface to `TodayFocusShell`
- [ ] Preserve loading and unauthenticated branches
- [ ] Remove obsolete imports if needed

### E) Validate Before Sign-Off

- [ ] Lint/type diagnostics for touched files
- [ ] Visual QA vs design reference
- [ ] Confirm no backend/API/model changes

### F) Phase 1 Exit Gate

- [ ] Authenticated Home shows Today/Focus UI
- [ ] Unauthenticated Home remains unchanged
- [ ] Phase 1 acceptance criteria complete

## Reference Docs

- `documentation/today-focus-ui-plan.md`
- `documentation/Design References/sidequest-demo.jsx`
