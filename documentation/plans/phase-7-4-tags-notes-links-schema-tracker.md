# Phase 7.4 — Tags, Notes, and Links Schema (Tracker)

Cycle 7 / Phase 7.4. Pair with `phase-7-4-tags-notes-links-schema-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[x] done`

## A. Preconditions and kickoff gates

- [x] 7.3 closeout confirmed in `phase-7-3-habit-cadence-completion-history-tracker.md`.
- [x] 7.3 closeout note confirmed in `documentation/status/progress-summary.md`.
- [x] 7.4 execution branch created: `cycle-7/phase-7.4-tags-notes-links-schema`.
- [x] Scope and deferments synced with `cycles-7-8-9-plan.md`.

## B. Contract freeze (before coding)

- [x] Tags contract frozen: trim + lowercase + dedupe + max 8 + 1-32 chars each.
- [x] Notes contract frozen: max 50 notes, body required, body <= 4096 chars.
- [x] Links contract frozen: enum kind, max 32, self-link rejected, orphan target rejected.
- [x] Deferment frozen: reciprocal link writes postponed to 8.6.
- [x] Error contract frozen: `400` validation, `401` auth, `404` not found.

## C. Execution lanes (locked)

- [x] Lane A (schema/validation): model fields + guardrails.
- [x] Lane B (routes): tags -> notes -> links handlers with ownership checks.
- [x] Lane C (tests/gates): unit + route contracts + CI gate sequence.

## D. Schema foundation

- [x] Add `tags`, `notes`, and `links` fields to `Quest` schema with validation limits.
- [x] Add schema-level guards for max counts and field lengths.

## E. Tags normalization helper

- [x] Create `src/lib/quest-tags.ts`.
- [x] Implement `normalizeTags(input)` with lowercase/trim/dedupe/max caps.
- [x] Implement `userTagSuggestions(userId, prefix)` query helper.
- [x] Add helper unit tests.

## F. Route contracts

- [x] `PATCH /api/quests/[id]/tags`.
- [x] `POST /api/quests/[id]/notes`.
- [x] `PATCH /api/quests/[id]/notes/[noteId]`.
- [x] `DELETE /api/quests/[id]/notes/[noteId]`.
- [x] `POST /api/quests/[id]/links`.
- [x] `DELETE /api/quests/[id]/links/[linkId]`.

## G. Validation and ownership checks

- [x] Auth and ownership checks on all 7.4 endpoints.
- [x] Link self-reference rejected.
- [x] Missing/orphan link target rejected.

## H. Testing and gates

- [x] Route contract tests for tags/notes/links.
- [x] `npm run test:ci`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

## I. Closeout

- [x] Add 7.4 closeout note to `documentation/status/progress-summary.md`.
- [x] Update cycle status markers once complete.

## Blockers

- None.

## Decision log

- 2026-04-29: 7.4 kickoff executed after 7.3 closeout confirmation in tracker + progress summary.
- 2026-04-29: Contract freeze approved for tags/notes/links limits and error semantics.
- 2026-04-29: Lane boundaries locked (schema -> routes -> tests/gates) to prevent implementation drift.
- 2026-04-29: Implemented Quest schema second-brain fields (`tags`, `notes`, `links`) with caps and no-HTML note-body guardrails.
- 2026-04-29: Implemented 7.4 route set (`tags`, `notes`, `links`) with auth/ownership checks and link integrity validation.
- 2026-04-29: Added helper + tests (`quest-tags`, route contract tests); quality gates passed after regenerating Next route types.
