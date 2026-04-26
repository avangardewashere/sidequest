# Phase 4.5 - Onboarding Flow (Execution Plan)

Cycle 4 / Phase 4.5. Companion tracker: `phase-4-5-onboarding-flow-tracker.md`.

## Goal

Ship a minimal first-run onboarding flow for authenticated solo users that captures lightweight preferences and marks onboarding completion before normal app use.

## Scope

### In scope

- Add onboarding state to the user model.
- Add minimal authenticated API contract to read/update onboarding state.
- Add dedicated onboarding route and first-run gating from `/`.
- Capture baseline onboarding inputs only (focus area + weekly target + encouragement style).
- Add focused tests and one onboarding happy-path e2e.

### Out of scope

- Reminder scheduling and notification delivery (Phase 4.6).
- Advanced account/security controls and recovery.
- Multi-step habit program, coaching, or AI recommendations.

## Architecture decisions

1. Onboarding persistence is stored on `User` to avoid introducing a separate collection in 4.5.
2. `/api/onboarding` is the canonical onboarding contract with `GET` and `PATCH`.
3. Authenticated `/` route performs first-run gating by fetching onboarding status and redirecting to `/onboarding` when incomplete.
4. `/onboarding` remains intentionally lightweight and writes completion in one submit action.

## API/data/component contracts

- `GET /api/onboarding` returns:
  - `{ onboarding: { completed: boolean, completedAt, focusArea, weeklyTarget, encouragementStyle } }`
- `PATCH /api/onboarding` accepts:
  - `{ focusArea, weeklyTarget, encouragementStyle, complete: true }`
- `/onboarding` UI:
  - focus area select
  - weekly target numeric input
  - encouragement style select
  - complete onboarding action

## Testing plan

- Unit/integration:
  - onboarding API auth + payload validation + persistence behavior.
- E2E:
  - authenticated user is routed through onboarding and can complete it successfully.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- First-run authenticated users are routed into `/onboarding` until completion.
- Completed onboarding users land on the regular Today experience.
- Onboarding preferences persist safely and can be read back from API.
- Tests and quality gates pass with closeout docs updated.
