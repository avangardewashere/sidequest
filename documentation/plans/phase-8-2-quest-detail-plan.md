# Phase 8.2 — Quest detail page (Plan)

Cycle 8 / Phase 8.2. Companion tracker: `phase-8-2-quest-detail-tracker.md`.

## Goal

Ship [`src/app/quests/[id]/page.tsx`](src/app/quests/[id]/page.tsx): read-focused quest detail with hero, habit heatmap, children, tags, notes, links, hierarchy chrome, and **undo completion** (detail-only; list row remains quick-complete without undo).

## Scope

See tracker and [documentation/plans/cycles-7-8-9-plan.md](documentation/plans/cycles-7-8-9-plan.md) §8.2.

## Parity

- **List** ([`quest-list-view-client.tsx`](src/app/quests/view/quest-list-view-client.tsx)): quick complete only; no undo.
- **Detail**: undo one-off terminal completion; undo habit completion for a chosen UTC `completionDate` via `DELETE /api/quests/[id]/complete?date=YYYY-MM-DD`.

## Out of scope

Today (8.3), QuestForm redesign (8.4), bottom nav / FAB (8.5), search-driven `LinkPicker` (8.6).
