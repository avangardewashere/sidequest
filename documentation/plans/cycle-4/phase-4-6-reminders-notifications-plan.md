# Phase 4.6 - Reminders And Notifications (Execution Plan)

Cycle 4 / Phase 4.6. Companion tracker: `phase-4-6-reminders-notifications-tracker.md`.

## Goal

Ship baseline reminders for authenticated solo users using in-app/browser-local delivery while avoiding server-side scheduling infrastructure.

## Scope

### In scope

- Add reminder preference persistence on `User`.
- Extend authenticated `/api/you/profile` read/update contract for reminder settings.
- Add reminder settings controls in `/you`.
- Add local reminder scheduling in the client when the app is open.
- Add focused tests and one reminder settings e2e.

### Out of scope

- Server-side reminder scheduler jobs.
- Push-notification or service-worker delivery pipeline.
- Advanced preference automation or AI-generated reminder plans.

## Architecture decisions

1. Phase 4.6 reminder delivery is local-only while the app is active.
2. Reminder settings reuse `/api/you/profile` instead of creating a new endpoint family.
3. Reminder dedupe is date-based (`YYYY-MM-DD`) through `reminderLastFiredOn`.
4. Browser notifications remain explicit opt-in; toast fallback is used when permission is unavailable.

## API/data/component contracts

- `GET /api/you/profile` returns:
  - `profile.reminders = { enabled, timeLocal, days, lastFiredOn }`
- `PATCH /api/you/profile` accepts reminder fields:
  - `remindersEnabled`
  - `reminderTimeLocal` (`HH:mm` or `null`)
  - `reminderDays` (`0..6`, at least one)
  - `reminderLastFiredOn` (`YYYY-MM-DD` or `null`)
- `/you` adds reminder settings UI:
  - enable toggle
  - reminder time input
  - weekday selector
  - notification-permission button
  - save action

## Testing plan

- Unit/integration:
  - profile-route reminder validation + persistence checks.
  - local reminder hook scheduling and same-day dedupe checks.
- E2E:
  - authenticated `/you` reminder settings save happy path.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- Reminder settings are persisted and returned from `/api/you/profile`.
- `/you` reminder controls can update settings with user feedback.
- Local reminders can schedule and trigger without server jobs.
- Notification flow is explicit opt-in and safe with fallback behavior.
- Quality gates pass and closeout docs are updated.
