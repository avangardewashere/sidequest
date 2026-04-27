# Phase 4.1 — Real Focus-Time Pipeline (Plan)

Cycle 4 / Phase 4.1. Companion tracker: `phase-4-1-focus-pipeline-tracker.md`.

## Goal

Replace the `FOCUS` placeholder in the stats strip with a real, server-tracked focus-time signal. Establish the data + API + hook foundation that Phase 4.2 (Pomodoro) will build on.

## Scope

### In scope

- New `FocusSession` MongoDB collection.
- `POST /api/focus/start`, `POST /api/focus/stop`, `GET /api/focus/active` route handlers.
- `useFocusTimer()` client hook with start/stop/elapsed/active state.
- 7-day focus minutes summed into the `/api/metrics/summary` response and rendered in the stats strip.
- Vitest unit + API tests, one Playwright happy-path spec.

### Out of scope (explicit)

- Pomodoro 25/5 cycle UI — Phase 4.2.
- Browser notifications on cycle end — Phase 4.6.
- Focus-XP bonus on completion — Phase 4.2.
- Per-quest focus-time aggregation — defer until a real consumer needs it.

## Architecture decisions

1. **One open session per user.** Server enforces it via a partial unique index on `(userId, endedAt: null)` and by orphan-closing any open session on `start`. Avoids the "two timers running" edge case structurally.
2. **Authoritative duration on stop.** Client may display a local timer for UX, but `durationSec = floor((endedAt − startedAt) / 1000)` is computed server-side at stop time. Never trust a client-supplied duration.
3. **Stop is idempotent in spirit, conflict-y in practice.** Repeating `stop` on an already-closed session returns 409 (mirrors existing `/complete` semantics) instead of silently duplicating a log entry.
4. **`endedAt: null` is the open marker.** A sparse partial unique index makes "find the open one for this user" a single-document point query.
5. **No coupling to `Quest`.** `questId` is optional. Sessions can exist without a quest (general focus time) and be attached later for per-quest analytics.
6. **No tab-close auto-close.** If the user closes the tab without stopping, the session stays open. We surface it on next load via `GET /api/focus/active` so the user can decide to keep going or stop.

## Data model

New file: `src/models/FocusSession.ts`.

```ts
const focusSessionSchema = new mongoose.Schema(
  {
    userId:      { type: ObjectId, ref: "User",  required: true, index: true },
    questId:     { type: ObjectId, ref: "Quest", default: null },
    startedAt:   { type: Date,     required: true, default: Date.now },
    endedAt:     { type: Date,     default: null },
    durationSec: { type: Number,   default: 0 },
  },
  { timestamps: true },
);

focusSessionSchema.index({ userId: 1, startedAt: -1 });
focusSessionSchema.index(
  { userId: 1, endedAt: 1 },
  { partialFilterExpression: { endedAt: null }, unique: true }, // ≤1 open session per user
);
```

The partial unique index is the structural guarantee for "one open session per user." Without it, races between concurrent `start` calls could create two open sessions.

## API contracts

### `POST /api/focus/start`

- Auth required.
- Body: `{ questId?: string }`.
- Behavior: if an open session exists for the user, close it first with the current timestamp (orphan-close, does not log to a separate audit). Then create a new session in the same Mongo transaction.
- Response 201: `{ session: { _id, startedAt, questId } }`.
- 401 if unauth, 400 if `questId` is malformed.

### `POST /api/focus/stop`

- Auth required.
- Body: `{}`.
- Behavior: find the user's open session, set `endedAt = now`, compute `durationSec`, save.
- Response 200: `{ session: { _id, startedAt, endedAt, durationSec } }`.
- 409 if no open session exists.

### `GET /api/focus/active`

- Auth required.
- Response 200: `{ session: { _id, startedAt, questId } | null }`.

### Extension: `/api/metrics/summary`

- Add `focusMinutesLast7d: number` to the response payload.
- Computed via aggregation: sum of `durationSec` for the user where `endedAt >= now − 7d`, divided by 60, floored.

## Frontend

### Hook — `src/hooks/useFocusTimer.ts`

```ts
type FocusTimerState = {
  status: "idle" | "running" | "stopping";
  startedAt: Date | null;
  elapsedSec: number;
  questId: string | null;
};

useFocusTimer(): {
  state: FocusTimerState;
  start: (questId?: string) => Promise<void>;
  stop: () => Promise<void>;
  hydrate: () => Promise<void>; // calls GET /active on mount
};
```

- `elapsedSec` recomputed each tick from `Date.now() − startedAt.getTime()` so background-tab throttling doesn't drift.
- One `setInterval(1000)` while `status === "running"`; cleared on stop/unmount.
- On mount, call `hydrate()` to surface any leftover open session from a closed tab.

