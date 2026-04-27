# Phase 6.2 - Real Offline Mode (Execution Plan)

Cycle 6 / Phase 6.2. Companion tracker: `phase-6-2-offline-mode-tracker.md`.

## Goal

Allow authenticated users to keep working when offline by queueing quest creation and quest completion in IndexedDB and replaying them on reconnect, with visible sync state and a server-wins conflict policy.

## Scope

### In scope

- IndexedDB-backed mutation queue keyed per user.
- Queueing for `create quest` and `complete quest` only — the two interactions surfaced on `/`.
- Replay loop on `online` event and on app focus.
- Sync-state indicator extending the existing offline banner.
- Server-wins conflict policy with non-blocking warning toast on rejected mutations.
- Tests + one offline E2E happy path.

### Out of scope

- Queueing for any other mutation (`PATCH/DELETE /api/quests/:id`, `PATCH /api/you/profile`, focus sessions, etc.).
- Background sync via service worker.
- Local-first conflict resolution beyond "server wins."
- Multi-tab coordination beyond a single `BroadcastChannel` notification.

## Architecture decisions

1. Queue lives in IndexedDB store `sidequest-mutations-v1`, scoped by `userId`.
2. Each queued mutation carries `{ id, userId, kind, payload, attempts, queuedAt, lastError? }`.
3. Replay is single-flight per user: a leadership lock in IDB prevents two tabs from replaying simultaneously.
4. On replay, server response 4xx is final (drop + warn); 5xx + network errors are retryable up to 5 attempts with exponential backoff.
5. The sync indicator reuses the existing offline banner real estate and switches modes (`offline | syncing | synced | attention`).
6. Schema version bump nukes the store and refetches snapshot from the server — no migration logic in this phase.

## API/data/component contracts

- New: `src/lib/offline-queue.ts` exporting `enqueue`, `replayAll`, `peekQueueState`.
- New: `src/hooks/useOfflineQueue.ts` exposing `{ state, queueSize, lastError, replayNow }`.
- Modified: `src/lib/client-api.ts` — `createQuest` and `completeQuestById` route through the queue when `!navigator.onLine`; happy path is unchanged when online.
- Modified: existing offline banner component — extended to render queue size and replay state.

## Testing plan

- Unit/integration:
  - `src/tests/offline-queue.test.ts` — enqueue, replay, drop on 4xx, retry with backoff on 5xx.
  - `src/tests/use-offline-queue.test.tsx` — state transitions, `online` event handling, focus-replay.
- E2E:
  - `e2e/offline-mode.spec.ts` — go offline, complete a quest, come back online, assert the completion appears server-side.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- Queueing works for create + complete only; other mutations are unaffected when offline (they error as before).
- Coming back online drains the queue and updates sync state to `synced`.
- A 4xx response surfaces a non-blocking warning and the entry is dropped.
- IDB store version mismatch nukes + refetches without crashing.
- Quality gates pass and closeout docs are updated.
