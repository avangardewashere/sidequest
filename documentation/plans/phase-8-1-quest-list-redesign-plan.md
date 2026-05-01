# Phase 8.1 — Quest list redesign (Plan)

Cycle 8 / Phase 8.1. Companion tracker: `phase-8-1-quest-list-redesign-tracker.md`.

## Goal

Redesign [`src/app/quests/view/page.tsx`](src/app/quests/view/page.tsx) using Phase 7.5/7.6 UI primitives: Habits / Todos / All tabs, top-level default rows, sticky filters, tag chips with `?tag=` URL sync, and cadence-aware row chrome—without shell swap (8.5) or detail page (8.2).

## Scope

See tracker checklist and [documentation/plans/cycles-7-8-9-plan.md](documentation/plans/cycles-7-8-9-plan.md) §8.1.

## Out of scope

Quest detail route (8.2), Today (8.3), QuestForm (8.4), bottom nav / FAB (8.5), search API (8.6), undo completion (8.2).

## Handoff

8.2 detail page reuses heatmap, streak, tags, and links primitives.
