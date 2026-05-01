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

## 18) Cycle 5 - Phase 5.2 closeout (Historical review trend)

- Added authenticated historical review API:
  - `GET /api/review/historical?weeks=4` composes four UTC 7-day buckets from `CompletionLog`
  - reuses `User.onboardingWeeklyTarget` (defaults to `5`) and `User.onboardingEncouragementStyle` (`gentle` fallback)
  - enforces `weeks=4` for this phase and returns deterministic trend classification (`rising` / `steady` / `declining`)
  - returns ready-to-render `summaryHeadline` / `summaryMessage` from a 3-style x 3-trend tone table
- Added historical review UI:
  - new `src/components/review/historical-review-card.tsx`
  - mounted directly under `WeeklyReviewCard` on `/stats` via `src/app/stats/page.tsx`
  - reuses existing loading/error panel patterns already used by the review surfaces
- Added client contract:
  - `HistoricalReview` and `HistoricalReviewWeek` types in `src/lib/client-api.ts`
  - `fetchHistoricalReview(weeks=4)` action wrapper for `/api/review/historical`
- Added test coverage:
  - `src/tests/api-routes-historical-review.test.ts` (auth, validation, payload composition, trend/tone branching)
  - `src/tests/historical-review-card.test.tsx` (bucket rendering and trend/tone UI variants)
  - `e2e/historical-review.spec.ts` (wired `/stats` happy-path assertions)
- Validation:
  - `npm run test:ci` passed (`18/18 files`, `94/94 tests`; includes pre-existing dashboard `act()` warnings)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed; build manifest includes `/api/review/historical`
  - `npx playwright test e2e/historical-review.spec.ts` remains environment-blocked locally because port `3000` is already in use
- Scope guardrails held:
  - no new persistence / no new `User` fields
  - no per-day drill-in (deferred to a later Cycle 5 phase)
  - no event-logged behavioral analytics (gated 5.4 / 5.5)
  - no sharing/export workflow

## 19) Cycle 5 - Phase 5.3 closeout (Focus-area next-best quest)

- Added authenticated next-best-quest suggestion API:
  - `GET /api/today/suggestion` returns `{ suggestion | null }` for the signed-in user's active quests
  - Deterministic ranking: focus-area category match (from `User.onboardingFocusArea`) -> category rotation against the last 7 days of `CompletionLog` -> priority fallback using existing `priority_due` ordering
  - Reason enum (`focus_area_match` / `category_rotation` / `fallback_priority`) drives tone-aware copy keyed off `User.onboardingEncouragementStyle` (`gentle` / `direct` / `celebration`)
- Added Today UI integration:
  - new `src/components/home/next-best-quest-card.tsx`
  - mounted near the top of `src/components/home/today-focus-shell.tsx` ahead of existing main quest / queue sections
  - reuses existing loading / error panel patterns; no disruption to current Today flow
- Added client contract:
  - `NextBestQuestSuggestion` type and `fetchTodaySuggestion()` action in `src/lib/client-api.ts`
- Added test coverage:
  - `src/tests/api-routes-today-suggestion.test.ts` (auth, null when no active quests, focus-match preference, category rotation, priority fallback, encouragement-style branching)
  - `src/tests/next-best-quest-card.test.tsx` (reason labels + tone badge variants)
  - `e2e/today-next-best-quest.spec.ts` (Today happy path; mocked API responses)
- Validation:
  - `npm run test:ci` passed (20/20 files, 103/103 tests)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed; build manifest now includes `/api/today/suggestion` alongside `/api/review/weekly` and `/api/review/historical`
  - `npx playwright test e2e/today-next-best-quest.spec.ts` remains environment-blocked locally because port `3000` is already in use (same caveat as Phases 5.1 and 5.2)
- Scope guardrails held:
  - no new persistence / no new `User` fields
  - no multi-suggestion feed or carousel
  - no AI/LLM-generated recommendation logic
  - no event-logged behavioral analytics (gated 5.4 per roadmap)
  - no sharing/export workflow

## 20) Cycle 5 - Phase 5.4 closeout (Behavioral event logging foundation)

- Added behavioral event persistence + contract:
  - new `src/models/BehaviorEvent.ts` collection for authenticated user events with `userId`, `name`, `properties`, `createdAt`
  - indexed by `userId` and compound `userId + createdAt desc` for efficient per-user timeline reads
  - new authenticated `POST /api/events` (`src/app/api/events/route.ts`) returning `{ event: { id, name, createdAt } }`
