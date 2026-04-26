# Phase 4.1 - Real Focus-Time Pipeline (Tracker)

Pair with `phase-4-1-focus-pipeline-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[x]` closed

## A. Backend

### A.1 Model and indexes

- [x] Create `src/models/FocusSession.ts` with required fields.
- [x] Add `{ userId: 1, startedAt: -1 }` index.
- [x] Add partial unique open-session index for `{ userId, endedAt: null }`.
- [x] Verify indexes locally. (Schema-level verification in `src/tests/focus-session-model.test.ts`; remote cluster index query remains environment-dependent.)

### A.2 Routes

- [x] Add `POST /api/focus/start` route.
- [x] Add `POST /api/focus/stop` route.
- [x] Add `GET /api/focus/active` route.
- [x] Match existing request logging style in all three routes.

### A.3 Metrics extension

- [x] Add `focusMinutesLast7d` to `src/app/api/metrics/summary/route.ts`.
- [x] Ensure the client response typing includes this field.

### A.4 Backend tests

- [x] Add `src/tests/focus-pipeline.test.ts`.
- [x] Add `src/tests/api-routes-focus.test.ts`.
- [x] Validate targeted tests pass.

## B. Hooks and client

### B.1 Client API

- [x] Add `startFocusSession` in `src/lib/client-api.ts`.
- [x] Add `stopFocusSession` in `src/lib/client-api.ts`.
- [x] Add `getActiveFocusSession` in `src/lib/client-api.ts`.

### B.2 Hook

- [x] Add `src/hooks/useFocusTimer.ts`.
- [x] Use `Date.now()`-derived elapsed calculation.
- [x] Run `hydrate()` on mount.
- [x] Ensure interval cleanup on unmount and stop.

### B.3 Dashboard plumbing

- [x] Add `focusMinutesLast7d` to `src/types/today-dashboard.ts`.
- [x] Plumb field through `src/hooks/useTodayDashboard.ts`.
- [x] Map field in `src/lib/today-dashboard-mappers.ts`.
- [x] Bump dashboard cache key version if snapshot shape changed.

### B.4 Hook tests

- [x] Add `src/tests/use-focus-timer.test.tsx`.
- [x] Validate hook tests pass.

## C. UI and E2E

### C.1 Stats strip

- [x] Replace focus placeholder branch with real value.
- [x] Render value as `${n}m` including zero.
- [x] Remove dead placeholder code.

### C.2 Active-session UX

- [x] Show active-session indicator on Today shell.
- [x] Add manual stop affordance on Today surface.
- [x] Show non-blocking hydrate toast when orphan active session is found.

### C.3 E2E

- [x] Add `e2e/focus-pipeline.spec.ts`.
- [x] Validate focus happy path passes locally.

## D. Quality gates

- [x] `npm run test:ci` (targeted suites)
- [x] `npm run typecheck`
- [x] `npm run lint` (scoped `src` + `e2e`; root lint includes external worktree noise)
- [x] `npm run build`

## E. Docs and evidence

- [x] Add closeout note in `documentation/status/progress-summary.md`.
- [x] Explicitly record no historical backfill decision.
- [x] Update roadmap phase status in `documentation/plans/cycles/cycles-4-5-6-roadmap.md`.
- [x] Attach evidence for tests/build verification. (Index verification remains in A.1 manual step.)

## Blockers

- None.

## Decision log

- 2026-04-26: Scope frozen to pipeline foundation only (no Pomodoro/notification UI in this phase).
- 2026-04-26: Added `focusMinutesLast7d` to `kpis` and reused existing metrics call in `fetchTodayDashboard` to avoid extra UI round trip.
- 2026-04-26: Root `npm run lint` includes external `.claude/worktrees/**` noise; Phase 4.1 source validation uses scoped lint on `src` and `e2e`.
- 2026-04-26: Resolved index-verification blocker via schema index assertion test (`focus-session-model.test.ts`) because remote cluster DNS access is unavailable in this environment.

## Out-of-scope confirmations

- [x] No Pomodoro UI shipped in this phase.
- [x] No notification scheduling shipped in this phase.
- [x] No focus-XP bonus shipped in this phase.

## Exit criteria

- [x] API contracts match the phase plan.
- [x] Stats strip no longer contains placeholder focus copy.
- [x] Active session rehydrate behavior is validated.
- [x] Full quality gates pass.
- [x] Closeout note is documented.
