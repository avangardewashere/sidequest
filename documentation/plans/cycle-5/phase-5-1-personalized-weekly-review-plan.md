# Phase 5.1 - Personalized Weekly Review (Execution Plan)

Cycle 5 / Phase 5.1. Companion tracker: `phase-5-1-personalized-weekly-review-tracker.md`.

## Goal

Ship a personalized weekly review surface for authenticated solo users that combines last-7-day completions with onboarding-derived weekly target progress and encouragement-style tone, without introducing new persistence or behavioral event logging.

## Scope

### In scope

- Add an authenticated weekly review API that composes 7-day review data from existing sources.
- Reuse `User.onboardingWeeklyTarget` (Phase 4.5) for target progress.
- Reuse `User.onboardingEncouragementStyle` (Phase 4.5) to drive tone-aware copy.
- Add a `WeeklyReviewCard` UI component to the existing `/stats` route.
- Add focused tests and one weekly review e2e happy path.

### Out of scope

- Multi-week or historical comparison views (later Cycle 5 phases).
- Sharing/export/email of the review (Cycle 6 distribution work).
- Event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap).
- New persistence: no new collections or User fields are introduced in 5.1.

## Architecture decisions

1. Phase 5.1 introduces a dedicated `GET /api/review/weekly` endpoint instead of overloading `/api/metrics/summary`, to keep concerns scoped and easy to evolve.
2. Weekly review composition is computed server-side from existing data sources (quest completions over last 7 days + `User` onboarding fields).
3. Encouragement-style copy variants are derived server-side so the client receives ready-to-render headline + message strings.
4. UI lives at the top of `/stats` to align with analytical context. The `/you` surface is not modified in 5.1.

## API/data/component contracts

- `GET /api/review/weekly` returns:
  - `{ weeklyReview: { rangeStart, rangeEnd, completionsLast7d, weeklyTarget, progressPct, encouragementStyle, summaryHeadline, summaryMessage } }`
- Encouragement-style copy table:
  - `gentle`: warm, supportive headline + steady-progress message
  - `direct`: concise, factual headline + plain progress callout
  - `celebration`: high-energy headline + celebratory message
- UI:
  - `src/components/review/weekly-review-card.tsx` (new) renders the card.
  - `src/app/stats/page.tsx` mounts the card at the top of the stats view, ahead of existing KPI/chart sections.
  - Loading/error states reuse existing toast/loading patterns where possible.

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-review.test.ts` covers auth + payload composition + encouragement-style branching.
  - `src/tests/weekly-review-card.test.tsx` covers tone variant rendering.
- E2E:
  - `e2e/weekly-review.spec.ts` covers the authenticated `/stats` happy path with a mocked weekly review payload.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`
- targeted Playwright run for the weekly review spec

## Acceptance criteria

- Authenticated `/stats` shows a weekly review card with completions vs weekly target.
- Encouragement-style tone is reflected in the rendered copy variants.
- API returns the weekly review payload correctly with proper auth checks.
- No new persistence is introduced and no Phase 5.2-5.6 behavior is preempted.
- All quality gates pass and Phase 5.1 closeout docs are updated.
