# Phase 4.4 - You Tab + Settings Baseline (Execution Plan)

Cycle 4 / Phase 4.4. Companion tracker: `phase-4-4-you-tab-settings-tracker.md`.

## Goal

Ship a usable `/you` baseline with essential settings entry points: profile summary, editable display name, and password change scaffold with safe validation UX.

## Scope

### In scope

- Add minimal authenticated settings endpoints for profile read/update and password change.
- Upgrade `/you` from placeholder to functional baseline settings page.
- Keep route-driven tab behavior from Phase 4.3 unchanged.
- Add focused automated coverage and one `/you` e2e happy path.

### Out of scope

- Session device management and advanced account security controls.
- Full onboarding/profile completion workflows (Phase 4.5).
- Reminder scheduling and notification strategy expansion (Phase 4.6).

## Architecture decisions

1. Settings backend remains minimal with two focused endpoints: profile and password.
2. Display name edits are server-validated and persisted directly to `User`.
3. Password flow is implemented as baseline scaffold with strict auth checks and current-password verification.
4. `/you` stays self-contained and does not alter core dashboard/focus route contracts.

## API/data/component contracts

- `GET /api/you/profile` returns `{ profile: { email, displayName, level, totalXp, currentStreak, longestStreak } }`.
- `PATCH /api/you/profile` accepts `{ displayName }` and returns updated profile payload.
- `PATCH /api/you/password` accepts `{ currentPassword, newPassword, confirmPassword }`; returns success or safe error.
- `/you` page renders:
  - Profile summary card.
  - Profile basics form (display name + save).
  - Password scaffold form (current/new/confirm + validation guardrails).

## Testing plan

- Unit/integration:
  - API route auth/validation/positive-path tests for `/api/you/profile` and `/api/you/password`.
- E2E:
  - Authenticated `/you` interaction happy path for profile load and profile save.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- `/you` route provides baseline settings UX without breaking bottom-tab routing.
- Profile summary and display-name edit are functional for authenticated users.
- Password scaffold validates and calls authenticated backend endpoint safely.
- Quality gates pass and Phase 4.4 closeout docs are updated.
