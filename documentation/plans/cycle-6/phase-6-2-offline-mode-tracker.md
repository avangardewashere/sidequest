# Phase 6.2 - Real Offline Mode (Tracker)

Pair with `phase-6-2-offline-mode-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[ ]` pending

## A. Contract and scope guardrails

- [ ] Confirm queueing is limited to `create quest` and `complete quest`.
- [ ] Confirm conflict policy is server-wins.
- [ ] Confirm IDB schema is versioned (`sidequest-mutations-v1`).
- [ ] Confirm SW push/background-sync is deferred.

## B. Backend

- [ ] (No server changes expected. If a 5xx-only retry-friendly idempotency token is needed for `complete`, document it here and add a tiny extension to the existing route.)

## C. Client implementation

- [ ] Add `src/lib/offline-queue.ts` with `enqueue`, `replayAll`, `peekQueueState`.
- [ ] Add `src/hooks/useOfflineQueue.ts`.
- [ ] Wire `createQuest` + `completeQuestById` in `client-api.ts` through the queue when offline.
- [ ] Extend offline banner with queue size + replay state.
- [ ] Add leadership lock + `BroadcastChannel` coordination for multi-tab.

## D. Validation and tests

- [ ] Add `src/tests/offline-queue.test.ts`.
- [ ] Add `src/tests/use-offline-queue.test.tsx`.
- [ ] Add `e2e/offline-mode.spec.ts`.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 6.2 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 6.2 status.
- [ ] Record evidence summary below.

## Blockers

- None yet.

## Decision log

- YYYY-MM-DD: Confirm IDB store name + version policy.
- YYYY-MM-DD: Confirm replay leadership mechanism.

## Out-of-scope confirmations

- [ ] No queueing of other mutations.
- [ ] No SW background sync.
- [ ] No local-first conflict resolution.

## Exit criteria

- [ ] Offline create/complete queue + replay works end to end.
- [ ] Sync indicator reflects accurate state across tabs.
- [ ] Tests and quality gates pass.
- [ ] Closeout docs updated.

## Evidence summary

- (Filled in at closeout.)
