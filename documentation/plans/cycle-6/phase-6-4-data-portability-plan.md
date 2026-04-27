# Phase 6.4 - Data Portability (Execution Plan)

Cycle 6 / Phase 6.4. Companion tracker: `phase-6-4-data-portability-tracker.md`.

## Goal

Let an authenticated user download a complete, machine-readable export of their own SideQuest data (NDJSON, streamed) from the `/you` surface, with no third-party dependencies and no schema changes.

## Scope

### In scope

- `GET /api/export` — streamed `application/x-ndjson` response. Each line is `{ collection, document }`.
- Collections in deterministic order: `users` (self only), `quests`, `completionlogs`, `milestonerewardlogs`, `focussessions`, `behaviorevents`.
- `/you` adds a "Download my data" button that calls the endpoint and triggers a file download.
- Filename: `sidequest-export-<displayNameSlug>-<ISODate>.ndjson`.
- Export size guard: if any single collection exceeds 50 MB, return 413 with a guidance message.
- Tests + one E2E.

### Out of scope

- Import endpoint (deferred until a real consumer exists).
- Scheduled email delivery of exports.
- At-rest encryption of the exported file.
- Multi-format export (no CSV, no PDF).

## Architecture decisions

1. NDJSON streaming via `ReadableStream` so memory stays bounded for large accounts; collections are walked in order with cursor pagination internally.
2. Filename is generated server-side via `Content-Disposition: attachment; filename=...`.
3. Authentication uses the standard server session check; no separate access token.
4. The endpoint walks collections in a deterministic order so the file is replay-friendly when a future Import phase ships.
5. The 50 MB per-collection guard is checked by streaming a counter; if exceeded mid-stream, the response ends with a final `{ error: 'collection_too_large', collection }` line and a 413 status header is set up front (status decided before stream start by a fast pre-count query).

## API/data/component contracts

- `GET /api/export` returns `application/x-ndjson` with `Content-Disposition: attachment`.
- `/you` adds a button + a small explanatory note linking to a docs section in `documentation/ops/`.

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-export.test.ts` — auth, content-type, line shape, deterministic collection order, 413 over-size guard with fixture.
- E2E:
  - `e2e/export-data.spec.ts` — click button, assert response Content-Type is `application/x-ndjson` and the first parsed line carries `{ collection: 'users', document: { ... } }`.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- Export streams; memory stays bounded under simulated 10k-document accounts (verified via test fixture).
- Each line parses as valid JSON with stable `{ collection, document }` shape.
- 413 path triggers when forced via a fixture that exceeds the threshold.
- Quality gates pass and closeout docs are updated.