### Stats strip wiring

- Extend `useTodayDashboard` to also surface `focusMinutesLast7d` (the metrics-summary fetch already happens — just plumb the new field through).
- Update `src/types/today-dashboard.ts` so the snapshot type carries the field.
- Update `src/lib/today-dashboard-mappers.ts` to feed the value into the stats-strip section, replacing the placeholder branch.
- Empty-state policy: show `0m` when zero. No placeholder copy ever leaves this phase alive.

### Client API additions

`src/lib/client-api.ts`:

- `startFocusSession(questId?: string): Promise<{ session: ActiveFocusSession }>`
- `stopFocusSession(): Promise<{ session: ClosedFocusSession }>`
- `getActiveFocusSession(): Promise<{ session: ActiveFocusSession | null }>`

## Testing

### Unit + integration (Vitest)

`src/tests/focus-pipeline.test.ts`:

- `start closes prior open session`
- `stop computes durationSec from server time, not client input`
- `stop with no open session returns 409`
- `active returns null when none open`

`src/tests/api-routes-focus.test.ts`:

- happy path: start → stop → active is null → metrics summary includes the minutes.

### Hook (Vitest + jsdom)

`src/tests/use-focus-timer.test.tsx`:

- `elapsed ticks while running`
- `hydrate reflects an existing open session`
- `stop clears state and triggers a snapshot refresh`

### E2E (Playwright)

`e2e/focus-pipeline.spec.ts`:

- login → trigger `start` via UI affordance → wait 3 s → trigger `stop` → assert stats strip reflects ≥ 1 minute (use a deterministic clock if Playwright supports it for this run; otherwise wait 65 s in this single spec).

## Migration considerations

- New collection only; no changes to existing collections.
- No historical backfill is possible — stats will read `0m` for all users until they log time. Document this in the closeout note.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Open sessions accumulate if users abandon tabs | Partial unique index + orphan-close on `start`; `GET /active` surfaces leftovers in the UI |
| Server clock skew vs client timer | Display client elapsed for UX, but trust server timestamps for analytics |
| Partial-unique-index migration conflicts | New collection — no existing data to conflict with |
| `useTodayDashboard` becomes chatty | Use the existing metrics-summary call; do not add a new round trip |
| Race between two concurrent `start` calls | Mongo will reject the second insert via the partial unique; surface as 409 from the route |

## Acceptance criteria

- All four routes pass their contract tests.
- Stats strip renders real focus minutes; the `FOCUS` placeholder is removed from both code and copy.
- Closing and reopening the tab during an active session keeps the session and surfaces it on reload via `hydrate()`.
- `npm run test:ci`, `npm run typecheck`, `npm run lint`, `npm run build` all green.
- One Playwright happy-path spec passes locally and in CI.
- Closeout note added to `documentation/status/progress-summary.md` under a `## 11) Cycle 4 kickoff — Phase 4.1 closeout` section.

## File touch list

### New

- `src/models/FocusSession.ts`
- `src/app/api/focus/start/route.ts`
- `src/app/api/focus/stop/route.ts`
- `src/app/api/focus/active/route.ts`
- `src/hooks/useFocusTimer.ts`
- `src/tests/focus-pipeline.test.ts`
- `src/tests/use-focus-timer.test.tsx`
- `src/tests/api-routes-focus.test.ts`
- `e2e/focus-pipeline.spec.ts`

### Modified

- `src/app/api/metrics/summary/route.ts` — add `focusMinutesLast7d` aggregation.
- `src/lib/client-api.ts` — add focus fns.
- `src/hooks/useTodayDashboard.ts` — consume focus minutes.
- `src/lib/today-dashboard-mappers.ts` — map focus minutes into stats strip.
- `src/types/today-dashboard.ts` — extend snapshot type.
- The component owning the stats strip (likely under `src/components/home/`) — remove placeholder branch.
- `documentation/status/progress-summary.md` — closeout note.

## Suggested order of operations (for tomorrow)

1. **Backend first (≈2 h):** model → start route → stop route → active route → metrics extension. Run a quick curl/Thunder Client check after each.
2. **Tests for backend (≈30 min):** the four contract cases. They're cheap and lock the API in.
3. **Client API + hook (≈1 h):** thin layer; the hook is mostly state machine wiring.
4. **Stats-strip wiring (≈45 min):** types → mapper → component. Visually verify on `localhost:3000`.
5. **Hook + E2E tests (≈45 min):** finish hook tests, write the single Playwright spec.
6. **Closeout (≈30 min):** quality gates, screenshot, progress-summary entry, branch + PR.

Total time-box: ~5.5 h. Leaves room for distractions and a buffer to spike Phase 4.3 (bottom-tab routing) at the end of the day.
