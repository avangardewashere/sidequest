# Phase 9.5 — Polish, animations, dark theme, sweep (design locks)

## In-scope surfaces (token sweep)

Priority order for migrating legacy zinc classes and Tailwind grays to semantic tokens (`globals.css` / `bg-canvas`, `var(--color-*)`):

1. **Home (Today / Focus)** — `today-focus-*`, header, task sections.
2. **Stats** — charts, range controls, `ChartShell` containers.
3. **Auth shell** — unauthenticated `/` login/register card.

Secondary (reuse patterns from above): quest list, quest detail, profile (You), `/review/weekly`.

## Dark theme

- **Mechanism:** `prefers-color-scheme: dark` overrides on `:root` for semantic `--color-*`, `--background`, `--foreground`, and legacy aliases consumed by `@theme inline`.
- **Profile toggle:** Deferred unless product asks in-cycle (matches cycles plan wording).

## `isDaily` deprecation

- **Writes:** New daily-generated quests use **`cadence.kind: "daily"`** + **`dailyKey`** only; **`isDaily` is not set on insert**.
- **Reads:** APIs and helpers continue to treat **`cadence` as source of truth** with **`normalizeQuestCadence`** / `$or` queries that include legacy `isDaily: true` documents until data ages out.
- **Indexes:** Unique compound on `(createdBy, dailyKey, title)` uses a partial filter that matches **either** legacy daily flags **or** `cadence.kind: "daily"` so upserts stay idempotent.

## Micro-motion

- **Streak milestones:** `StreakFlame` uses stronger pulse / emphasis when streak ∈ {7,14,30,100}.
- **Progress ring:** stroke-dash transition when percent changes.
- **Completion milestones:** Toasts and optional short-lived celebration affordance when `milestoneReward` is returned from complete API.

## Empty states

Shared **`EmptyState`** component for zero-data rows on primary routes (lists, optional weekly/stats callouts) with consistent title, supporting copy, and optional CTA slot.

## Verification

- CI: `npm run test:ci`, `typecheck`, `lint`, `build`.
- Manual: responsive smoke on Home, Stats, auth, quest list/detail; dark mode via OS preference.
