# Phase 7.3 — Habit Cadence + Completion History (Tracker)

Cycle 7 / Phase 7.3. Pair with `phase-7-3-habit-cadence-completion-history-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[x] done`

## A. Preconditions and gate approval

- [x] 7.1 done baseline confirmed.
- [x] 7.2 done baseline confirmed.
- [x] 7.3 identified as immediate next implementation phase.
- [x] Migration contract approved (order + idempotency + rollback).
- [x] Read compatibility policy approved (`isDaily` -> cadence normalization).

### A.1 Migration/index transition contract (frozen)

1. Additive deploy first: add `Quest.cadence`, `Quest.lastCompletedDate`, and `CompletionLog.completionDate` without removing legacy fields/indexes.
2. Backfill pass: set missing `completionDate` as UTC date (`YYYY-MM-DD`) derived from `completedAt`.
3. Data verification gate: query confirms no `CompletionLog` documents remain with null/empty `completionDate`.
4. Index swap: drop unique `{ questId: 1, userId: 1 }` only after verification, then create unique `{ questId: 1, userId: 1, completionDate: 1 }`.
5. Rollback rule: if swap fails, recreate legacy unique index immediately and leave route behavior in one-off mode only.
6. Idempotency rule: rerunning backfill only updates docs where `completionDate` is missing.

### A.2 Read compatibility policy (frozen)

- During transition, read paths normalize cadence as:
  - `quest.cadence.kind` when present
  - fallback to `{ kind: "daily" }` when `isDaily === true`
  - fallback to `{ kind: "oneoff" }` otherwise
- New behavior writes should update cadence-driven fields (`completionDate`, `lastCompletedDate`) and avoid introducing new `isDaily` writes.

## B. Schema layer

### B.1 Quest

- [x] Add `cadence` with default `{ kind: "oneoff" }`.
- [x] Add `lastCompletedDate` UTC date string field.
- [x] Add schema validation for cadence shape (`daysOfWeek`, `everyNDays` as needed by kind).

### B.2 CompletionLog

- [x] Add `completionDate` UTC date string field.
- [x] Backfill `completionDate` from `completedAt` (idempotent script).
- [x] Drop legacy unique `(questId, userId)` index.
- [x] Add unique `(questId, userId, completionDate)` index.

## C. Behavior layer

- [x] Split completion behavior in `quests/[id]/complete`:
  - one-off retains terminal completion behavior
  - habit writes repeatable log + updates `lastCompletedDate`
- [x] Ensure XP and milestone hooks remain consistent with the new branch logic.

## D. Cadence utilities

- [x] Create `src/lib/cadence.ts`.
- [x] Implement `isDueToday`.
- [x] Implement `expectedDateForCadence`.
- [x] Implement `streakFromLogs`.

## E. History endpoint

- [x] Add `GET /api/quests/[id]/history?days=N`.
- [x] Return `{ completions: { date, xp }[] }` contract.
- [x] Enforce auth + ownership checks.

## F. Parallel lane boundaries (locked)

- [x] Backend lane defined: migration + behavior + endpoint.
- [x] UI lane defined: 7.5 can proceed independently.
- [x] 7.4 parallelism allowed only after migration contract freeze.
- [x] Confirm no Cycle 8 implementation starts before 7.3 gates pass.

## G. Testing and quality gates

- [x] Cadence math edge tests (DST/week boundaries/custom intervals).
- [x] Completion route contract tests (one-off vs habit).
- [x] Migration idempotency/index-swap tests.
- [x] History endpoint route tests.
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

## H. Closeout

- [x] Add 7.3 closeout note to `documentation/status/progress-summary.md`.
- [x] Update `documentation/plans/cycles-7-8-9-plan.md` phase status marker.
- [x] Record any deferred work and blockers.

## Blockers

- None.

## Decision log

- 2026-04-29: 7.3 selected as immediate next coding phase after 7.1/7.2 completion.
- 2026-04-29: Parallel-lane policy locked (7.3 backend-first, 7.5 independent UI lane, 7.4 after migration contract freeze).
- 2026-04-29: Implemented cadence schema/history endpoint branch and migration script with additive-first + backfill + index-swap order.
- 2026-04-29: Environment blockers resolved (`next typegen` + Vitest worker/memory tuning); all quality gates executed successfully.
- 2026-04-29: Phase marked complete; handoff target moved to 7.4 tags/notes/links schema implementation.
