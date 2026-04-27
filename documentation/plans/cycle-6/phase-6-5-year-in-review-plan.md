# Phase 6.5 - Year-In-Review Recap (Execution Plan)

Cycle 6 / Phase 6.5. Companion tracker: `phase-6-5-year-in-review-tracker.md`.

## Goal

Surface a per-user recap page at `/recap` showing yearly totals, top categories, longest streak, and a shareable card image — built on existing metrics + behavior-event endpoints, with no new persistence.

## Scope

### In scope

- `GET /api/recap?year=YYYY` — single aggregation pipeline returning yearly stats.
- `/recap` page with sectioned scroll layout (totals → categories → streaks → top quests → share).
- Shareable card image: a `<canvas>`-rendered PNG with display name, year totals, and brand colors.
- Empty-state handling for accounts with no data in the given year.
- Tests + one E2E.

### Out of scope

- Years older than the user's `createdAt` are rejected with a 400 (no historical reconstruction).
- Server-rendered card image (kept client-side to avoid an image-processing dependency).
- Auto-share to social platforms.
- AI-generated commentary or narrative.

## Architecture decisions

1. The recap endpoint is a single aggregation pipeline returning a typed payload; no caching layer in this phase.
2. The shareable card uses a fixed 1200x630 canvas at 2x DPR so it renders crisply when downloaded.
3. `/recap` route is auth-gated; the existing middleware matcher is extended to include it.
4. Brand assets reuse the PWA icons from Phase 6.1 and the Indigo + Ember tokens.
5. The recap reads from existing collections only — `quests`, `completionlogs`, `milestonerewardlogs`, `focussessions`, `behaviorevents`. No new write paths.

## API/data/component contracts

- `GET /api/recap?year=YYYY` returns:
  - `{ recap: { year, totals: { xp, completions, focusMinutes }, topCategories, topTags, longestStreak, topQuest, generatedAt } }`
- 400 invalid year (non-numeric, before `createdAt`'s year, or in the future).
- 401 unauthenticated.
- New page: `src/app/recap/page.tsx`.
- New component: `src/components/recap/shareable-card.tsx` rendering to canvas and triggering download.
- Middleware matcher extended in `src/middleware.ts` to include `/recap`.

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-recap.test.ts` — auth, year validation, aggregation correctness on fixtures.
  - `src/tests/recap-card.test.tsx` — canvas render produces blob; download trigger fires.
- E2E:
  - `e2e/year-in-review.spec.ts` — visit `/recap`, assert totals render, click "Download card", assert blob URL.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- `/recap` renders for a populated test account with all sections present.
- Shareable card downloads as a PNG with the correct dimensions.
- Empty-state copy renders for an account with no quests in the year.
- No third-party image-processing dependency added.
- Quality gates pass and closeout docs are updated.
