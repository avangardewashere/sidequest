# Phase 5.4 - Behavioral Event Logging Foundation (Tracker)

Pair with `phase-5-4-behavioral-event-logging-plan.md`.

Status legend: `[ ]` pending - `[~]` in progress - `[x]` done - `[!]` blocked

Phase status: `[~]` in progress

## A. Contract and scope guardrails

- [ ] Confirm Phase 5.4 stays within behavioral event logging foundation scope.
- [ ] Confirm the only new persistence in 5.4 is the `BehaviorEvent` collection.
- [ ] Confirm event `name` enum is an explicit allowlist on both client and server.
- [ ] Confirm no analytics dashboards or aggregation surfaces are introduced in 5.4.
- [ ] Confirm no third-party analytics SDK or AI/LLM interpretation is introduced.

## B. Backend / API and persistence

- [ ] Add `BehaviorEvent` Mongoose model with `userId`, `name`, `properties`, `createdAt`.
- [ ] Add indexes: `userId`, compound `userId + createdAt desc`.
- [ ] Add authenticated `POST /api/events` route handler.
- [ ] Validate request `name` against the allowlist enum (400 on miss).
- [ ] Validate `properties` shape: object only, size cap, no nested arrays beyond depth 1 (400 on miss).
- [ ] Add lightweight per-user in-memory rate-limit guard returning 429 on overflow.
- [ ] Return `{ event: { id, name, createdAt } }` on success.

## C. Client emitter and existing-surface wiring

- [ ] Add `BEHAVIOR_EVENT_NAMES` constant + `BehaviorEventName` type in `src/lib/client-api.ts`.
- [ ] Add `recordBehaviorEvent(name, properties?)` best-effort helper in `src/lib/client-api.ts`.
- [ ] (Optional) Add `useBehaviorEvent` hook in `src/hooks/useBehaviorEvent.ts` for one-shot mount events.
- [ ] Wire `weekly_review_viewed` from `src/components/review/weekly-review-card.tsx`.
- [ ] Wire `historical_review_viewed` from `src/components/review/historical-review-card.tsx`.
- [ ] Wire `suggestion_viewed` from `src/components/home/next-best-quest-card.tsx`.
- [ ] Wire `quest_completed` from the existing success branch in `src/components/home/today-focus-shell.tsx`.
- [ ] Defer `suggestion_clicked` if no click action is exposed in 5.4.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-events.test.ts` covering auth, allowlist, size cap, success shape, rate-limit.
- [ ] Add `src/tests/behavior-event-emitter.test.ts` covering client allowlist guard, swallow-on-failure, payload shaping.
- [ ] Add `e2e/behavior-event-logging.spec.ts` covering `/stats` and Today mount-emit assertions and a quest-completion event.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 5.4 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.4 status.
- [ ] Record evidence summary in this tracker.

## Blockers

- (None yet.) Capture any environment caveats (e.g. port `3000` in use during Playwright) here when they occur, mirroring 5.1 / 5.2 / 5.3.

## Decision log

- 2026-04-26: Phase 5.4 theme locked to behavioral event logging foundation per the cycle 4-6 roadmap, which gates Phases 5.4 and 5.5 on stable event logging.
- 2026-04-26: First new collection in Cycle 5 (`BehaviorEvent`); event names governed by an explicit allowlist enum.
- 2026-04-26: 5.4 ships only the foundation (model + endpoint + emitter + wiring); analytics surfaces are deferred to Phase 5.5.
- 2026-04-26: Rate-limiting in 5.4 is a lightweight in-memory per-user guard; durable distributed rate-limiting is deferred.
- 2026-04-26: Client emitter is best-effort; emitter network failures must never break the host surface.

## Out-of-scope confirmations

- [ ] No analytics dashboards or aggregation surfaces (Phase 5.5).
- [ ] No third-party analytics SDKs.
- [ ] No AI/LLM event interpretation or scoring.
- [ ] No multi-user / org-level analytics.
- [ ] No server-driven event triggers (only client-emitted events).
- [ ] No sharing / export workflow.

## Exit criteria

- [ ] `BehaviorEvent` collection persists allowlisted events for authenticated users only.
- [ ] `POST /api/events` enforces auth, allowlist, size cap, and per-user rate-limit, returning the documented payload.
- [ ] Existing review and suggestion surfaces emit mount events without breaking the host surface on network failure.
- [ ] Tests and quality gates pass.
- [ ] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- (Filled in at closeout.)
