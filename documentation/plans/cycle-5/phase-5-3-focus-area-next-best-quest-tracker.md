# Phase 5.3 - Focus-Area Next-Best Quest Suggestion (Tracker)

Pair with `phase-5-3-focus-area-next-best-quest-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[~]` in progress

## A. Contract and scope guardrails

- [ ] Confirm Phase 5.3 stays within focus-aware next-best-quest suggestion scope.
- [ ] Confirm no new persistence is introduced in 5.3.
- [ ] Confirm suggestion output is single-item (`suggestion | null`) only.
- [ ] Confirm event-logged analytics remain out of scope (gated 5.4 / 5.5).
- [ ] Confirm AI/LLM recommendation remains out of scope in 5.3.

## B. Backend/API readiness

- [ ] Add authenticated `GET /api/today/suggestion` endpoint.
- [ ] Map onboarding focus areas to quest categories (`work/work`, `health/health`, `learning/study`, `life/personal`).
- [ ] Implement deterministic ranking (focus-area match -> category rotation -> priority fallback).
- [ ] Implement `reason` enum response (`focus_area_match` / `category_rotation` / `fallback_priority`).
- [ ] Implement encouragement-style copy variants by suggestion reason.

## C. UI integration

- [ ] Add `src/components/home/next-best-quest-card.tsx` rendering suggestion summary and reason.
- [ ] Mount card in `src/components/home/today-focus-shell.tsx` near the top of Today flow.
- [ ] Reuse existing loading/error patterns without disrupting current quest sections.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-today-suggestion.test.ts` with auth + null + ranking + tone tests.
- [ ] Add `src/tests/next-best-quest-card.test.tsx` with reason/tone variant tests.
- [ ] Add `e2e/today-next-best-quest.spec.ts` happy path.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 5.3 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 5.3 status.
- [ ] Record evidence summary in this tracker.

## Blockers

- None.

## Decision log

- 2026-04-26: Phase 5.3 theme selected as focus-area next-best-quest suggestion to activate `onboardingFocusArea` already captured in Phase 4.5.
- 2026-04-26: Keep recommendation deterministic and rule-based in 5.3; no AI/LLM ranking.
- 2026-04-26: Return a single recommendation object (or `null`) for predictable UI complexity and testability.
- 2026-04-26: Keep analytics/event logging out of scope in 5.3 per roadmap gating to 5.4/5.5.

## Out-of-scope confirmations

- [ ] No new User fields or new collections.
- [ ] No multi-suggestion feed or carousel.
- [ ] No AI/LLM-generated recommendation logic.
- [ ] No event-logged behavioral analytics.
- [ ] No sharing/export workflow.

## Exit criteria

- [ ] Authenticated Today surface renders next-best-quest card when eligible active quests exist.
- [ ] Suggestion API returns deterministic `suggestion | null` payload with valid reason and tone copy.
- [ ] Tests and quality gates pass.
- [ ] Progress summary + roadmap + tracker evidence are updated.

## Evidence summary

- (Filled in at closeout.)
