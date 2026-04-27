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

1. Phase 4.1 - real focus-time pipeline (`closed`)
2. Phase 4.3 - bottom tab routing (`closed`)
3. Phase 4.4 - You tab + settings baseline (`closed`)

### Wave 2 - Cycle 4 engagement polish

4. Phase 4.2 - Pomodoro mode UI (depends on 4.1) (`closed`)
5. Phase 4.5 - onboarding flow (`closed`)
6. Phase 4.6 - reminders/notifications (depends on 4.4 and PWA foundations) (`closed`)

### Wave 3 - Cycle 5 personalization

7. Phase 5.1 - personalized weekly review (closed)
8. Phase 5.2 - historical review trend (closed)
9. Phase 5.3 - focus-area next-best quest (closed)
10. Phase 5.4 - behavioral event logging foundation (closed)
11. Phase 5.5 - event analytics surfaces (closed)
12. Phase 5.6 in order, capstone Cycle 5 personalization item.

### Wave 4 - Cycle 6 platform/distribution

13. Phase 6.1 before 6.2 (PWA before offline queue)
14. Phases 6.3 and 6.4 may be planned in parallel but implemented sequentially
15. Phase 6.5 (recap) then 6.6 (public launch/monitoring)

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

- Execute documentation/plans/cycle-5/phase-5-6-personalization-preferences-plan.md (final Cycle 5 item).
