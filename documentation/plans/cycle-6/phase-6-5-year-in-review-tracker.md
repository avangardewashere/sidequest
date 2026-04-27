# Phase 6.5 - Year-In-Review Recap (Tracker)

Pair with `phase-6-5-year-in-review-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[ ]` pending

## A. Contract and scope guardrails

- [ ] Confirm recap reads existing collections only; no new persistence.
- [ ] Confirm shareable card is rendered client-side via canvas (no server image processing).
- [ ] Confirm year validation rejects pre-`createdAt` and future years.
- [ ] Confirm card uses display name only (no email/PII).

## B. Backend/API

- [ ] Add `GET /api/recap?year=YYYY` route with validation.
- [ ] Implement aggregation pipeline producing the documented payload shape.
- [ ] Extend `src/middleware.ts` matcher to include `/recap`.

## C. UI and component

- [ ] Add `src/app/recap/page.tsx` with sectioned scroll layout.
- [ ] Add `src/components/recap/shareable-card.tsx` (1200×630 canvas at 2x DPR).
- [ ] Hook download button to `canvas.toBlob` + object URL.
- [ ] Empty-state branch when totals are all zero.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-recap.test.ts`.
- [ ] Add `src/tests/recap-card.test.tsx`.
- [ ] Add `e2e/year-in-review.spec.ts`.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 6.5 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 6.5 status.
- [ ] Record evidence summary below.

## Blockers

- None yet.

## Decision log

- YYYY-MM-DD: Confirm card dimensions (1200×630 vs alternatives).
- YYYY-MM-DD: Confirm year-validation policy (createdAt-floor + no-future).

## Out-of-scope confirmations

- [ ] No server-rendered card image.
- [ ] No social auto-share integration.
- [ ] No AI-generated commentary.
- [ ] No reconstruction of pre-account data.

## Exit criteria

- [ ] `/recap` renders with all sections for a populated account.
- [ ] Shareable card downloads correctly as PNG.
- [ ] Tests and quality gates pass.
- [ ] Closeout docs updated.

## Evidence summary

- (Filled in at closeout.)