- Added shared event allowlist and payload safeguards:
  - `src/lib/behavior-events.ts` defines canonical event names (`weekly_review_viewed`, `historical_review_viewed`, `suggestion_viewed`, `suggestion_clicked`, `quest_completed`)
  - route validation enforces allowlist and properties constraints (object-only, size cap, no nested arrays beyond depth 1)
  - lightweight in-memory per-user rate-limit now returns `429` on overflow
- Added client emitter + wiring:
  - `recordBehaviorEvent()` in `src/lib/client-api.ts` is best-effort and swallows network failures
  - `src/hooks/useBehaviorEvent.ts` emits one-shot mount events
  - wired existing surfaces:
    - Weekly review card -> `weekly_review_viewed`
    - Historical review card -> `historical_review_viewed`
    - Next-best quest card -> `suggestion_viewed`
    - Today quest completion success path -> `quest_completed`
- Added test coverage:
  - `src/tests/api-routes-events.test.ts` (auth, allowlist, size cap, success shape, rate-limit guard)
  - `src/tests/behavior-event-emitter.test.ts` (client allowlist guard, swallow-on-failure, payload shaping)
  - `e2e/behavior-event-logging.spec.ts` (stats/today event emission happy path with mocked `POST /api/events`)
- Validation:
  - `npm run test:ci` passed (`22/22 files`, `111/111 tests`)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed; build manifest now includes `/api/events`
  - `npx playwright test e2e/behavior-event-logging.spec.ts` remains environment-blocked locally because port `3000` is already in use (same caveat as Phases 5.1, 5.2, and 5.3)
- Scope guardrails held:
  - no analytics dashboard/aggregation UI (deferred to Phase 5.5)
  - no third-party analytics SDK integration
  - no AI/LLM event interpretation
  - no multi-user/org analytics surface
  - no server-driven event triggers

## 21) Cycle 5 - Phase 5.5 closeout (Event analytics surfaces)

- Added authenticated per-user event analytics API:
  - `GET /api/events/analytics?range=7d|30d|90d` (`src/app/api/events/analytics/route.ts`) loads the signed-in user's `BehaviorEvent` documents within a UTC-anchored window via `find().sort({ createdAt: 1 }).lean()`
  - Zod-validates `range`, returns `400` on invalid/missing values, `401` on missing session
  - Composes a deterministic analytics payload through the new pure helper
- Added pure aggregation helper:
  - `src/lib/event-analytics.ts` -> `summarizeEvents()` returns `totalEvents`, zero-filled `byName` keyed off `BEHAVIOR_EVENT_NAMES`, `reviewViews`, `suggestionViews`, `suggestionClicks`, `suggestionClickRatePct` (`Math.round(clicks / views * 100)`, `0/0 -> 0`), `questCompletionsAfterSuggestionView` (count of `quest_completed` strictly after the earliest `suggestion_viewed`), and an ISO `latestEventAt`
- Added stats UI integration:
  - new `src/components/stats/event-analytics-card.tsx` (range badge, total events line, CTR / review views / suggestion views / quests-after-view stat strip, per-name list, deterministic UTC `latestEventAt` footer, `data-testid` hooks for tests)
  - mounted on `/stats` between `HistoricalReviewCard` and the KPI strip via `src/app/stats/page.tsx`
  - re-fetches analytics whenever the page-level `RangeSwitcher` changes (`useEffect` keyed on `range`)
- Extended client contract:
  - `EventAnalytics` / `EventAnalyticsByName` types and `fetchEventAnalytics(range)` in `src/lib/client-api.ts`
- Added test coverage:
  - `src/tests/event-analytics-summarize.test.ts` (8 cases: empty, allowlist filtering, CTR `0/0` and rounding, after-view counting, no-suggestion baseline, max-`createdAt` regardless of order, ISO-string input)
  - `src/tests/api-routes-events-analytics.test.ts` (6 cases: 401, 400 missing range, 400 invalid range, empty window, populated window with derived metrics, ISO `latestEventAt`)
  - `src/tests/event-analytics-card.test.tsx` (populated payload + empty payload renders)
  - `e2e/event-analytics-surface.spec.ts` (`/stats` happy-path with mocked `/api/events/analytics` + supporting dashboards)
