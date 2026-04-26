# Progress Summary - Home Data Wiring And Current Status

This chapter summarizes what was delivered in the latest implementation pass and where the project stands now.

## 0) Today accomplishments (Cycle 3 closeout day)

- Closed Cycle 3 and pushed final closeout artifacts to `main`.
- Shipped resilience + feedback improvements (error boundaries, toasts, offline banner, loading boundaries).
- Completed retention/test/performance hardening and deployment readiness checks.
- Published Cycle 3 summary, phase perf notes, and release handoff documentation.

## 1) Project state snapshot

- The authenticated `/` route now renders a live-data Today/Focus home experience.
- The unauthenticated `/` login/register surface remains unchanged.
- Core quest APIs and progression APIs continue to power the main gameplay loop.
- Progress Stats is now a live analytics surface powered by `/api/metrics/summary`.

## 2) What was delivered in this cycle

### Home data pipeline and mapping

- Added typed home snapshot contracts in `src/types/today-dashboard.ts`.
- Added `fetchTodayDashboard()` in `src/lib/client-api.ts` to aggregate:
  - `GET /api/progression`
  - `GET /api/quests?status=active&sort=newest`
  - `GET /api/dailies`
- Added `useTodayDashboard()` in `src/hooks/useTodayDashboard.ts` for client loading/error/refresh behavior.
- Added mapping utilities in `src/lib/today-dashboard-mappers.ts` for:
  - header date/title data
  - XP/level data
  - stats strip (including explicit placeholder policy)
  - main quest selection
  - task section composition

### Home UI wiring and interactions

- Wired `TodayFocusShell` to consume `useTodayDashboard()` live snapshot data.
- Added header/XP skeleton loading state (`today-focus-loading-skeleton.tsx`).
- Added retry path for initial home data load failure.
- Added optimistic quest completion from home rows with rollback on failure.
- Added quick-add bottom sheet (`today-focus-quick-add-sheet.tsx`) posting to existing quest create API.
- Added row click navigation from home tasks to `/quests/[id]/edit`.
- Added progress bar width transitions in XP and main quest cards.

### Fetch deduplication

- Updated `useDashboardActions` with `prefetchDashboard?: boolean`.
- On authenticated `/`, set `prefetchDashboard: false` so the legacy dashboard fetch is skipped while Today/Focus uses `useTodayDashboard`.

## 3) Validation evidence

- `npm run test:ci` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.

## 4) Known gaps and deferred items

- Manual visual/responsive sign-off checklist has been completed for Cycle 1 closeout:
  - `documentation/plans/today-focus-leftovers-checklist.md` (Section E/F marked complete)
- Stats strip keeps `FOCUS` as a placeholder because no reliable focus-time source is wired yet.
- Bottom tab bar on home is still presentational (no route switching behavior yet).
- Focus-time metric source is still placeholder-oriented in home stats.
- Home bottom tab behavior remains presentational and needs route behavior finalization.

## 5) Recommended next steps

1. Start Cycle 3.1: global error handling and toast infrastructure across home/quests/stats.
2. Add retention polish (streak-in-danger cue + celebration behavior + daily-roll feedback).
3. Expand test coverage around analytics interactions and progression edge cases.
4. Run perf/deployment hardening pass (loading states, Lighthouse, telemetry wiring).

## 6) Cycle 1 closure statement

- Cycle 1 is closed: Phase 1.1–1.3 implementation completed, with 1.4/1.5 baseline behavior present and checklist sign-off captured.
- No blocker remains in `today-focus-leftovers-checklist.md`.
- Project is ready to begin Cycle 2 work.
## 7) Related references

- `documentation/status/current-status-architecture.md`
- `documentation/plans/home-ui-tracker.md`
- `documentation/plans/today-focus-ui-plan.md`
- `documentation/plans/today-focus-leftovers-checklist.md`
- `documentation/ops/dev-notes-one-liners.md`

## 8) Cycle 2 kickoff note (solo taxonomy)

- Analytics route is now standardized as `/stats` (replacing `/guild-stats`).
- UI and docs now use solo-first terms (`Progress Stats`, `Today Quests`, `Today Queue`).
- Multiplayer framing is intentionally out of scope for this product iteration.

## 9) Cycle 2 closure statement

- Cycle 2 is complete: analytics API, range switching, KPI deltas, and three core charts are shipped on `/stats`.
- Stats page now includes themed tooltips, chart table fallbacks, responsive tuning, and empty-state/reset UX polish.
- Project is ready to begin Cycle 3 hardening and ship preparation.

## 10) Cycle 3 kickoff priorities

