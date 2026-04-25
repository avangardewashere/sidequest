# SideQuest Current Status And Architecture

This document reflects the repository's current implementation status.

## Project Snapshot

- **Type:** gamified task app (quests, XP, levels, streaks)
- **Frontend:** Next.js App Router + React + TypeScript (`src/app/**`)
- **Backend:** Next.js route handlers (`src/app/api/**`)
- **Auth:** NextAuth credentials flow with JWT sessions (`src/lib/auth.ts`)
- **Data store:** MongoDB via Mongoose (`src/lib/db.ts`, `src/models/**`)
- **Main loop:** create quest -> complete quest -> award XP -> update progression

## Implemented Application Surfaces

### Routes (UI)

- `/` Today/Focus home shell when authenticated; login/register when not (`src/app/page.tsx`)
- `/quests/create` create quest form (`src/app/quests/create/page.tsx`)
- `/quests/view` list/filter/sort/complete quests (`src/app/quests/view/page.tsx`)
- `/quests/[id]/edit` update/delete a quest (`src/app/quests/[id]/edit/page.tsx`)
- `/stats` live analytics page with range-aware charts (`src/app/stats/page.tsx`)

### API Endpoints

- **Auth**
  - `POST /api/auth/register`
  - `GET|POST /api/auth/[...nextauth]`
- **Quests**
  - `GET /api/quests?status=&category=&sort=&limit=`
  - `POST /api/quests`
  - `GET /api/quests/:id`
  - `PATCH /api/quests/:id`
  - `DELETE /api/quests/:id` (requires `confirmTitle` in body)
  - `PATCH /api/quests/:id/complete`
- **Progression/retention**
  - `GET /api/progression`
  - `GET /api/dailies`
  - `GET /api/metrics/summary`

## Architecture Breakdown

### Presentation Layer

- Route-level pages under `src/app/**/page.tsx`
- Shared navigation and session wrapper components in `src/components/**`
- Client-side behavior orchestration in `src/hooks/useDashboardActions.ts` and `src/hooks/useTodayDashboard.ts`

### Application Layer

- Browser fetch wrappers and error mapping in `src/lib/client-api.ts`
- Query parsing helper for quest list requests in `src/lib/quest-selectors.ts`
- API request logging utility with opt-in query flag `showlogger=true` in `src/lib/server-logger.ts`

### Domain Layer

- XP and leveling logic in `src/lib/xp.ts`
- Completion and streak progression in `src/lib/progression.ts`
- Daily quest generation in `src/lib/dailies.ts`

### Data Layer

- Shared MongoDB connection helper in `src/lib/db.ts`
- Mongoose models:
  - `User` (`src/models/User.ts`)
  - `Quest` (`src/models/Quest.ts`)
  - `CompletionLog` (`src/models/CompletionLog.ts`)
  - `MilestoneRewardLog` (`src/models/MilestoneRewardLog.ts`)

## Feature Status

### Implemented

- Credential-based register/login flow with protected quest-related routes
- Full quest CRUD + completion flow
- Difficulty-based XP rewards and progression profile calculations
- Daily quest endpoint and milestone/completion log tracking
- Route-level UI separation (home Today/Focus vs quest workflows)
- Authenticated home (`TodayFocusShell`) loads live progression, active quests, and dailies via `useTodayDashboard` / `fetchTodayDashboard`, maps them in `src/lib/today-dashboard-mappers.ts`, supports completing quests from the list, quick-add (`TodayFocusQuickAddSheet`), and row navigation to quest edit
- Home active quest fetch now uses explicit `priority_due` sorting (`/api/quests?status=active&sort=priority_due`) to keep solo Today list ordering deterministic for Phase 1.3
- Vitest suite for domain logic and route-handler integration coverage (`src/tests/**`)
- Playwright critical flow E2E suite (`e2e/critical-flows.spec.ts`)
- GitHub Actions CI + separate E2E workflow (`.github/workflows/ci.yml`, `.github/workflows/e2e.yml`)

### Partial / Placeholder

- Bottom tab bar on home remains presentational (no route changes); stats strip “Focus” tile is a placeholder until a metrics source exists

### Not Present Yet

- Global error boundary coverage for app + route segments planned for Cycle 3
- Deeper retention effects (streak risk cues, celebration polish) planned for Cycle 3

## Security And Operational Notes

- Auth middleware protects `/quests/:path*` and `/stats` (`src/middleware.ts`)
- `AUTH_SECRET` and `MONGODB_URI` are environment-driven
- Auth now fails fast when `AUTH_SECRET` is missing (`src/lib/auth.ts`, `src/middleware.ts`)
- Generated `.next/**` artifacts may appear locally; they are build/dev output, not source architecture

## Current Priorities (Recommended)

1. Start Cycle 3.1 global error handling and toast infrastructure
2. Expand automated coverage for new analytics interactions and retention behaviors
3. Add performance hardening for stats charts (lazy load + Lighthouse checks)
4. Prepare deployment and telemetry pass (Vercel + error tracking + analytics)

## Documentation Trackers

- **[HomeUI] - tracker** (`documentation/home-ui-tracker.md`)
- Progress summary (`documentation/progress-summary.md`)
- Today/Focus phase plan (`documentation/today-focus-ui-plan.md`)
- Color scheme rollout plan (`.cursor/plans/color-scheme-rollout-plan_2f6e2ea3.plan.md`)

## UI Theme Status

- The app now uses the Indigo + Ember tokenized color system defined in `src/app/globals.css`.
- Legacy `--sq-*` compatibility aliases have been retired from source usage and CSS token exports.
- Home and quest-view surfaces have been migrated to role-based tokens (`--color-primary*`, `--color-secondary*`, `--color-text-*`, `--color-border-*`, semantic tokens).

## Token Usage Rules

- Use `--color-primary*` for progression, CTAs, active states, and XP-related emphasis.
- Use `--color-secondary` for decorative heat/streak accents and `--color-secondary-strong` for readable ember text.
- Use semantic tokens (`--color-success*`, `--color-warning*`, `--color-danger*`) only for state/status semantics.
- Use neutral tiers consistently: `--color-text-primary` (content), `--color-text-secondary` (meta), `--color-text-tertiary` (inactive labels), and matching border tiers.

## One-Line Summary

**SideQuest is a working route-based gamified task platform with authenticated quest workflows and progression logic; the home surface is a Today/Focus hub wired to live progression and quests (plus quick-add and inline complete) on a tokenized Indigo + Ember theme, and `/stats` now delivers range-aware personal analytics with KPI deltas and chart fallbacks; Cycle 3 hardening and ship-readiness are the next major steps.**

## Cycle 1 Closeout

- Cycle 1 (Home data wiring and interaction baseline) is closed.
- Section E/F verification has been completed in `documentation/today-focus-leftovers-checklist.md`.
- Remaining scope now transitions to Cycle 2 analytics surfaces and related test hardening.

## Cycle 2 Closeout

- Cycle 2 (Stats analytics surface) is closed.
- `/stats` is now fully wired to `/api/metrics/summary` with `7d|30d|90d` ranges, KPI deltas, and three chart surfaces.
- Accessibility and polish additions shipped (`<details>` data tables, empty-state panel, confirm-only reset action).
- Remaining scope now transitions to Cycle 3 hardening + deployment readiness.
