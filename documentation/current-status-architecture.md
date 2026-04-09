# SideQuest Current Status And Architecture

This document summarizes the current state of the project and how the system is organized.

## Project Snapshot

- **Product type:** Gamified Todo app (quests + XP + levels + streaks)
- **Frontend:** Next.js App Router with client pages/components
- **Backend:** Next.js route handlers (`src/app/api/**`)
- **Auth:** NextAuth credentials provider
- **Database:** MongoDB Atlas via Mongoose models
- **Main value loop:** Create quest -> complete quest -> gain XP -> level/streak progression

## Current Feature Status

## Authentication

- Register with email, display name, and password.
- Login with credentials.
- Duplicate registration is handled cleanly (`409`) with race-condition fallback.

Key files:
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth.ts`
- `src/models/User.ts`

## Quest Management (Gamified Todo Core)

- Create quests on dedicated route.
- View quests on dedicated route with:
  - status filter (`all`, `active`, `completed`, `daily`)
  - category filter (`all`, `work`, `study`, `health`, `personal`, `other`)
  - sorting (`newest`, `oldest`, `highest_xp`, `category`)
- Edit existing quest fields (`title`, `description`, `difficulty`, `category`).
- Delete quest with warning confirmation popup.
- Complete active quests from view screen.

Key files:
- `src/app/quests/create/page.tsx`
- `src/app/quests/view/page.tsx`
- `src/app/quests/[id]/edit/page.tsx`
- `src/lib/client-api.ts`
- `src/lib/quest-selectors.ts`
- `src/app/api/quests/route.ts`
- `src/app/api/quests/[id]/route.ts`
- `src/app/api/quests/[id]/complete/route.ts`

## Progression And Retention

- XP rewards based on difficulty.
- Level progression computed from total XP.
- Daily quests generated and returned via daily endpoint.
- Streak tracking with milestone bonus rewards.
- Completion logs and milestone logs maintained.

Key files:
- `src/lib/xp.ts`
- `src/lib/progression.ts`
- `src/lib/dailies.ts`
- `src/app/api/dailies/route.ts`
- `src/models/CompletionLog.ts`
- `src/models/MilestoneRewardLog.ts`

## Dashboard And Navigation

- Home page is cleaner and summary-focused.
- Quest operations moved to route-specific pages.
- Navigation includes:
  - Home
  - Quest dropdown (`View Quests`, `Create Quest`)
  - Guild Stats placeholder route
  - Logout

Key files:
- `src/app/page.tsx`
- `src/components/dashboard-nav.tsx`
- `src/app/guild-stats/page.tsx`

## Data Model Overview

## User

- identity: `email`, `passwordHash`, `displayName`
- progression: `totalXp`, `level`, `currentStreak`, `longestStreak`, `lastCompletedAt`

## Quest

- content: `title`, `description`
- game attributes: `difficulty`, `xpReward`, `category`
- state: `status`, `completedAt`
- ownership: `createdBy`
- retention fields: `isDaily`, `dailyKey`

## Log Models

- `CompletionLog`: records each completion event.
- `MilestoneRewardLog`: enforces one-time milestone reward claims.

## API Surface (Current)

Auth:
- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`

Quest:
- `GET /api/quests`
- `POST /api/quests`
- `GET /api/quests/:id`
- `PATCH /api/quests/:id`
- `DELETE /api/quests/:id`
- `PATCH /api/quests/:id/complete`

Progression and retention:
- `GET /api/progression`
- `GET /api/dailies`
- `GET /api/metrics/summary`

## Architecture Layers

- **Pages (`src/app/**/page.tsx`)**
  - Route-level UI and composition.
- **Components (`src/components/**`)**
  - Reusable UI blocks (example: navigation).
- **Hooks (`src/hooks/**`)**
  - Client interaction/state orchestration (example: dashboard actions).
- **Client API wrappers (`src/lib/client-api.ts`)**
  - Frontend fetch abstraction for route handlers.
- **Domain utilities (`src/lib/*.ts`)**
  - XP math, progression logic, dailies, formatting, selectors.
- **Route handlers (`src/app/api/**`)**
  - Validation, authorization, persistence, response shaping.
- **Models (`src/models/**`)**
  - MongoDB schema and indexing strategy.
- **Types (`src/types/**`)**
  - Shared contracts between client and server layers.

## Current Strengths

- Clear separation between dashboard summary and quest workflows.
- Dedicated CRUD route for quests supports future expansion.
- Gamification loop (XP/level/streak/milestones) is already integrated.
- Shared selectors and API wrappers reduce repeated logic.

## Current Gaps / Next Recommended Improvements

- Add server-side filtering/sorting query params for large quest datasets.
- Add stronger delete safety (optional typed confirmation) for destructive action.
- Expand Guild Stats with real charts from metrics data.
- Add automated tests for auth, quest CRUD, and completion/progression endpoints.
- Improve error surface in UI for network/API failures (user-friendly messages per action).

## One-Line Summary

**SideQuest is now a structured, route-based gamified todo platform with working auth, quest CRUD, progression systems, and a scalable architecture foundation for analytics and future social/game features.**
