# Phase 4.2 - Pomodoro Mode (Execution Plan)

Cycle 4 / Phase 4.2. Companion tracker: `phase-4-2-pomodoro-mode-tracker.md`.

## Goal

Add a practical Pomodoro mode on Today/main quest that uses the existing focus-session pipeline, provides cycle-end cues, and stays compatible with Phase 4.1 behavior.

## Scope

### In scope

- Pomodoro control surface (drawer/panel) on Today shell.
- Default 25/5 cycle with configurable focus and break minutes.
- Hook integration with existing focus-session APIs and active quest attachment.
- Cycle-end feedback:
  - in-app toast
  - Notification API when permission is already granted
- Tests covering pomodoro flow/hook behavior and a focused e2e happy path.

### Out of scope

- Notification scheduling/reminders (Phase 4.6).
- Background service-worker timers.
- Focus-XP bonus persistence (deferred to later phase decision).

## Architecture decisions

1. Pomodoro state is client-controlled in Today surface; persisted backend source of truth remains focus sessions.
2. Focus timer starts a focus session with optional `questId`; focus session stops when focus interval ends or user manually stops.
3. Break interval is client-only and not persisted as focus session time.
4. Notification API is permission-gated and non-blocking; no permission prompt spam.
5. Existing manual focus controls remain valid and must not regress.

## Contracts and affected areas

### UI contract

- Main quest “Start focus” opens/uses pomodoro controls.
- User can configure:
  - focus minutes (default 25)
  - break minutes (default 5)
- User can stop at any time from Today shell.

### Hook contract

- Existing `useFocusTimer` remains the focus-session lifecycle primitive.
- Pomodoro countdown orchestrates:
  - focus interval -> stop session -> break interval
  - cycle-end toasts/notifications

## Testing plan

- Unit/hook:
  - pomodoro countdown transitions
  - focus start/stop orchestration
  - cycle-end toast trigger behavior
- E2E:
  - Today -> start pomodoro -> stop -> focus UI/status updates and no crash

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- Pomodoro control UI is available on Today/main quest.
- Focus sessions are started/stopped through existing backend pipeline.
- Cycle-end feedback appears (toast; notification if permitted).
- Existing focus pipeline behavior remains stable.
- Closeout note added to `documentation/status/progress-summary.md`.
