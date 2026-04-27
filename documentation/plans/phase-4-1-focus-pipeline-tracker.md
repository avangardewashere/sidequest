# Phase 4.1 — Real Focus-Time Pipeline (Tracker)

Cycle 4 / Phase 4.1. Pair this with `phase-4-1-focus-pipeline-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

## A. Backend foundation

### A.1 Schema

- [ ] Create `src/models/FocusSession.ts` with all fields defined in the plan.
- [ ] Add `userId + startedAt -1` index for list queries.
- [ ] Add partial unique `(userId, endedAt: null)` index — copy the partialFilterExpression syntax from `Quest.ts`.
- [ ] Verify both indexes locally: `db.focussessions.getIndexes()` shows three (the implicit `_id` plus the two custom).

### A.2 Routes

- [ ] `src/app/api/focus/start/route.ts` — POST, auth, orphan-close existing open, create new. Wrap in `mongoose.startSession().withTransaction(...)` (mirrors `/complete`).
- [ ] `src/app/api/focus/stop/route.ts` — POST, auth, find open, set `endedAt`, compute `durationSec`. 409 when none open.
- [ ] `src/app/api/focus/active/route.ts` — GET, auth, return `{ session: open | null }`.
- [ ] All three routes use `createRequestLogger` + `logRequestException` to match the existing handler logging style.

### A.3 Metrics extension

- [ ] Extend `src/app/api/metrics/summary/route.ts` to include `focusMinutesLast7d` via a new `$group` aggregation, added inside the existing `Promise.all`.
- [ ] Update the response type used by `client-api.ts` so the new field is non-optional.

### A.4 Backend tests

- [ ] `src/tests/focus-pipeline.test.ts` covering all four cases listed in the plan's "Unit + integration" section.
- [ ] `src/tests/api-routes-focus.test.ts` covering the happy path: start → stop → active null → metrics increases.
- [ ] `npm run test:ci -- focus-pipeline api-routes-focus` passes locally.

## B. Hook + client API

### B.1 client-api

- [ ] Add `startFocusSession`, `stopFocusSession`, `getActiveFocusSession` to `src/lib/client-api.ts`.
- [ ] Mirror the `parseJsonSafe` + return-shape conventions used by other client-api fns.

### B.2 useFocusTimer

- [ ] `src/hooks/useFocusTimer.ts` implementing the state machine and signature in the plan.
- [ ] `Date.now()`-based elapsed calc inside the tick — no naive counter increment.
- [ ] `hydrate()` runs once on mount via `getActiveFocusSession`.
- [ ] Cleanup interval on unmount and on `stop()`.

### B.3 useTodayDashboard integration

- [ ] Plumb `focusMinutesLast7d` from the metrics-summary fetch through into the snapshot.
- [ ] Update `src/types/today-dashboard.ts` to include the new field on `TodayDashboardSnapshot`.
- [ ] Map into the stats-strip slot in `today-dashboard-mappers.ts`.
- [ ] Confirm session-storage cache versioning still works (bump cache key version if needed to avoid stale shapes).

### B.4 Hook tests

- [ ] `src/tests/use-focus-timer.test.tsx` covering all three cases listed in the plan.
- [ ] All hook tests pass under `npm run test:ci -- use-focus-timer`.

## C. UI

### C.1 Stats strip

- [ ] Replace the placeholder branch in the stats-strip component with the real value.
- [ ] Render minutes as `${n}m` when zero or positive; never render the placeholder copy again.
- [ ] Remove any dead code that was only there for the placeholder.

### C.2 Active-session UX

- [ ] Surface "active session in progress" indicator on the Today shell when `useFocusTimer.state.status === "running"`.
  - minimum viable: pulse the FAB or show a small chip near the main quest card.
- [ ] Provide a manual stop affordance reachable from the Today surface.
- [ ] If `hydrate()` finds an orphan session on load, show a non-blocking toast: "You have an active focus session — keep going or stop?"

### C.3 E2E

- [ ] `e2e/focus-pipeline.spec.ts` covers login → start → wait → stop → assert stats strip increments.
- [ ] Spec passes locally via `npm run test:e2e` and in CI.

## D. Closeout

### D.1 Quality gates

- [ ] `npm run test:ci` green across the whole suite (not just new files).
- [ ] `npm run typecheck` green.
- [ ] `npm run lint` green.
- [ ] `npm run build` green.

### D.2 Documentation

- [ ] Append a `## 11) Cycle 4 kickoff — Phase 4.1 closeout` section to `documentation/status/progress-summary.md`.
- [ ] In that note, state the "no historical backfill" decision explicitly so future-you remembers.
- [ ] Mark Phase 4.1 done in `documentation/plans/cycles-4-5-6-plan.md` (add a `✓` next to the heading or a status line at the top of the phase).
- [ ] If a screenshot of the working stats strip is easy, drop it into `documentation/screenshots/` and link from the closeout note.

### D.3 PR + merge

- [ ] Branch named `cycle-4/phase-1-focus-pipeline`.
- [ ] PR title: `Cycle 4 / Phase 4.1: real focus-time pipeline`.
- [ ] PR body links both the plan and tracker docs and lists the acceptance criteria (copy from the plan).
- [ ] CI green, self-review pass, squash-merge to `main`.

## Verification evidence (fill in at closeout)

- Test run output:
  - unit / integration: <paste output or link>
  - E2E: <paste output or link>
- Build output: <paste output or link>
- Screenshot of stats strip rendering real minutes: <attach or link>
- MongoDB index verification (`db.focussessions.getIndexes()`):
  ```
  <paste here>
  ```
- Mongo doc shape sanity check (one open + one closed session):
  ```
  <paste here>
  ```

## Stretch (only if Phase 4.1 finishes well before end of day)

- [ ] Spike Phase 4.3 — bottom-tab routing — on a separate branch. Don't merge tonight; just stub the routes (`/quests/view`, `/stats`, `/you`) and the active-tab indicator wiring.
- [ ] Open a draft PR for the spike with notes on what's still needed for 4.3 to ship.
