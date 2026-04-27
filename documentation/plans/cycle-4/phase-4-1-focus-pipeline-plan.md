# Phase 4.1 - Real Focus-Time Pipeline (Execution Plan)

Cycle 4 / Phase 4.1. Companion tracker: `phase-4-1-focus-pipeline-tracker.md`.

## Goal

Replace the `FOCUS` placeholder in the stats strip with a real server-tracked focus-time signal and establish data/API/hook foundations for Phase 4.2.

## Scope

### In scope

- New `FocusSession` collection and model.
- New routes:
  - `POST /api/focus/start`
  - `POST /api/focus/stop`
  - `GET /api/focus/active`
- New `useFocusTimer()` hook.
- Add `focusMinutesLast7d` to `/api/metrics/summary` and wire into stats strip.
- Unit/API/hook tests plus one Playwright happy path.

### Out of scope

- Pomodoro cycle UI and notifications.
- Focus-XP bonus.
- Per-quest focus analytics beyond optional `questId` association.

## Architecture Decisions

1. One open session per user enforced via partial unique index and start-time orphan-close.
2. Server is source of truth for `durationSec` at stop time.
3. Stop route returns 409 when no open session exists.
4. `endedAt: null` represents open sessions.
5. `questId` remains optional.
6. No auto-close on tab close; open sessions surface through `/api/focus/active`.

## Data Model

### New file

- `src/models/FocusSession.ts`

### Required fields

- `userId`, `questId?`, `startedAt`, `endedAt?`, `durationSec`

### Required indexes

- `{ userId: 1, startedAt: -1 }`
- `{ userId: 1, endedAt: 1 }` with partial unique filter for open-session guard

## API Contracts

### `POST /api/focus/start`

- Auth required.
- Input: `{ questId?: string }`
- Behavior: close existing open session first, then create a new open session.
- Response: 201 with created active session.

### `POST /api/focus/stop`

- Auth required.
- Behavior: close user open session, compute duration server-side.
- Response: 200 with closed session.
- Error: 409 when no open session exists.

### `GET /api/focus/active`

- Auth required.
- Response: `{ session: activeSession | null }`.

### `/api/metrics/summary` extension

- Add `focusMinutesLast7d` computed from closed sessions ending within the last 7 days.

## Frontend and Client Wiring

- Add client API helpers in `src/lib/client-api.ts`:
  - `startFocusSession`
  - `stopFocusSession`
  - `getActiveFocusSession`
- Add `src/hooks/useFocusTimer.ts`:
  - local state machine (`idle` / `running` / `stopping`)
  - `hydrate()` on mount
  - elapsed derived from `Date.now() - startedAt`
- Wire `focusMinutesLast7d` through:
  - `src/types/today-dashboard.ts`
  - `src/hooks/useTodayDashboard.ts`
  - `src/lib/today-dashboard-mappers.ts`
  - home stats-strip owner component

## Testing Plan

### Unit + integration

- `src/tests/focus-pipeline.test.ts`
- `src/tests/api-routes-focus.test.ts`

### Hook tests

- `src/tests/use-focus-timer.test.tsx`

### E2E

- `e2e/focus-pipeline.spec.ts`

## Acceptance Criteria

- Focus routes and metrics extension pass contract tests.
- Stats strip shows real focus minutes and no placeholder copy remains.
- Active focus session survives tab close/reload and is surfaced by `hydrate()`.
- `test:ci`, `typecheck`, `lint`, and `build` all pass.
- Closeout note appended to `documentation/status/progress-summary.md`.
