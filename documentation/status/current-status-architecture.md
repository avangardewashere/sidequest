# SideQuest Current Status And Architecture

This document reflects the repository's current implementation status.

## Project Snapshot

- **Type:** quest-centric productivity app (todo + habit + second-brain trajectory)
- **Frontend:** Next.js App Router + React + TypeScript (`src/app/**`)
- **Backend:** Next.js route handlers (`src/app/api/**`)
- **Auth:** NextAuth credentials flow with JWT sessions (`src/lib/auth.ts`)
- **Data store:** MongoDB via Mongoose (`src/lib/db.ts`, `src/models/**`)
- **Main loop (current):** create quest -> complete quest -> award XP -> update progression
- **Main loop (next):** cadence-aware quest completions + durable quest context (tags/notes/links)

## Strategic Direction (Cycles 7-9)

The active roadmap is now the quest, habit, and second-brain pivot documented in
`documentation/plans/cycles-7-8-9-plan.md`.

- **7.1** design tokens: complete.
- **7.2** quest hierarchy foundation (`parentQuestId`, child routes, selector helpers): complete.
- **7.3 next:** cadence + completion-history contract (schema + migration + behavior split).

Cycle 6 remains parked except for the minimum PWA shell slice planned in 9.6.

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

1. Execute Phase 7.3 (cadence + completion history) as the next schema milestone.
2. Run 7.4 (tags/notes/links schema) in parallel only after 7.3 migration contract is frozen.
3. Start 7.5 core primitives as an independent UI lane; 7.6 follows on top of 7.5.
4. Keep documentation synchronized with each 7.x phase closeout to prevent roadmap drift.

## Documentation Trackers

- **[HomeUI] - tracker** (`documentation/plans/home-ui-tracker.md`)
- Progress summary (`documentation/status/progress-summary.md`)
- Today/Focus phase plan (`documentation/plans/today-focus-ui-plan.md`)
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

**SideQuest is a working authenticated quest platform with live Today and Stats surfaces, now aligned to a Cycle 7-9 pivot where hierarchy foundations are complete (7.1/7.2) and cadence-driven habit history (7.3) is the immediate implementation target.**

## Cycle 1 Closeout

- Cycle 1 (Home data wiring and interaction baseline) is closed.
- Section E/F verification has been completed in `documentation/plans/today-focus-leftovers-checklist.md`.
- Remaining scope now transitions to Cycle 2 analytics surfaces and related test hardening.

## Cycle 2 Closeout

- Cycle 2 (Stats analytics surface) is closed.
- `/stats` is now fully wired to `/api/metrics/summary` with `7d|30d|90d` ranges, KPI deltas, and three chart surfaces.
- Accessibility and polish additions shipped (`<details>` data tables, empty-state panel, confirm-only reset action).
- Remaining scope now transitions to Cycle 3 hardening + deployment readiness.

## Cycle 3 Summary Status

- Cycle 3 implementation scope across phases 3.1 to 3.5 is documented in `documentation/chapters/chapter-6-cycle-3-summary.md`.
- Closeout status: Cycle 3 is fully closed with preview and production deployments completed.

## Cycle 5 Summary Status

- Cycle 5 implementation scope across phases 5.1 to 5.6 is now closed.
- Personalization is durable end-to-end:
  - onboarding-derived preferences are consumed by weekly review, historical review, and next-best suggestion surfaces
  - `/you` now provides post-onboarding edits via `PATCH /api/you/preferences` without mutating `onboardingCompletedAt`
- Behavioral analytics foundation and read-side surfaces are complete:
  - write-side event capture (`/api/events`) with a fixed allowlist
  - read-side aggregation (`/api/events/analytics`) and `/stats` card presentation
- Closeout caveat: targeted Playwright specs remain intermittently blocked locally by port `3000` contention; unit/type/lint/build quality gates for the phase pass.
