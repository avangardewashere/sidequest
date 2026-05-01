# Phase 8.3 — Today surface (Plan)

Cycle 8 / Phase 8.3. Companion tracker: `phase-8-3-today-surface-tracker.md`.

## Goal

Augment authenticated home (`/`) with **Habits due today**, **At-risk streaks** (due today, not completed UTC, streak ≥ 3), and **Captured this week** (active one-off, no tags, created in last 7 UTC days), using server-backed streaks via `GET /api/today/habit-surface` merged into `useTodayDashboard`.

## Parity

- Streak math matches [`streakFromLogs`](src/lib/cadence.ts); due logic matches [`isDueToday`](src/lib/cadence.ts) plus explicit “completed today” from `CompletionLog` for the UTC date key.

## Out of scope

Quest form (8.4), bottom nav / FAB (8.5), search (8.6).
