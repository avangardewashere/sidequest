# Phase 7.4 — Tags, Notes, and Links Schema (Plan)

Cycle 7 / Phase 7.4. Companion tracker: `phase-7-4-tags-notes-links-schema-tracker.md`.

## Goal

Attach second-brain context to quests by adding durable tags, notes, and links data with validation and API contracts, while keeping UI-heavy surfaces deferred to Cycle 8.

## Scope

### In scope

- `Quest` schema additions:
  - `tags: string[]` (normalized, deduped, max 8, each 1-32 chars)
  - `notes: { id, body, createdAt }[]` (max 50, body <= 4kB)
  - `links: { questId, kind }[]` where `kind` in `related|blocks|depends-on` (max 32)
- Route handlers:
  - `PATCH /api/quests/[id]/tags`
  - `POST /api/quests/[id]/notes`
  - `PATCH /api/quests/[id]/notes/[noteId]`
  - `DELETE /api/quests/[id]/notes/[noteId]`
  - `POST /api/quests/[id]/links`
  - `DELETE /api/quests/[id]/links/[linkId]`
- New helper:
  - `src/lib/quest-tags.ts` with `normalizeTags()` and `userTagSuggestions()`.
- Test coverage for tag normalization, note limits, and link constraints.

### Out of scope

- Link back-reference UI rails (Cycle 8.6).
- Search UX and command palette integration (Cycle 8.6).
- Reflection note subtype and review flow (Cycle 9.4).

## Execution order

1. Add schema fields and hard limits in model layer.
2. Add normalization helper and unit tests.
3. Add tags API route, then notes routes, then links routes.
4. Add contract tests for all new routes.
5. Run full quality gates and close tracker.

## Acceptance criteria

- Tags are lowercase/trimmed/deduped and capped correctly.
- Note create/update/delete routes enforce body and count limits.
- Link routes reject self-reference and missing target quests.
- New routes enforce auth and quest ownership.
- `test:ci`, `typecheck`, `lint`, and `build` pass.
