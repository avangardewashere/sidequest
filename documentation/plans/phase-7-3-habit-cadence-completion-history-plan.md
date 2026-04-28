# Phase 7.3 — Habit Cadence + Completion History (Plan)

Cycle 7 / Phase 7.3. Companion tracker: `phase-7-3-habit-cadence-completion-history-tracker.md`.

## Goal

Introduce cadence-aware quest behavior so one-offs and habits share a single quest model while completion history supports repeated habit completions and streak math.

## Why this phase starts now

Per `cycles-7-8-9-plan.md`, 7.1 and 7.2 are done. 7.3 is now the dependency bottleneck for:
- 8.1 list split (Habits / Todos / All)
- 8.2 detail heatmap/streak views
- 8.3 Today habit due + at-risk sections

## Scope

### In scope

- `Quest` schema additions:
  - `cadence` with default `{ kind: "oneoff" }`
  - `lastCompletedDate` (`YYYY-MM-DD`, UTC)
- `CompletionLog` evolution:
  - add `completionDate` (`YYYY-MM-DD`, UTC)
  - replace unique `(questId, userId)` with unique `(questId, userId, completionDate)`
  - idempotent backfill from `completedAt`
- Completion behavior split:
  - one-off completion keeps terminal `Quest.status = "completed"`
  - habit completion writes daily-period log + updates `lastCompletedDate`, no terminal status flip
- Cadence helper module:
  - `isDueToday`
  - `expectedDateForCadence`
  - `streakFromLogs`
- `GET /api/quests/[id]/history?days=N`

### Out of scope

- Tags/notes/links schema and routes (7.4)
- Core and habit primitives (7.5/7.6)
- Habit/todo UI redesign (Cycle 8)
- `isDaily` hard removal (deferred to 9.5 sweep)

## Migration contract (must freeze before coding)

1. Add nullable/new fields first (`cadence`, `lastCompletedDate`, `completionDate`) with safe defaults.
2. Backfill `CompletionLog.completionDate` from `completedAt` for existing rows.
3. Drop old unique index `(questId, userId)` only after backfill is complete.
4. Add new unique index `(questId, userId, completionDate)`.
5. Deploy read-path normalization that treats:
   - legacy `isDaily=true` as cadence daily during transition
   - missing cadence as one-off

## Parallel lane boundaries (locked)

### Backend lane (primary)

- Schema + index migration
- completion route behavior split
- cadence helper library
- history endpoint + tests

### UI lane (independent/parallel)

- 7.5 primitives can proceed independently on tokenized styles
- 7.4 schema work may run in parallel **only after migration contract freeze**
- No Cycle 8 page rewrites start until 7.3 gates are green

## Start gates for implementation

- Migration sequence documented and idempotent.
- Rollback strategy documented (recreate old index if needed).
- Compatibility policy documented for `isDaily` transition.
- Test matrix drafted for cadence boundaries and completion uniqueness.

## File touch targets

### Expected modified

- `src/models/Quest.ts`
- `src/models/CompletionLog.ts`
- `src/app/api/quests/[id]/complete/route.ts`
- `src/lib/progression.ts` (if cadence-aware progression split needs domain extraction)
- `src/types/dashboard.ts` and/or related shared types
- `src/lib/client-api.ts` (history endpoint contract)

### Expected new

- `src/lib/cadence.ts`
- `src/app/api/quests/[id]/history/route.ts`
- migration script under project migration/scripts path (to be confirmed from existing repo convention)

## Test plan

- Unit tests for cadence math:
  - DST boundaries
  - weekly cadence resets
  - custom every-N-day cadence
- Route tests:
  - `/complete` one-off vs habit behavior divergence
  - duplicate same-day completion blocked by unique index contract
  - `/history` auth + payload shape + range behavior
- Migration tests:
  - backfill idempotency
  - index swap safety

## Exit criteria (approval gates)

- Migration executes safely in local + CI validation environment.
- Completion semantics are explicit and contract-tested for one-off and habit quests.
- `isDaily` compatibility path is active on reads; new writes prefer cadence.
- `test:ci`, `typecheck`, `lint`, `build` are green (or documented pre-existing blockers).
- Tracker and progress-summary closeout note updated.
