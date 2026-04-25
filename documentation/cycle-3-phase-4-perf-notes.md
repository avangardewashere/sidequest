# Cycle 3 Phase 3.4 Performance Notes

## Scope

- Route-level loading boundaries for app, quest list, and stats.
- Hot-path render pressure reduction in Home task rows/sections and quest list cards.
- Stats render-path optimization for chart/table data mapping stability.

## Baseline observations (before)

- `/` relied on inline loading text while auth/session resolved.
- `/quests/view` rendered a full card tree directly in-page on each list update.
- `/stats` recomputed chart/table mapping arrays every render and used date-only keys that could collide in mocked/fallback datasets.

## Implemented optimizations

- Added route loading files:
  - `src/app/loading.tsx`
  - `src/app/quests/view/loading.tsx`
  - `src/app/stats/loading.tsx`
- Memoized hot-path components:
  - `src/components/home/today-focus-task-row.tsx`
  - `src/components/home/today-focus-task-section.tsx` (memoized derived task list)
  - `src/app/quests/view/page.tsx` (memoized quest card + stable complete callback)
- Optimized stats render mappings in `src/app/stats/page.tsx`:
  - memoized `completionChartData` and `xpChartData`
  - switched repeated date-only keys to stable `date-index` keys to avoid duplicate-key churn

## After observations

- Loading transition is now route-native and visually consistent across the three primary surfaces.
- Quest list and home task rendering perform less repeated mapping work under filter/refresh interactions.
- Stats chart/table render path is more stable under repeated updates and deterministic E2E mock data.

## Notes for Phase 3.5 handoff

- Optional next optimization: split heavy chart section into a lazy-loaded client component if Lighthouse mobile traces indicate chart bundle pressure.
- Keep accessibility table fallbacks unchanged if lazy loading is introduced.
