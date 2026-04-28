# Phase 7.4 — Tags, Notes, and Links Schema (Tracker)

Cycle 7 / Phase 7.4. Pair with `phase-7-4-tags-notes-links-schema-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[~] in progress`

## A. Schema foundation

- [~] Add `tags`, `notes`, and `links` fields to `Quest` schema with validation limits.
- [ ] Add schema-level guards for max counts and field lengths.

## B. Tags normalization helper

- [ ] Create `src/lib/quest-tags.ts`.
- [ ] Implement `normalizeTags(input)` with lowercase/trim/dedupe/max caps.
- [ ] Implement `userTagSuggestions(userId, prefix)` query helper.
- [ ] Add helper unit tests.

## C. Route contracts

- [ ] `PATCH /api/quests/[id]/tags`.
- [ ] `POST /api/quests/[id]/notes`.
- [ ] `PATCH /api/quests/[id]/notes/[noteId]`.
- [ ] `DELETE /api/quests/[id]/notes/[noteId]`.
- [ ] `POST /api/quests/[id]/links`.
- [ ] `DELETE /api/quests/[id]/links/[linkId]`.

## D. Validation and ownership checks

- [ ] Auth and ownership checks on all 7.4 endpoints.
- [ ] Link self-reference rejected.
- [ ] Missing/orphan link target rejected.

## E. Testing and gates

- [ ] Route contract tests for tags/notes/links.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

## F. Closeout

- [ ] Add 7.4 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update cycle status markers once complete.

## Decision log

- 2026-04-29: 7.4 kicked off immediately after 7.2/7.3 closure and push to main.
