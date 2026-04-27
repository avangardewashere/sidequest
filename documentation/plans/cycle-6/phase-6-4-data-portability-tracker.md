# Phase 6.4 - Data Portability (Tracker)

Pair with `phase-6-4-data-portability-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[ ]` pending

## A. Contract and scope guardrails

- [ ] Confirm export only (no import in this phase).
- [ ] Confirm NDJSON streamed shape: one `{ collection, document }` per line.
- [ ] Confirm 50 MB per-collection guard policy.
- [ ] Confirm authentication uses standard server session check.

## B. Backend/API

- [ ] Add `GET /api/export` route with `ReadableStream` response.
- [ ] Implement deterministic collection walk with cursor pagination.
- [ ] Implement 50 MB pre-count guard with 413 path.
- [ ] Stream `users` (self), `quests`, `completionlogs`, `milestonerewardlogs`, `focussessions`, `behaviorevents`.

## C. UI integration

- [ ] Add "Download my data" button + helper note on `/you`.
- [ ] Trigger client download with the right filename.
- [ ] Surface 413 error path with a friendly toast pointing at docs.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-export.test.ts`.
- [ ] Add `e2e/export-data.spec.ts`.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 6.4 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 6.4 status.
- [ ] Add a short export-format doc entry under `documentation/ops/` so users can self-serve.
- [ ] Record evidence summary below.

## Blockers

- None yet.

## Decision log

- YYYY-MM-DD: Confirm collection ordering policy.
- YYYY-MM-DD: Confirm 50 MB threshold.

## Out-of-scope confirmations

- [ ] No import endpoint in 6.4.
- [ ] No scheduled email delivery.
- [ ] No at-rest encryption.
- [ ] No CSV/PDF formats.

## Exit criteria

- [ ] Authenticated export works end to end and produces a parseable NDJSON file.
- [ ] 413 path is reachable under fixture conditions.
- [ ] Tests and quality gates pass.
- [ ] Closeout docs updated.

## Evidence summary

- (Filled in at closeout.)
