# Phase 7.2 — Schema Migration: `parentQuestId` (Tracker)

Cycle 7 / Phase 7.2. Pair with `phase-7-2-schema-migration-parent-quest-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[x] done`

## A. Baseline confirmation (from Phase 7.1)

- [x] Phase 7.1 marked done in `phase-7-1-design-tokens-tracker.md`.
- [x] Tokens/Inter baseline treated as stable input to Cycle 7+ sequencing.
- [x] Sequencing now assumes 7.2 executes next (no longer parallel with 7.1).

## B. Data layer first

### B.1 Quest schema

- [x] Add nullable `parentQuestId` field to `src/models/Quest.ts`.
- [x] Add index on `{ createdBy, parentQuestId, status }`.
- [x] Keep existing indexes intact (no regression/removal).

### B.2 Depth/daily validation at model layer

- [x] Enforce 2-level cap in schema validation/pre-save hook.
- [x] Enforce "daily parent cannot have children" guard.
- [x] Add model-level tests for both constraints.

## C. Validation second

### C.1 API validation updates

- [x] Update/introduce Zod schemas for child-create payloads.
- [x] Validate `id` params are valid ObjectId shape before querying.
- [x] Ensure parent ownership checks run before writes.

### C.2 Error-contract consistency

- [x] Reuse existing API status conventions (`401`, `404`, `400`, `500`).
- [x] Route logging uses `createRequestLogger` + `logRequestException`.

## D. Endpoints third

### D.1 Children route

- [x] Create `src/app/api/quests/[id]/children/route.ts`.
- [x] Implement `GET` (list children).
- [x] Implement `POST` (create child under parent).

### D.2 Contract tests

- [x] Unauthorized access returns `401`.
- [x] Parent not found/foreign parent returns `404`.
- [x] Parent is already a child returns `400`.
- [x] Parent is daily returns `400`.
- [x] Happy path create/list passes.

## E. Selectors fourth

- [x] Add `withChildren` helper to `src/lib/quest-selectors.ts`.
- [x] Add `siblingsOf` helper to `src/lib/quest-selectors.ts`.
- [x] Add selector tests for hierarchy helpers.

## F. UI-adoption gate (must be green before 7.3 and Cycle 8)

- [x] 7.2 API payload shape frozen and documented.
- [x] Existing quest CRUD + complete regressions checked.
- [x] 7.3 start gate satisfied (schema + endpoints + selectors stable).
- [x] Cycle 8 start gate satisfied (hierarchy data can be consumed directly).

## G. Quality gates

- [x] `npm run test:ci` green.
- [x] `npm run typecheck` green.
- [x] `npm run lint` green.
- [x] `npm run build` green.

## H. Closeout

- [x] Add Phase 7.2 closeout entry to `documentation/status/progress-summary.md`.
- [x] Mark Phase 7.2 done in `documentation/plans/cycles-7-8-9-plan.md`.
- [x] Capture decision log and any deferred follow-ups.

## Blockers

- None.

## Decision log

- 2026-04-29: Sequencing refined to execute 7.2 immediately after 7.1 closeout.
- 2026-04-29: Scope remains unchanged; only order/dependency clarity tightened.
- 2026-04-29: 7.2 implementation and validation closed; quality gates re-run successfully after environment stabilization.
