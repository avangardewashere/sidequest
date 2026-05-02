# Phase 9.2 — Habit progressions & insights

Companion tracker: `phase-9-2-habit-insights-tracker.md`. Parent roadmap: `cycles-7-8-9-plan.md` § Phase 9.2.

## Goals

- Per-quest **insights** for habit cadence: completion cadence over time, best day of week, current vs longest streak, XP per week (rolling window).
- **Stats** surface: top habits by streak, aggregated habit completion heatmap, weekly XP trend — via extended `GET /api/metrics/summary` (single round-trip).
- **Child ordering**: `order` on `Quest`, `PATCH .../children/reorder`, sort children by `(order, createdAt desc)` in list APIs.

## Non-habit quests

`GET /api/quests/[id]/insights` returns **200** with `habit: false` and empty analytics plus a short `message` so the client can hide or show a one-line explanation without treating it as an error.

## Out of scope

- Drag-and-drop reorder (up/down only).
- Per-quest insights UI on Stats (global aggregates only).
- Mongo `$text` / Atlas Search.