- Validation:
  - `npm run test:ci` passed (`25/25 files`, `127/127 tests`)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed; build manifest includes `/api/events/analytics` alongside `/api/events`
  - `npx playwright test e2e/event-analytics-surface.spec.ts` remains environment-blocked locally because port `3000` is already in use (same caveat as Phases 5.1 - 5.4)
- Scope guardrails held:
  - no new persistence (consumes existing `BehaviorEvent` documents only)
  - no new event capture names beyond the 5.4 allowlist
  - no third-party analytics SDK integration
  - no AI/LLM-generated insight narratives
  - no org/team-level analytics
  - no export/share/reporting pipeline

## 22) Cycle 5 - Phase 5.6 closeout (Personalization preferences editor)

- Added a dedicated authenticated personalization update endpoint:
  - `PATCH /api/you/preferences` (`src/app/api/you/preferences/route.ts`) validates payloads and updates only:
    - `onboardingFocusArea`
    - `onboardingWeeklyTarget`
    - `onboardingEncouragementStyle`
  - Explicitly does **not** mutate `onboardingCompletedAt`, keeping first-onboarding completion semantics intact.
  - Returns onboarding payload shape compatible with `GET /api/onboarding` (`{ onboarding: OnboardingState }`).
- Consolidated onboarding validation/payload utilities:
  - new `src/lib/onboarding-state.ts` centralizes:
    - shared Zod constraints for focus area, weekly target, encouragement style
    - onboarding completion schema
    - `toOnboardingPayload()` mapper
  - `src/app/api/onboarding/route.ts` now consumes this shared module to prevent contract drift.
- Added `/you` personalization UI integration:
  - `src/app/you/page.tsx` now includes "Personalization preferences" between "Profile basics" and "Password"
  - loads defaults/current values from `fetchYouPreferences()` (alias of `fetchOnboardingState`)
  - saves through new `updateYouPreferences()` client action
  - reuses existing toast pattern and disables save while unchanged or in-flight.
- Extended client API contract:
  - `src/lib/client-api.ts` adds:
    - `YouPreferencesPayload`
    - `fetchYouPreferences`
    - `updateYouPreferences(payload)`
- Added test coverage:
  - `src/tests/api-routes-you-preferences.test.ts`
  - `src/tests/you-preferences-section.test.tsx`
  - `e2e/you-preferences.spec.ts`
- Validation:
  - `npm run test:ci -- src/tests/api-routes-you-preferences.test.ts src/tests/you-preferences-section.test.tsx` passed (`2/2 files`, `7/7 tests`)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed; route manifest includes `/api/you/preferences`
  - `npx playwright test e2e/you-preferences.spec.ts` remains environment-blocked locally because port `3000` is already in use
- Scope guardrails held:
  - no `User` schema changes
  - no onboarding re-trigger and no `onboardingCompletedAt` mutation from preferences saves
  - no new behavior event names
  - no event analytics surface changes
  - no AI/LLM tone preview or variant experiments

## 23) Cycle 7 sequencing refinement (Phase 7.2 first)

- Confirmed Phase 7.1 (`design tokens`) as complete baseline via tracker.
- Published a dedicated Phase 7.2 implementation plan and tracker:
  - `documentation/plans/phase-7-2-schema-migration-parent-quest-plan.md`
  - `documentation/plans/phase-7-2-schema-migration-parent-quest-tracker.md`
- Refined `cycles-7-8-9-plan.md` sequencing (scope unchanged):
  - 7.2 now starts immediately after 7.1 closeout (no parallel overlap).
  - 7.3 starts only after 7.2 schema + endpoint contracts are stable.
  - Cycle 8 waits for 7.2 deployment/validation gates.

## 24) Cycle 7-9 alignment pass (7.3 kickoff readiness)

- Synced architecture/status framing to match the updated cycle pivot:
  - `documentation/status/current-status-architecture.md` now reflects todo + habit + second-brain direction.
  - 7.1/7.2 marked as complete baseline and 7.3 marked as immediate next phase.
- Added dedicated 7.3 implementation docs:
  - `documentation/plans/phase-7-3-habit-cadence-completion-history-plan.md`
  - `documentation/plans/phase-7-3-habit-cadence-completion-history-tracker.md`
