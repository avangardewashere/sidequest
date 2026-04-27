# Cycle 3 Kickoff Plan (Hardening And Ship)

This plan starts after Cycle 2 closeout and keeps all implementation solo-first and `/stats`-aligned.

## Entry Criteria

- [x] Cycle 2 analytics scope is delivered on `/stats`.
- [x] Core validation gates are passing for touched analytics files.
- [x] Route naming and docs are aligned to `/stats` (not `/guild-stats`).
- [ ] Team agrees on Cycle 3 first implementation slice (recommended: Phase 3.1).

## Phase 3.1 - Global Error Handling And Toasts

### Goals

- Add a reusable toast primitive for user-facing feedback.
- Standardize high-level fetch failure handling in client API usage.
- Add route-level error boundaries for key app surfaces.
- Add online/offline connectivity signal.

### Actions

1. Introduce toast system (native or lightweight library) and wire existing optimistic rollback feedback to toasts.
2. Add app-level and route-level error boundaries:
   - `src/app/error.tsx`
   - `src/app/quests/error.tsx`
   - `src/app/stats/error.tsx`
3. Add offline banner hook using `window.online` / `window.offline`.
4. Keep error messaging consistent with existing `ActionResult` semantics in `src/lib/client-api.ts`.

### Validation gates

- Typecheck passes.
- Touched-file lint passes.
- Manual smoke: force network/API failures and confirm graceful UX.

## Phase 3.2 - Retention Polish

### Goals

- Add non-invasive retention cues without changing core data semantics.

### Actions

1. Show “streak in danger” badge if no completion by local 6 PM.
2. Add level-up celebration effect with dedupe flag (`lastCelebratedLevel` in local storage).
3. Surface “New daily” cue on first successful daily fetch per day.

### Validation gates

- Feature flags/guards prevent duplicate celebration.
- Cues only appear under correct conditions.

## Phase 3.3 - Tests For New Surfaces

### Goals

- Expand confidence around home + stats + progression edges.

### Actions

1. Add Vitest coverage for `useTodayDashboard` loading/error/data branches.
2. Add idempotency tests for completion endpoint behavior.
3. Add progression edge tests for multi-level crossing.
4. Add Playwright flow: register -> create quest -> complete quest -> `/stats` reflects change.

### Validation gates

- Targeted tests pass locally.
- CI pipeline remains green.

## Phase 3.4 - Performance And DX Cleanup

### Goals

- Improve perceived performance and maintainability before release.

### Actions

1. Add route `loading.tsx` where missing (`/`, `/quests/view`, `/stats`).
2. Memoize hot-path list row components where re-render pressure is high.
3. Run Lighthouse mobile audit and capture before/after notes.
4. Evaluate lazy-loading for heavy chart bundles if needed.

### Validation gates

- Build passes.
- No UX regressions in loading transitions.

## Phase 3.5 - Deploy And Telemetry

### Goals

- Ship production build and add minimal observability.

### Actions

1. Deploy with required env vars (`MONGODB_URI`, `AUTH_SECRET`, `NEXTAUTH_URL`).
2. Wire error tracking (Sentry or equivalent).
3. Add product analytics (Vercel Analytics or equivalent).
4. Update README with current screenshots (`Today`, `Progress Stats`) and deployment badge.
5. Tag release candidate and gather external feedback.

### Validation gates

- Production smoke test on mobile and desktop.
- Error telemetry receives test event.

## Recommended First Slice (start here)

Begin with **Phase 3.1** in this order:

1. `error.tsx` surfaces for app/quests/stats
2. toast primitive + optimistic rollback messages
3. offline banner

This yields immediate resilience gains with minimal architectural risk.
