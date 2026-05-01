# Phase 7.6 — Habit & capture primitives (Plan)

Cycle 7 / Phase 7.6. Companion tracker: `phase-7-6-habit-capture-primitives-tracker.md`.

## Goal

Ship habit- and second-brain-specific presentational atoms under `src/components/ui/`, reusing Phase 7.5 primitives where specified. No production page wiring; no new API routes.

## Scope

### In scope

- `TagChip`, `TagInput`, `CadencePicker`, `HabitChip`, `NoteCard`, `CalendarHeatmap`, `StreakFlame`, `LinkPicker` (see tracker).
- Barrel exports in `src/components/ui/index.ts`.
- Extend `src/app/_dev/components/page.tsx` with demos.
- RTL tests in `src/tests/ui-habit-atoms.test.tsx` (and splits if needed).

### Out of scope

- Cycle 8 quest list/detail/Today wiring.
- `GET /api/quests/search`; `LinkPicker` stays props-driven until 8.6.
- Full markdown dependency for `NoteCard`; default plain text + optional `renderBody` prop.

## Conventions

- Tokens: `var(--color-*)` consistent with Phase 7.5.
- `CadencePicker` values align with `QuestCadence` in `src/types/dashboard.ts`.
- `CalendarHeatmap` uses UTC `YYYY-MM-DD` keys consistent with `src/lib/cadence.ts`.

## Handoff

Cycle 8.1 list and 8.2 detail consume these atoms; `LinkPicker` gains live search in 8.6.
