# Cycles 4-6 Roadmap (Organized Execution)

This roadmap turns the post-ship vision into dependency-aware execution waves.

## Governance

- This file is strategic only: scope, sequencing, and dependencies.
- Per-phase implementation detail must live in the phase `plan + tracker` pair.
- Progress must be logged in `documentation/status/progress-summary.md` at each phase closeout.

## Canonical Document Structure

- `documentation/plans/cycles/cycles-4-5-6-roadmap.md` (this roadmap)
- `documentation/plans/cycle-<n>/phase-<n>-<m>-<slug>-plan.md`
- `documentation/plans/cycle-<n>/phase-<n>-<m>-<slug>-tracker.md`

## Execution Waves

### Wave 1 - Cycle 4 foundation

1. Phase 4.1 - real focus-time pipeline (`in progress`)
2. Phase 4.3 - bottom tab routing
3. Phase 4.4 - You tab + settings baseline

### Wave 2 - Cycle 4 engagement polish

4. Phase 4.2 - Pomodoro mode UI (depends on 4.1)
5. Phase 4.5 - onboarding flow
6. Phase 4.6 - reminders/notifications (depends on 4.4 and PWA foundations)

### Wave 3 - Cycle 5 personalization

7. Phases 5.1 through 5.6 in order, with 5.4 and 5.5 gated on stable event logging.

### Wave 4 - Cycle 6 platform/distribution

8. Phase 6.1 before 6.2 (PWA before offline queue)
9. Phases 6.3 and 6.4 may be planned in parallel but implemented sequentially
10. Phase 6.5 (recap) then 6.6 (public launch/monitoring)

## Dependency Notes

- 4.1 unlocks meaningful timer UX in 4.2 and removes current stats placeholder debt.
- 4.3 and 4.4 establish navigation/profile foundations needed by 4.6.
- 6.1 must precede 6.2 because offline queue behavior assumes service worker and PWA baseline.

## Phase Quality Gate (applies to every phase)

- `npm run test:ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Tracker exit criteria fully checked
- Closeout note appended to `documentation/status/progress-summary.md`

## Immediate Next Phase

- Execute `documentation/plans/cycle-4/phase-4-1-focus-pipeline-plan.md`
- Track execution in `documentation/plans/cycle-4/phase-4-1-focus-pipeline-tracker.md`
