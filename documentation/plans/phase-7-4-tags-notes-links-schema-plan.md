# Phase 7.4 — Tags, Notes, and Links Schema (Plan)

Cycle 7 / Phase 7.4. Companion tracker: `phase-7-4-tags-notes-links-schema-tracker.md`.

## Goal

Attach second-brain context to every quest by adding validated `tags`, `notes`, and `links` schema fields plus stable API contracts, without pulling in Cycle 8 UI responsibilities.

## Why this phase starts now

Per `cycles-7-8-9-plan.md`, 7.3 is complete and 7.4 is the immediate backend/schema follow-up that unlocks:
- 8.2 quest detail tags/notes/links sections
- 8.4 form-level tag and note wiring
- 8.6 cross-linking and search workflows

## Scope

### In scope

- `Quest` schema additions:
  - `tags: string[]` (normalized lowercase, deduped, max 8, each 1-32 chars)
  - `notes: { id: ObjectId, body: string, createdAt: Date }[]` (max 50, body <= 4096 chars)
  - `links: { questId: ObjectId, kind: "related" | "blocks" | "depends-on" }[]` (max 32)
- Route handlers:
  - `PATCH /api/quests/[id]/tags`
  - `POST /api/quests/[id]/notes`
  - `PATCH /api/quests/[id]/notes/[noteId]`
  - `DELETE /api/quests/[id]/notes/[noteId]`
  - `POST /api/quests/[id]/links`
  - `DELETE /api/quests/[id]/links/[linkId]`
- New helper module:
  - `src/lib/quest-tags.ts` with `normalizeTags(input)` and `userTagSuggestions(userId, prefix)`.
- Contract tests for endpoint auth/ownership, validation failures, and successful mutations.

### Out of scope

- Reciprocal/back-reference link writes (deferred to 8.6).
- Search UI / command palette / linked-from rail rendering (8.6).
- Reflection-note types and weekly review coupling (9.4).

## Contract freeze (must approve before coding)

1. `tags` normalization contract:
   - trim whitespace, lowercase, remove empties, dedupe after normalization
   - enforce max 8 tags, and max 32 chars per tag
2. `notes` contract:
   - note body required, max 4096 chars
   - create appends note with generated `id` and `createdAt`
   - update mutates body only; delete removes by `noteId`
   - HTML is not accepted in persisted body for this phase (markdown/plain text only)
3. `links` contract:
   - `kind` restricted to `related|blocks|depends-on`
   - reject self-reference (`questId === current quest`)
   - reject missing/orphan target quest
   - cap at 32 links per quest; duplicate target+kind pair rejected
4. API response/error baseline:
   - authenticated owner-only access for all routes
   - `400` for validation failures, `404` for not found, `401` for auth failures
   - deterministic payload shape for success + error responses

## Execution lanes (locked)

### Lane A — Schema and validation

- Add `Quest` schema fields and validators for all field caps and shape checks.
- Add any model-level sanitization needed before persistence.

### Lane B — Routes

- Implement route handlers in this order: tags -> notes -> links.
- Apply auth + ownership checks consistently across all handlers.

### Lane C — Tests and quality gates

- Add unit tests for tag normalizer edge cases.
- Add route tests for note limits and link guards.
- Run full gates: `test:ci`, `typecheck`, `lint`, `build`.

## File touch targets

### Expected modified

- `src/models/Quest.ts`
- `src/app/api/quests/[id]/tags/route.ts`
- `src/app/api/quests/[id]/notes/route.ts`
- `src/app/api/quests/[id]/notes/[noteId]/route.ts`
- `src/app/api/quests/[id]/links/route.ts`
- `src/app/api/quests/[id]/links/[linkId]/route.ts`

### Expected new

- `src/lib/quest-tags.ts`
- route/unit test files in existing API and lib test directories

## Start gates for implementation

- 7.3 closeout is confirmed in tracker + progress summary.
- Branch `cycle-7/phase-7.4-tags-notes-links-schema` exists and is active.
- Contract freeze decisions recorded (limits, validation, deferments).
- Tracker sections are pre-filled with lane tasks and gate checklist.

## Acceptance criteria

- Tags are normalized exactly per contract and hard-capped.
- Notes CRUD enforces body constraints and max-note count.
- Links CRUD enforces enum, self-reference rejection, and missing-target rejection.
- All new routes enforce auth and ownership.
- `npm run test:ci`, `npm run typecheck`, `npm run lint`, and `npm run build` pass (or blockers are explicitly documented).
