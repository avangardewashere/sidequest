# Phase 7.5 — Core UI Primitives (Tracker)

Companion plan: `phase-7-5-core-ui-primitives-plan.md`.

## Checklist

- [x] `src/components/ui/button.tsx` — variants primary / secondary / ghost / destructive; sizes sm / md / lg; disabled; focus ring
- [x] `src/components/ui/badge.tsx` — variants difficulty / status / cadence / tier via tokens
- [x] `src/components/ui/card.tsx` — surface / elevated; optional accent border
- [x] `src/components/ui/form-field.tsx` — label, control slot, helper, error; a11y wiring
- [x] `src/components/ui/task-row.tsx` — checkbox, title, meta; complete / incomplete
- [x] `src/components/ui/progress-ring.tsx` — SVG, pct, size, label slot
- [x] `src/components/ui/sheet.tsx` — backdrop, panel (drawer responsive / bottom / end), focus baseline
- [x] `src/components/ui/bottom-nav.tsx` — four slots; `usePathname` + `TAB_ROUTE_MAP`
- [x] `src/components/ui/index.ts` — re-exports
- [x] `src/app/_dev/layout.tsx` — production `notFound`
- [x] `src/app/_dev/components/page.tsx` — visual harness
- [x] `src/tests/ui-primitives.test.tsx`
- [x] Quality gates: `npm run test:ci`, `npm run typecheck`, `npm run lint`, `npm run build`
- [x] `documentation/status/progress-summary.md` — 7.5 closeout
- [x] `documentation/plans/cycles-7-8-9-plan.md` — 7.5 status line

## Status

**Done** — Phase 7.5 closed. Next: Phase 7.6 (`StreakFlame`, `CalendarHeatmap`, `CadencePicker`, `HabitChip`, `TagChip`, `TagInput`, `NoteCard`, `LinkPicker`) per `cycles-7-8-9-plan.md`.
