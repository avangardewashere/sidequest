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

- `/` dashboard + login/register surface (`src/app/page.tsx`)
- `/quests/create` create quest form (`src/app/quests/create/page.tsx`)
- `/quests/view` list/filter/sort/complete quests (`src/app/quests/view/page.tsx`)
- `/quests/[id]/edit` update/delete a quest (`src/app/quests/[id]/edit/page.tsx`)
- `/guild-stats` placeholder page (not wired to real charts yet) (`src/app/guild-stats/page.tsx`)

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
- Client-side behavior orchestration in `src/hooks/useDashboardActions.ts`

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
- Route-level UI separation (dashboard vs quest workflows)

### Partial / Placeholder

- Guild Stats UI exists but currently displays placeholder content only
- Metrics summary endpoint exists, but no current dashboard/chart consumer was found in `src`

### Not Present Yet

- End-to-end test suite (Playwright not configured yet)

## Security And Operational Notes

- Auth middleware protects `/quests/:path*` and `/guild-stats` (`src/middleware.ts`)
- `AUTH_SECRET` and `MONGODB_URI` are environment-driven
- Auth now fails fast when `AUTH_SECRET` is missing (`src/lib/auth.ts`, `src/middleware.ts`)
- Generated `.next/**` artifacts may appear locally; they are build/dev output, not source architecture

## Current Priorities (Recommended)

1. Implement real Guild Stats charts backed by `/api/metrics/summary`
2. Expand integration test coverage for auth, quest CRUD, completion, and progression endpoints
3. Add Playwright coverage for critical end-to-end flows
4. Monitor and refine CI quality gates as test surface grows

## One-Line Summary

**SideQuest is a working route-based gamified task platform with authenticated quest workflows and progression logic, with analytics UI, testing, and release maturity as the next major steps.**