- Locked execution lane boundaries to keep work aligned:
  - backend lane (7.3 migration + behavior split) first
  - 7.4 allowed in parallel only after migration contract freeze
  - 7.5 -> 7.6 UI lane can progress independently
- Added explicit Cycle 8 start gate language to avoid implementation drift before 7.3 readiness approval.

## 25) Cycle 7 closeout update - Phases 7.2 and 7.3 complete

- Phase 7.2 (`parentQuestId` hierarchy) is now fully closed:
  - schema/index + depth/daily-parent guardrails
  - children routes (`GET/POST /api/quests/[id]/children`)
  - selector helpers (`withChildren`, `siblingsOf`) with tests
- Phase 7.3 (cadence + completion history) is now fully closed:
  - `Quest.cadence` and `Quest.lastCompletedDate` landed
  - `CompletionLog.completionDate` landed with migration utility/script and unique index transition support
  - completion behavior split for one-off vs habit semantics in `/api/quests/[id]/complete`
  - new history route `GET /api/quests/[id]/history?days=N`
  - cadence helper library `src/lib/cadence.ts` and supporting tests
- Environment/tooling blockers were resolved during closeout:
  - Next type artifacts regenerated via `npx next typegen`
  - Vitest execution stabilized for CI path by running with controlled worker/memory settings
- Validation evidence:
  - `npm run test:ci` passed (`33/33 files`, `155/155 tests`)
  - `npm run typecheck` passed
  - `npm run lint` passed
  - `npm run build` passed
- Active next step: Phase 7.4 (`tags`, `notes`, `links`) is now the immediate implementation target.

## 26) Cycle 7 - Phase 7.4 closeout (Tags, notes, links schema)

- Added second-brain schema fields on `Quest`:
  - `tags: string[]` with max-8 and per-tag length validation
  - `notes: { id, body, createdAt }[]` with max-50 and body-length guardrails
  - `links: { questId, kind }[]` with max-32 and enum-constrained link kinds
- Added 7.4 endpoints:
  - `PATCH /api/quests/[id]/tags`
  - `POST /api/quests/[id]/notes`
  - `PATCH /api/quests/[id]/notes/[noteId]`
  - `DELETE /api/quests/[id]/notes/[noteId]`
  - `POST /api/quests/[id]/links`
  - `DELETE /api/quests/[id]/links/[linkId]`
- Added `src/lib/quest-tags.ts`:
  - `normalizeTags(input)` for lowercase/trim/dedupe/cap behavior
  - `userTagSuggestions(userId, prefix)` for tag autocomplete support
- Added test coverage:
  - `src/tests/quest-tags.test.ts`
  - `src/tests/api-routes-quest-second-brain.test.ts`
- Validation:
  - `npx next typegen` passed
  - `npm run typecheck` passed
  - `npm run lint` passed
  - `npm run test:ci` passed (`35/35 files`, `163/163 tests`; includes pre-existing `act()` warnings in unrelated dashboard tests)
  - `npm run build` passed; route manifest includes all new 7.4 endpoints
- Scope guardrails held:
  - no reciprocal link writes (deferred to 8.6)
  - no search/linked-from UI surfaces
  - no reflection note subtype changes

## 27) Cycle 7 — Phase 7.5 closeout (Core UI primitives)

- Added presentational primitives under `src/components/ui/`:
  - `Button`, `Badge`, `Card`, `FormField`, `TaskRow`, `ProgressRing`, `Sheet`, `BottomNav`, and a barrel `index.ts`
- `Sheet` supports `placement="drawer"` (bottom on small viewports, end drawer on `md+`), plus forced `bottom` and `end` for harness and future shells.
- `BottomNav` mirrors app tab routes via `TAB_ROUTE_MAP` / `activeTabFromPathname` (Today / Quests / Stats / You); production shell swap remains deferred to Cycle 8.5.
- Dev-only harness: `src/app/_dev/components/page.tsx` behind `src/app/_dev/layout.tsx` (`notFound` in production).
- Tests: `src/tests/ui-primitives.test.tsx` (RTL smoke for primitives + `BottomNav` / `Sheet` behavior).
- Validation:
  - `npm run test:ci` passed
  - `npm run typecheck` passed
  - `npm run lint` passed
  - `npm run build` passed
- Active next step: Phase 7.6 (habit- and capture-specific atoms consuming this layer).
