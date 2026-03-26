# Chapter 1 - Foundation Implemented

This chapter documents what is already built in the SideQuest system, including schema design, core flow, and critical functions.

## 1) What is already done

- Full-stack baseline is implemented with Next.js App Router, API route handlers, MongoDB (Mongoose), and NextAuth credentials auth.
- Authenticated users can:
  - register
  - sign in
  - create quests
  - complete quests
  - gain XP
  - level up
  - increase or reset streak based on completion timing
- Completion logs are stored for analytics and balancing.

## 2) Current architecture

- Frontend:
  - `src/app/page.tsx` (main dashboard UI and auth forms)
  - `src/app/layout.tsx` + `src/components/session-provider.tsx` (session context)
- Backend/API:
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/quests/route.ts`
  - `src/app/api/quests/[id]/complete/route.ts`
  - `src/app/api/progression/route.ts`
  - `src/app/api/metrics/summary/route.ts`
- Domain logic:
  - `src/lib/xp.ts`
  - `src/lib/progression.ts`
  - `src/lib/auth.ts`
  - `src/lib/db.ts`
- Data models:
  - `src/models/User.ts`
  - `src/models/Quest.ts`
  - `src/models/CompletionLog.ts`

## 3) Data schema explained

## User model

File: `src/models/User.ts`

Fields:
- `email` (unique, indexed) - login identity
- `passwordHash` - secure password storage (bcrypt hash)
- `displayName` - player visible name
- `totalXp` - accumulated XP
- `level` - current level
- `currentStreak` - ongoing day streak
- `longestStreak` - max streak achieved
- `lastCompletedAt` - last quest completion timestamp
- `createdAt`, `updatedAt` - from timestamps

Why it matters:
- Keeps progression state server-side (not client-trusted).

## Quest model

File: `src/models/Quest.ts`

Fields:
- `title` - quest name/task text
- `difficulty` - enum: `easy | medium | hard`
- `xpReward` - reward XP fixed at creation
- `status` - enum: `active | completed`
- `dueDate` - optional deadline
- `createdBy` - owner user id
- `completedAt` - timestamp when completed
- `createdAt`, `updatedAt` - from timestamps

Indexes:
- `{ createdBy: 1, status: 1, createdAt: -1 }`

Why it matters:
- Supports fast user quest listing and active/completed filtering.

## CompletionLog model

File: `src/models/CompletionLog.ts`

Fields:
- `questId` - source quest id
- `userId` - completing user id
- `xpEarned` - XP awarded on completion
- `difficulty` - quest difficulty at completion time
- `completedAt` - completion timestamp
- `createdAt`, `updatedAt` - from timestamps

Indexes:
- `{ userId: 1, completedAt: -1 }`

Why it matters:
- Audit trail and balancing data source (retention, reward tuning, pacing analysis).

## 4) Vital functions explained

## XP and level logic (`src/lib/xp.ts`)

- `getXpReward(difficulty)`
  - Maps difficulty to fixed XP:
  - `easy = 10`, `medium = 20`, `hard = 35`
- `xpRequiredForLevel(level)`
  - Quadratic progression curve: `50 * (level - 1)^2`
  - Prevents overly fast high-level growth
- `levelFromTotalXp(totalXp)`
  - Calculates resulting level from accumulated XP
- `currentLevelProgress(totalXp)`
  - Returns progress details for UI bars:
  - current level, XP in current level, XP required for next level

## Streak and completion progression (`src/lib/progression.ts`)

- `normalizeToUtcDate(date)`
  - Normalizes timestamp to date-only UTC boundary for consistent streak checks
- `getNextStreak(currentStreak, lastCompletedAt)`
  - same day: streak unchanged
  - next day: streak + 1
  - gap > 1 day: streak reset to 1
- `applyQuestCompletion(...)`
  - Main progression update function:
  - adds XP
  - computes new level
  - updates current + longest streak
  - sets `lastCompletedAt`

## Auth and session (`src/lib/auth.ts`)

- `authOptions`
  - Credentials provider
  - email/password validation with Zod
  - password verify with bcrypt
  - JWT session strategy
- `getAuthSession()`
  - Server helper used by protected API routes

## Database connection (`src/lib/db.ts`)

- `connectToDatabase()`
  - Connects to MongoDB using `MONGODB_URI`
  - Uses global cache to avoid duplicate connection creation in dev/runtime

## 5) Core request flow (important)

## Quest creation flow

1. Frontend posts `title`, `difficulty`, optional `dueDate` to `POST /api/quests`.
2. API validates payload with Zod.
3. API computes `xpReward` on server from difficulty.
4. Quest document is saved for current authenticated user.

## Quest completion flow (main gameplay loop)

1. Frontend calls `PATCH /api/quests/:id/complete`.
2. API verifies user auth and quest ownership.
3. API prevents duplicate completion (`status === completed` guard).
4. Quest is marked completed with `completedAt`.
5. User progression is recalculated using `applyQuestCompletion`.
6. CompletionLog entry is created.
7. API returns updated progression + `xpGained` for immediate feedback.

## 6) API surface implemented

- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`
- `GET /api/quests`
- `POST /api/quests`
- `PATCH /api/quests/:id/complete`
- `GET /api/progression`
- `GET /api/metrics/summary`

## 7) Guardrails and integrity rules already enforced

- Auth required for progression and quest APIs.
- XP is always server-derived from difficulty.
- Quest ownership check enforced before completion.
- Repeat completion blocked.
- Progression state kept in database, not trusted from client input.

## 8) Known scaling notes for future chapters

- Completion flow currently uses sequential document updates; for high-scale consistency, move to MongoDB transactions.
- Add idempotency keys for completion endpoint retries.
- Add rate limiting and anti-abuse controls on auth and write endpoints.
- Add event/queue pipeline later for analytics at larger traffic volumes.

---

This chapter is the baseline reference for the current system state. Next chapters should document retention systems (daily quests, milestones), social systems, and production hardening.
