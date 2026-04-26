# Phase 5.4 - Behavioral Event Logging Foundation (Tracker)

Pair with `phase-5-4-behavioral-event-logging-plan.md`.

Status legend: `[ ]` pending - `[~]` in progress - `[x]` done - `[!]` blocked

Phase status: `[x]` done

## A. Contract and scope guardrails

- [x] Confirm Phase 5.4 stays within behavioral event logging foundation scope.
- [x] Confirm the only new persistence in 5.4 is the `BehaviorEvent` collection.
- [x] Confirm event `name` enum is an explicit allowlist on both client and server.
- [x] Confirm no analytics dashboards or aggregation surfaces are introduced in 5.4.
- [x] Confirm no third-party analytics SDK or AI/LLM interpretation is introduced.

## B. Backend / API and persistence

- [x] Add `BehaviorEvent` Mongoose model with `userId`, `name`, `properties`, `createdAt`.
- [x] Add indexes: `userId`, compound `userId + createdAt desc`.
- [x] Add authenticated `POST /api/events` route handler.
- [x] Validate request `name` against the allowlist enum (400 on miss).
- [x] Validate `properties` shape: object only, size cap, no nested arrays beyond depth 1 (400 on miss).
- [x] Add lightweight per-user in-memory rate-limit guard returning 429 on overflow.
- [x] Return `{ event: { id, name, createdAt } }` on success.

## C. Client emitter and existing-surface wiring

- [x] Add `BEHAVIOR_EVENT_NAMES` constant + `BehaviorEventName` type in `src/lib/client-api.ts`.
- [x] Add `recordBehaviorEvent(name, properties?)` best-effort helper in `src/lib/client-api.ts`.
- [x] (Optional) Add `useBehaviorEvent` hook in `src/hooks/useBehaviorEvent.ts` for one-shot mount events.
- [x] Wire `weekly_review_viewed` from `src/components/review/weekly-review-card.tsx`.
- [x] Wire `historical_review_viewed` from `src/components/review/historical-review-card.tsx`.
- [x] Wire `suggestion_viewed` from `src/components/home/next-best-quest-card.tsx`.
- [x] Wire `quest_completed` from the existing success branch in `src/components/home/today-focus-shell.tsx`.
- [x] Defer `suggestion_clicked` if no click action is exposed in 5.4.

## D. Validation and tests

- [x] Add `src/tests/api-routes-events.test.ts` covering auth, allowlist, size cap, success shape, rate-limit.
- [x] Add `src/tests/behavior-event-emitter.test.ts` covering client allowlist guard, swallow-on-failure, payload shaping.
- [x] Add `e2e/behavior-event-logging.spec.ts` covering `/stats` and Today mount-emit assertions and a quest-completion event.
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] scoped lint (`src` + `e2e`)
- [x] `npm run build`

## E. Docs and closeout

- [x] Add Phase 5.4 closeout note to `documentation/status/progress-summary.md`.
- [x] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.4 status.
- [x] Record evidence summary in this tracker.

## Blockers

- `npx playwright test e2e/behavior-event-logging.spec.ts` is blocked in current environment because port `3000` is already in use by another process and the base `playwright.config.ts` has `reuseExistingServer: false`. Same caveat as Phases 5.1, 5.2, and 5.3.

## Decision log

- 2026-04-26: Phase 5.4 theme locked to behavioral event logging foundation per the cycle 4-6 roadmap, which gates Phases 5.4 and 5.5 on stable event logging.
- 2026-04-26: First new collection in Cycle 5 (`BehaviorEvent`); event names governed by an explicit allowlist enum.
- 2026-04-26: 5.4 ships only the foundation (model + endpoint + emitter + wiring); analytics surfaces are deferred to Phase 5.5.
- 2026-04-26: Rate-limiting in 5.4 is a lightweight in-memory per-user guard; durable distributed rate-limiting is deferred.
- 2026-04-26: Client emitter is best-effort; emitter network failures must never break the host surface.
- 2026-04-27: `suggestion_clicked` remains deferred because no explicit click CTA is exposed on `NextBestQuestCard` in this phase.
- 2026-04-27: Playwright spec is wired and run command is added to evidence, but local execution remains environment-blocked by port `3000` in use.

## Out-of-scope confirmations

- [x] No analytics dashboards or aggregation surfaces (Phase 5.5).
- [x] No third-party analytics SDKs.
- [x] No AI/LLM event interpretation or scoring.
- [x] No multi-user / org-level analytics.
- [x] No server-driven event triggers (only client-emitted events).
- [x] No sharing / export workflow.

## Exit criteria

- [x] `BehaviorEvent` collection persists allowlisted events for authenticated users only.
- [x] `POST /api/events` enforces auth, allowlist, size cap, and per-user rate-limit, returning the documented payload.
- [x] Existing review and suggestion surfaces emit mount events without breaking the host surface on network failure.
- [x] Tests and quality gates pass.
- [x] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- Backend/API + persistence:
  - Added `src/models/BehaviorEvent.ts` (`userId`, `name`, `properties`, `createdAt`) with `userId` and `userId + createdAt desc` indexes.
  - Added `src/lib/behavior-events.ts` as the canonical allowlist + property sanitization utility shared by server and client.
  - Added `src/app/api/events/route.ts` with auth gate, allowlist validation, properties validation (size cap + array-depth rule), and in-memory per-user rate-limit returning `429`.
- Client emitter + wiring:
  - Added `recordBehaviorEvent()` and allowlist exports in `src/lib/client-api.ts`.
  - Added `src/hooks/useBehaviorEvent.ts` for one-shot mount emit behavior.
  - Wired mount events:
    - `weekly_review_viewed` in `src/components/review/weekly-review-card.tsx`
    - `historical_review_viewed` in `src/components/review/historical-review-card.tsx`
    - `suggestion_viewed` in `src/components/home/next-best-quest-card.tsx`
  - Wired `quest_completed` on successful completion in `src/components/home/today-focus-shell.tsx`.
  - Deferred `suggestion_clicked` due to no dedicated click CTA in current NextBestQuestCard UI.
- Tests:
  - `src/tests/api-routes-events.test.ts`
  - `src/tests/behavior-event-emitter.test.ts`
  - `e2e/behavior-event-logging.spec.ts`
- Quality gates:
  - `npm run test:ci` passed (`22/22 files`, `111/111 tests`)
  - `npm run typecheck` passed
  - `npx eslint src e2e --ext .ts,.tsx` passed
  - `npm run build` passed; build manifest includes `/api/events`
  - `npx playwright test e2e/behavior-event-logging.spec.ts` remains environment-blocked locally because port `3000` is already in use.
