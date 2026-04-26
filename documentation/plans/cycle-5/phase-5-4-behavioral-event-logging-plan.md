# Phase 5.4 - Behavioral Event Logging Foundation (Execution Plan)

Cycle 5 / Phase 5.4. Companion tracker: `phase-5-4-behavioral-event-logging-tracker.md`.

## Goal

Establish a stable, authenticated, server-validated behavioral event logging foundation so that subsequent personalization phases (5.5 analytics surfaces, future ranking/coaching work) can consume real client-emitted events. Phase 5.4 ships only the foundation: a new `BehaviorEvent` collection, an authenticated `POST /api/events` endpoint with a strict allowlist, a small client emitter, and best-effort wiring on existing review and suggestion surfaces. No new dashboards or analytics aggregation surfaces are introduced in 5.4 — those are Phase 5.5.

## Scope

### In scope

- New persistence: first new collection in Cycle 5.
  - `BehaviorEvent` Mongoose model: `userId`, `name`, `properties`, `createdAt`.
  - Indexes: `userId`, compound `userId + createdAt desc`.
- Authenticated `POST /api/events` endpoint:
  - Validates `name` against an enum allowlist.
  - Validates `properties` shape (size cap; no nested arrays beyond depth 1).
  - Auth-gated; returns the persisted event minimal shape.
  - Lightweight per-user in-memory rate-limit guard (durable rate-limit deferred).
- Initial event allowlist (matches existing surfaces; no new UI):
  - `weekly_review_viewed`
  - `historical_review_viewed`
  - `suggestion_viewed`
  - `suggestion_clicked`
  - `quest_completed`
- Client emitter and wiring:
  - `recordBehaviorEvent(name, properties?)` helper in `src/lib/client-api.ts`, best-effort (swallow network failures).
  - Lightweight `useBehaviorEvent(name, properties)` hook (or inline emit) for one-shot mount events.
  - Wire mount emits from existing surfaces:
    - WeeklyReviewCard mount on `/stats` -> `weekly_review_viewed`
    - HistoricalReviewCard mount on `/stats` -> `historical_review_viewed`
    - NextBestQuestCard mount on Today -> `suggestion_viewed`
  - Wire `quest_completed` emit from the existing successful quest completion path on the Today shell.
  - `suggestion_clicked` is wired only if a click action is exposed in 5.4; otherwise deferred.
- Tests and one e2e happy path.

### Out of scope

- Analytics dashboards or aggregation surfaces (Phase 5.5).
- Third-party analytics SDKs (Segment, Amplitude, etc.).
- AI / LLM event interpretation or scoring.
- Multi-user / org-level analytics.
- Server-driven event triggers — only client-emitted events in 5.4.
- Sharing / export of events.
- Durable distributed rate-limiting; only an in-memory per-process guard is in scope.

## Architecture decisions

1. Phase 5.4 establishes the explicit Cycle 5 "stable event logging" gate referenced by Phases 5.4 and 5.5 in the roadmap. It deliberately does not consume the data; Phase 5.5 will.
2. `BehaviorEvent` is owned by the application server only; clients never write directly to MongoDB.
3. The event `name` enum is an explicit allowlist on both client and server; rejection on either side is a 400 / no-op respectively.
4. `properties` is intentionally permissive (free-form `Record<string, unknown>`) but capped (size + nesting) so that Phase 5.5 can aggregate without schema migrations.
5. Wiring uses mount-time emits for review and suggestion cards; no new UI is introduced in 5.4.
6. The client emitter is best-effort: a network failure must not break the surface that emitted it.

## API/data/component contracts

- `BehaviorEvent` model:
  - `userId: ObjectId` (indexed)
  - `name: string` (enum-validated against the allowlist)
  - `properties: Record<string, unknown>` (validated; size-capped)
  - `createdAt: Date` (default now; participates in `userId + createdAt desc` compound index)

- `POST /api/events`:
  - Request: `{ name: string, properties?: Record<string, unknown> }`
  - Response: `{ event: { id: string, name: string, createdAt: string } }`
  - 400 on invalid `name` (not in allowlist) or oversized `properties`.
  - 401 on unauthenticated.
  - 429 on simple per-user rate-limit (lightweight in-memory guard in 5.4).

- Client contract (`src/lib/client-api.ts`):
  - `BEHAVIOR_EVENT_NAMES` constant (string-literal union matching server allowlist).
  - `BehaviorEventName` type.
  - `recordBehaviorEvent(name: BehaviorEventName, properties?: Record<string, unknown>): Promise<void>` — best-effort; returns void; logs and swallows network errors.

- Hook (`src/hooks/useBehaviorEvent.ts` — optional; may stay as inline `useEffect` calls if hook adds no value):
  - `useBehaviorEvent(name, properties)` fires exactly once on mount.

- Wiring touches (no UI re-design):
  - `src/components/review/weekly-review-card.tsx` — mount emit `weekly_review_viewed`.
  - `src/components/review/historical-review-card.tsx` — mount emit `historical_review_viewed`.
  - `src/components/home/next-best-quest-card.tsx` — mount emit `suggestion_viewed`.
  - `src/components/home/today-focus-shell.tsx` — emit `quest_completed` from the existing quest-completion success branch.

## Testing plan

- Unit / integration:
  - `src/tests/api-routes-events.test.ts`
    - 401 when unauthenticated.
    - 200 + persisted minimal shape on a valid allowlisted name.
    - 400 on a name outside the allowlist.
    - 400 on an oversized `properties` payload.
    - 429 after exceeding the per-user in-memory rate-limit window.
  - `src/tests/behavior-event-emitter.test.ts`
    - Allowlist client-side guard (rejecting non-allowlisted names locally).
    - Best-effort failure swallow (no thrown error on network rejection).
    - Payload shaping (e.g. property size guard, never sending undefined).
- E2E:
  - `e2e/behavior-event-logging.spec.ts`
    - Navigates `/stats` and Today (`/`).
    - Mocks `POST /api/events` and asserts the expected event names are emitted on mount and on a quest-completion happy path.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`
- targeted Playwright run for `e2e/behavior-event-logging.spec.ts` (subject to the same port-3000 environment caveat seen in 5.1 / 5.2 / 5.3 — recorded as a tracker blocker if it recurs).

## Acceptance criteria

- New `BehaviorEvent` collection persists allowlisted events for authenticated users only.
- `POST /api/events` enforces auth, allowlist, size cap, and per-user rate-limit, returning the documented payload.
- Existing review and suggestion surfaces emit their respective mount events without breaking the host surface on network failure.
- Quest-completion success path emits `quest_completed` without disturbing the existing optimistic completion UX.
- All quality gates pass and 5.4 tracker progress can be advanced to closeout.
- No analytics surfaces, no new UI, and no third-party SDK are introduced in 5.4.
