# Phase 7.2 — Schema Migration: `parentQuestId` (Plan)

Cycle 7 / Phase 7.2. Companion tracker: `phase-7-2-schema-migration-parent-quest-tracker.md`.

## Goal

Introduce quest hierarchy foundations by adding `parentQuestId` and related child-query APIs while preserving all existing quest flows. This phase is backend-contract first: schema, validation, routes, and selectors must be stable before Phase 7.3 primitives and Cycle 8 UI adoption.

## Sequence guardrails (refined order, no scope changes)

1. **Data layer first:** schema and indexes.
2. **Validation second:** hierarchy rules enforced before route writes.
3. **Endpoints third:** child create/read APIs built on validated model behavior.
4. **Selectors fourth:** shape consumers after endpoint payload contracts settle.
5. **UI adoption last:** no Cycle 8 hierarchy UI until all 7.2 gates are green.

## Scope

### In scope

- Add nullable, indexed `parentQuestId` to `src/models/Quest.ts`.
- Add compound index `{ createdBy, parentQuestId, status }`.
- Enforce two-level cap (children cannot themselves have children).
- Enforce `isDaily=true` parent disallow rule.
- Add:
  - `POST /api/quests/[id]/children`
  - `GET /api/quests/[id]/children`
- Extend `src/lib/quest-selectors.ts` with hierarchy helpers (`withChildren`, `siblingsOf`).

### Out of scope (explicit)

- Parent complete/delete cascade behavior (deferred to Phase 9.1).
- XP roll-up behavior changes (deferred to Phase 9.1).
- Quest list/detail/form redesign implementation (Cycle 8).
- Child ordering UX/data (`order` field deferred to Phase 9.2).

## Architecture decisions

1. **Nullable parent link:** top-level quests are `parentQuestId: null`.
2. **2-level cap enforced in multiple layers:** schema hook + route validation for defense in depth.
3. **Ownership remains mandatory:** all child operations must enforce `createdBy === session user`.
4. **No cross-user parenting:** parent and child must belong to the same authenticated user.
5. **Daily quests cannot be parents:** reject child creation under `isDaily=true` parent.

## File touch list

### Modified

- `src/models/Quest.ts` — add `parentQuestId`, index, depth validation hook.
- `src/app/api/quests/route.ts` — shared validation updates where required.
- `src/app/api/quests/[id]/route.ts` — update/guard validation for parent relationship edits if exposed.
- `src/lib/quest-selectors.ts` — add `withChildren`, `siblingsOf`.

### New

- `src/app/api/quests/[id]/children/route.ts` — GET + POST hierarchy endpoint.

## API contract targets

### `POST /api/quests/[id]/children`

- Auth required.
- Parent quest id from route param (`[id]`).
- Body aligns to existing quest create fields (`title`, `description`, `difficulty`, `category`, optional `dueDate`).
- Server behavior:
  - reject if parent missing or not owned by user.
  - reject if parent already has `parentQuestId` (would exceed 2 levels).
  - reject if parent `isDaily === true`.
  - create child with `parentQuestId = parent._id`.
- Response: `201 { quest }`.

### `GET /api/quests/[id]/children`

- Auth required.
- Parent quest id from route param (`[id]`).
- Returns owned children sorted by current default (`createdAt desc` unless otherwise specified).
- Response: `200 { children: Quest[] }`.

## Validation checklist (must pass before selector work)

- `parentQuestId` accepts `null` or valid ObjectId only.
- Top-level quest creation remains unchanged (`parentQuestId` omitted/null).
- Child creation under a child quest fails with `400`.
- Child creation under a daily parent fails with `400`.
- Child creation under another user's quest fails with `404` (or `401/403` per existing policy).

## Start gates for later phases

### Gate to begin Phase 7.3

- Schema/index migration merged and verified.
- Both child endpoints pass contract tests.
- Validation rules enforced consistently across schema + route.
- Selector helpers compile and are consumed by at least one integration path.

### Gate to begin Cycle 8 hierarchy UI

- Phase 7.2 routes stable (no pending payload-shape changes).
- Existing quest CRUD regression sweep passes.
- Hierarchy read path (`GET children` + selector helpers) supports list/detail usage without ad-hoc queries in UI components.

## Testing

### Automated

- Add route tests for `GET/POST /api/quests/[id]/children`:
  - unauthorized
  - parent not found
  - parent is child (2-level cap violation)
  - parent is daily
  - happy-path child create
  - happy-path child list
- Add model/validation tests for `parentQuestId` constraints.
- Extend selector tests for `withChildren` and `siblingsOf`.

### Quality gates

- `npm run test:ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Acceptance criteria

- `Quest` schema supports parent-child links with required index coverage.
- Two-level cap and daily-parent disallow rule are enforced.
- New child routes are available and contract-tested.
- Selector helpers expose hierarchy data needed by Phase 7.3/8.
- No regressions in existing quest create/update/delete/complete flows.
- Closeout note added to `documentation/status/progress-summary.md`.