- Phase 3.1: global error handling + toast primitive + offline messaging baseline.
- Phase 3.2: retention effects aligned to solo flow (streak risk cue + celebration control).
- Phase 3.3+: test/perf/deploy readiness with telemetry and release checklist.

## 11) Cycle 4 kickoff - Phase 4.1 closeout

- Added real focus-session backend pipeline:
  - `src/models/FocusSession.ts`
  - `POST /api/focus/start`
  - `POST /api/focus/stop`
  - `GET /api/focus/active`
- Extended `GET /api/metrics/summary` with `kpis.focusMinutesLast7d`.
- Updated today dashboard fetch/mapping path to surface real focus minutes and removed the focus placeholder branch from stats strip.
- Added `useFocusTimer` plus Today-shell active-session UX (start/stop + hydrate restore cue).
- Added test coverage:
  - `src/tests/focus-pipeline.test.ts`
  - `src/tests/api-routes-focus.test.ts`
  - `src/tests/use-focus-timer.test.tsx`
  - `e2e/focus-pipeline.spec.ts`
- Validation:
  - `npm run typecheck` passed
  - targeted `npm run test:ci -- api-routes focus-pipeline api-routes-focus use-focus-timer client-api-today-dashboard today-dashboard-mappers` passed
  - scoped lint `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
- No historical backfill is applied for focus minutes: existing users will display `0m` until they accumulate real focus sessions.

## 12) Cycle 4 - Phase 4.2 closeout (Pomodoro mode)

- Added Pomodoro mode orchestration on Today/main quest with configurable focus/break minutes (default 25/5).
- Added `usePomodoroCycle` hook (`src/hooks/usePomodoroCycle.ts`) to manage focus->break transitions and manual stop behavior.
- Integrated Pomodoro controls into `src/components/home/today-focus-shell.tsx` while reusing the existing Phase 4.1 focus-session APIs.
- Added cycle-end feedback:
  - in-app toasts
  - browser notifications only when permission is already granted (explicit opt-in button, no prompt spam).
- Added tests and happy-path e2e:
  - `src/tests/use-pomodoro-cycle.test.tsx`
  - `e2e/pomodoro-mode.spec.ts`
- Validation:
  - `npm run typecheck` passed
  - targeted `npm run test:ci -- use-pomodoro-cycle use-focus-timer focus-pipeline api-routes-focus client-api-today-dashboard today-dashboard-mappers` passed
  - scoped lint `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
  - `npx playwright test e2e/pomodoro-mode.spec.ts --config=playwright.phase4.reuse3001.config.ts` passed
- Focus-XP bonus persistence remains out of scope for 4.2 and is intentionally deferred.

## 13) Cycle 4 - Phase 4.3 closeout (Bottom tab routing)

- Replaced presentational tab behavior with route-driven navigation using a canonical tab-route map:
  - `today -> /`
  - `quests -> /quests/view`
  - `stats -> /stats`
  - `you -> /you`
- Added shared tab routing helpers in `src/lib/tab-routes.ts` and switched active-tab state to pathname-derived behavior.
- Updated bottom tab component to use `next/link` navigation with `aria-current` for active route semantics.
- Added minimal `/you` route shell (`src/app/you/page.tsx`) and ensured tab bar renders on all core tab routes:
  - `/`
  - `/quests/view`
  - `/stats`
  - `/you`
- Added test coverage:
  - `src/tests/tab-routes.test.ts`
  - `e2e/bottom-tab-routing.spec.ts`
- Validation:
  - `npm run typecheck` passed
  - `npm run test:ci -- tab-routes` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
  - `npx playwright test e2e/bottom-tab-routing.spec.ts --config=playwright.phase4.reuse3001.config.ts` passed
- Scope guardrails held:
  - no Phase 4.4 profile/settings internals were implemented
  - no onboarding/reminder behavior was introduced

## 14) Cycle 4 - Phase 4.4 closeout (You tab + settings baseline)

- Upgraded `/you` from a placeholder shell into a baseline settings experience with three scoped sections:
  - profile summary card (display name, email, level/XP, streaks)
  - profile basics editor (display-name update + save feedback)
  - password flow scaffold (current/new/confirm validation + submit)
- Added minimal authenticated settings APIs:
  - `GET /api/you/profile` (baseline profile payload)
  - `PATCH /api/you/profile` (display-name update)
  - `PATCH /api/you/password` (current-password verification + password-hash update)
- Added focused test coverage:
  - `src/tests/you-settings-routes.test.ts`
  - `e2e/you-settings.spec.ts`
- Validation:
  - `npm run test:ci` passed
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
  - `npx playwright test e2e/you-settings.spec.ts --config=playwright.phase44.reuse3001.config.ts` passed
