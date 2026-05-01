# Phase 7.5 — Core UI Primitives (Plan)

Cycle 7 / Phase 7.5. Companion tracker: `phase-7-5-core-ui-primitives-tracker.md`.

## Goal

Introduce token-driven presentational components under `src/components/ui/` so Cycle 8 pages and Phase 7.6 habit atoms share a stable import surface. No business logic; no production page wiring in this phase.

## Scope

### In scope

- Components (see tracker checklist): `Button`, `Card`, `Badge`, `FormField`, `TaskRow`, `ProgressRing`, `Sheet` / responsive drawer shell, `BottomNav`.
- Barrel export `src/components/ui/index.ts` matching repo import style (`@/components/ui/...`).
- Dev harness: `src/app/_dev/components/page.tsx` with variant toggles; `_dev` gated in production via layout (see implementation).
- RTL smoke tests for interactive and variant behavior where stable.

### Out of scope

- Replacing `DashboardNav` / `TodayFocusTabBar` in the app shell (Cycle 8.5).
- Habit-specific atoms (`HabitChip`, heatmap, etc.) — Phase 7.6.
- Wiring primitives into production quest/today/stats routes — Cycle 8.

## Technical conventions

- **Tokens**: `var(--color-*)` from `src/app/globals.css` `@theme`; align with existing quest-view inline token usage.
- **Client vs server**: `"use client"` on `BottomNav`, `TaskRow`, `Sheet`, and the dev harness page; keep dumb wrappers server-friendly when no hooks.
- **Accessibility**: visible `:focus-visible` rings, `aria-invalid` / `aria-describedby` on `FormField`, checkbox labeling on `TaskRow`, `ProgressRing` text alternative for percent.

## Handoff to Phase 7.6

7.6 should import `Badge`, `Card`, `Button`, `Sheet` for habit and capture atoms per `cycles-7-8-9-plan.md`.
