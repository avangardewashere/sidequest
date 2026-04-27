# Phase 5.3 - Focus-Area Next-Best Quest Suggestion (Execution Plan)

Cycle 5 / Phase 5.3. Companion tracker: `phase-5-3-focus-area-next-best-quest-tracker.md`.

## Goal

Ship a focus-area aware "next best quest" suggestion on the Today surface for authenticated solo users, activating onboarding focus-area personalization with deterministic server-side ranking and encouragement-style copy, without introducing new persistence or behavioral event logging.

## Scope

### In scope

- Add an authenticated suggestion API composed from existing sources (`User`, `Quest`, `CompletionLog`).
- Reuse `User.onboardingFocusArea` (Phase 4.5) as the primary ranking signal.
- Reuse `User.onboardingEncouragementStyle` (Phases 5.1 / 5.2) to drive tone-aware suggestion copy.
- Add a `NextBestQuestCard` UI component near the top of the Today surface.
- Add focused tests and one e2e happy path.

### Out of scope

- AI/LLM recommendation logic or adaptive learned ranking.
- Multi-card recommendation feeds (single suggestion only in 5.3).
- New persistence: no new collections or new `User` fields.
- Event-logged behavioral analytics (gated 5.4 / 5.5 per roadmap).
- Sharing/export/distribution surfaces.

## Architecture decisions

1. Phase 5.3 introduces `GET /api/today/suggestion` as a dedicated endpoint, separate from `/api/quests` and `/api/progression`.
2. Ranking remains deterministic and inspectable: focus-area alignment, then lightweight category rotation, then existing priority ordering fallback.
3. API returns at most one suggestion payload (or `null`) with ready-to-render headline/message copy.
4. UI placement is on Today (`TodayFocusShell`) above the main quest area to influence action selection early.
5. Mapping from onboarding focus area to quest category is explicit in 5.3:
   - `work -> work`
   - `health -> health`
   - `learning -> study`
   - `life -> personal`

## API/data/component contracts

- `GET /api/today/suggestion` returns:
  - `{ suggestion: { questId, title, category, reason, encouragementStyle, summaryHeadline, summaryMessage } | null }`
- `reason` enum:
  - `focus_area_match`
  - `category_rotation`
  - `fallback_priority`
- Ranking intent (deterministic):
  1. Prefer active quests matching mapped focus-area category.
  2. Otherwise prefer active quests in categories not completed in the last 7 UTC days.
  3. Otherwise fallback to current priority order (`priority_due` semantic parity).
- Encouragement-style copy table:
  - styles: `gentle` / `direct` / `celebration`
  - branched by `reason` so rationale and tone are consistent.
- UI:
  - `src/components/home/next-best-quest-card.tsx` (new) renders recommendation + reason label.
  - `src/components/home/today-focus-shell.tsx` mounts card in the Today flow.
  - Loading/error states reuse current panel styles used in Today and Stats.

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-today-suggestion.test.ts` covers auth, null-when-empty, reason selection, focus-area mapping, and encouragement branching.
  - `src/tests/next-best-quest-card.test.tsx` covers reason/tone variants and empty-state rendering.
- E2E:
  - `e2e/today-next-best-quest.spec.ts` covers authenticated Today happy path with mocked suggestion payload.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`
- targeted Playwright run for the 5.3 suggestion spec

## Acceptance criteria

- Authenticated Today surface renders a next-best-quest recommendation card when eligible active quests exist.
- API returns a deterministic single suggestion with valid `reason` and tone copy.
- Empty quest state returns `suggestion: null` without UI breakage.
- No new persistence is introduced and no 5.4/5.5 analytics behavior is preempted.
- All quality gates pass and 5.3 tracker progress can be advanced to implementation-ready.