- Scope guardrails held:
  - no Phase 4.5 onboarding logic was introduced
  - no Phase 4.6 reminder/scheduling work was added
  - no advanced account-security surfaces (device/session management) were added

## 15) Cycle 4 - Phase 4.5 closeout (Onboarding flow)

- Added first-run onboarding persistence on `User` with baseline fields:
  - `onboardingCompletedAt`
  - `onboardingFocusArea`
  - `onboardingWeeklyTarget`
  - `onboardingEncouragementStyle`
- Added authenticated onboarding API contract:
  - `GET /api/onboarding` for onboarding state read
  - `PATCH /api/onboarding` for baseline setup completion write
- Added onboarding UI flow:
  - new `/onboarding` route with baseline setup form (focus area, weekly target, encouragement style)
  - authenticated `/` gating that redirects users with incomplete onboarding to `/onboarding`
  - completed onboarding users continue to the normal Today experience
- Added test coverage:
  - `src/tests/onboarding-routes.test.ts`
  - `e2e/onboarding-flow.spec.ts`
- Validation:
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
  - `npx playwright test e2e/onboarding-flow.spec.ts --config=playwright.phase45.reuse3001.config.ts` passed
  - `npm run test:ci` completed with all Vitest suites passing (`13/13 files`, `72/72 tests`), followed by a transient shell-wrapper temp-file lock error after test completion
- Scope guardrails held:
  - no reminder scheduling implementation (Phase 4.6)
  - no advanced security/settings expansion

## 16) Cycle 4 - Phase 4.6 closeout (Reminders/notifications)

- Added baseline reminder persistence on `User`:
  - `remindersEnabled`
  - `reminderTimeLocal`
  - `reminderDays`
  - `reminderLastFiredOn`
- Extended authenticated settings API contract on `/api/you/profile`:
  - `GET` now returns `profile.reminders`
  - `PATCH` now validates and saves reminder settings payload fields
- Added reminder settings UI in `/you`:
  - local reminders enable toggle
  - reminder time selector
  - weekday selection
  - explicit browser-notification permission action
- Added local scheduling behavior:
  - new `useLocalReminders` hook for in-app/browser-local delivery while app is open
  - same-day dedupe via `reminderLastFiredOn`
  - fallback to in-app toast when notification permission is unavailable
- Added test coverage:
  - `src/tests/you-settings-routes.test.ts`
  - `src/tests/use-local-reminders.test.ts`
  - `e2e/reminders-notifications.spec.ts`
- Validation:
  - `npm run test:ci` passed (`14/14 files`, `76/76 tests`; includes pre-existing act warnings from unrelated dashboard tests)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed
  - `npx playwright test e2e/reminders-notifications.spec.ts` passed
- Scope guardrails held:
  - no server-side scheduler/cron implementation
  - no service-worker push pipeline
  - no advanced AI/coaching notification automation

## 17) Cycle 5 - Phase 5.1 closeout (Personalized weekly review)

- Added authenticated weekly review API:
  - `GET /api/review/weekly` composes the last 7 days of completions for the signed-in user
  - reuses `User.onboardingWeeklyTarget` (defaults to 5 when unset) and `User.onboardingEncouragementStyle` (defaults to `gentle`)
  - returns ready-to-render `summaryHeadline` and `summaryMessage` with tone branching across `gentle` / `direct` / `celebration`
- Added weekly review UI:
  - new `src/components/review/weekly-review-card.tsx`
  - mounted at the top of `/stats` (`src/app/stats/page.tsx`) ahead of existing KPI/chart sections
  - reuses existing loading/error patterns (`var(--color-warning)` panel) consistent with the rest of `/stats`
- Added client contract:
  - `WeeklyReview` type and `fetchWeeklyReview()` in `src/lib/client-api.ts`
- Added test coverage:
  - `src/tests/api-routes-review.test.ts` (auth + payload composition + encouragement-style branching)
  - `src/tests/weekly-review-card.test.tsx` (tone variant rendering)
  - `e2e/weekly-review.spec.ts` (authenticated `/stats` happy path; wired but blocked locally because port `3000` was already in use)
- Validation:
  - `npm run test:ci -- src/tests/api-routes-review.test.ts src/tests/weekly-review-card.test.tsx` passed (3/3)
  - `npm run typecheck` passed
  - `npx eslint src e2e` passed
  - `npm run build` passed; build manifest now lists `/api/review/weekly`
- Scope guardrails held:
  - no new persistence / no new User fields
  - no multi-week or historical review comparison (deferred to Phase 5.2)
  - no event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap)
  - no sharing/export of the weekly review (Cycle 6 distribution)
