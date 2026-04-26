# Phase 4.6 - Reminders And Notifications (Tracker)

Pair with `phase-4-6-reminders-notifications-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[x]` closed

## A. Contract and scope guardrails

- [x] Confirm Phase 4.6 delivery model is local/browser-only reminders.
- [x] Keep server scheduling + push infra out of scope.
- [x] Define reminder contract fields and validation rules.

## B. Backend/API readiness

- [x] Extend `User` model with reminder settings fields.
- [x] Extend authenticated `GET /api/you/profile` payload with reminder block.
- [x] Extend authenticated `PATCH /api/you/profile` to validate + persist reminders.

## C. UI and local scheduling

- [x] Add reminder controls to `/you` settings UI.
- [x] Add local reminder scheduler hook.
- [x] Add notification opt-in handling and toast fallback path.

## D. Validation and tests

- [x] Add focused API test updates for reminder contract.
- [x] Add local reminder hook tests.
- [x] Add reminder settings e2e.
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] scoped lint (`src` + `e2e`)
- [x] `npm run build`

## E. Docs and closeout

- [x] Add Phase 4.6 closeout note to `documentation/status/progress-summary.md`.
- [x] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` phase status.
- [x] Mark tracker as closed with evidence summary.

## Blockers

- None.

## Decision log

- 2026-04-26: Chosen delivery model is in-app/browser-local reminders only for 4.6.
- 2026-04-26: Reminder settings are added to `/api/you/profile` to keep backend surface minimal.

## Out-of-scope confirmations

- [x] No server-side cron/scheduler pipeline.
- [x] No push notification service-worker infrastructure.
- [x] No advanced AI/coaching preference automation.

## Exit criteria

- [x] Reminder settings persist safely on authenticated profile contract.
- [x] `/you` reminder controls are functional with save feedback.
- [x] Local reminder scheduling runs while app is open and dedupes same-day delivery.
- [x] Tests and quality gates pass with closeout docs updated.

## Evidence summary

- Added reminder persistence fields on `User`:
  - `remindersEnabled`
  - `reminderTimeLocal`
  - `reminderDays`
  - `reminderLastFiredOn`
- Extended `GET/PATCH /api/you/profile` with reminder read/write contract + validation.
- Added `/you` reminder settings UI with:
  - local delivery configuration
  - weekday/time controls
  - explicit browser notification permission path
- Added local scheduler hook:
  - `src/hooks/useLocalReminders.ts`
  - same-day dedupe via `reminderLastFiredOn`
  - toast fallback when browser notifications are unavailable
- Added tests:
  - `src/tests/you-settings-routes.test.ts`
  - `src/tests/use-local-reminders.test.ts`
  - `e2e/reminders-notifications.spec.ts`
- Validation:
  - `npm run test:ci` passed (`14/14 files`, `76/76 tests`; includes pre-existing React act warnings in unrelated dashboard tests)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
  - `npx playwright test e2e/reminders-notifications.spec.ts` passed
