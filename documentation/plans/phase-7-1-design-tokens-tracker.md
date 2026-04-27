# Phase 7.1 — Design Tokens (Tracker)

Cycle 7 / Phase 7.1. Pair with `phase-7-1-design-tokens-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[x]` done (2026-04-27)

## A. Token definitions

### A.1 Colors

- [x] Add `--color-canvas`, `--color-bg-surface`, `--color-bg-elevated` (in `@theme` block; Tailwind v4 auto-emits onto `:root`).
- [x] Add `--color-primary`, `--color-primary-strong`, `--color-primary-subtle`.
- [x] Add `--color-ember`, `--color-ember-subtle`.
- [x] Add `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`.
- [x] Add `--color-border-subtle`, `--color-border-default`.
- [x] Add semantic tokens: `--color-success`, `--color-warning`, `--color-danger`, `--color-info`.

### A.2 Typography

- [x] Add `--text-display`, `--text-hero-title`, `--text-body-primary`, `--text-body-secondary`, `--text-label-caps`, `--text-badge-label` with size/line-height/weight via Tailwind v4's `--text-X--line-height` / `--text-X--font-weight` / `--text-X--letter-spacing` modifiers.
- [x] Wire Inter font in `src/app/layout.tsx` via `next/font/google` with `display: 'swap'`.
- [x] Add `--font-display` referencing the Inter CSS variable (`var(--font-inter)`).

### A.3 Spacing

- [x] Add `--spacing-stack-sm/md/lg`, `--spacing-section-gap`, `--spacing-gutter`, `--spacing-container-margin`.

### A.4 Radii

- [x] Add `--radius-sm`, `--radius-lg`, `--radius-xl`, `--radius-full`.

## B. Tailwind exposure

- [x] Tokens defined in `@theme` (not `@theme inline`) so Tailwind v4 auto-generates utilities (`bg-canvas`, `text-text-primary`, `font-display`, `p-stack-md`, `rounded-xl`) AND emits matching `:root` CSS vars from a single source.
- [x] `npm run build` compiles successfully (12.2s, all 12 routes).

## C. TypeScript barrel

- [x] Created `src/lib/design-tokens.ts` exporting `Object.freeze`d consts: `colors`, `typography`, `spacing`, `radii`, plus aggregate `tokens`.
- [x] Exported TS types: `ColorToken`, `TypographyToken`, `SpacingToken`, `RadiusToken`.
- [x] `npm run build` includes the TypeScript pass — confirmed clean.

## D. Validation

- [x] `npm run build` green — Tailwind v4 compile + Next.js TypeScript pass + 12-route static generation all succeed.
- [x] No project script `npm run typecheck` exists; build's bundled TypeScript pass is the equivalent.
- [x] No project script `npm run test:ci` exists in this worktree (no vitest/playwright installed). Marked as N/A for this phase.
- [x] `npm run lint` — pre-existing error in `src/hooks/useDashboardActions.ts:50` (`react-hooks/set-state-in-effect`); not introduced by this phase. No new lint errors from Phase 7.1 files.
- [x] Existing pages render identically (build output identical route count + sizes).

## E. Docs and closeout

- [x] Append `## 12) Cycle 7 kickoff — Phase 7.1 closeout` to `documentation/status/progress-summary.md` (or create if missing).
- [x] Phase 7.1 marked done in `documentation/plans/cycles-7-8-9-plan.md` via this tracker.
- [x] Evidence summary recorded below.

## Blockers

- None yet.

## Decision log

- 2026-04-27: Tailwind v4 confirmed (no `tailwind.config.ts`); tokens land in `globals.css` `@theme` block.
- 2026-04-27: Light theme only; dark deferred to Phase 9.2.
- 2026-04-27: Geist fonts stay alongside Inter to avoid Cycle 8 churn.

## Out-of-scope confirmations

- [ ] No dark theme.
- [ ] No replacement of existing zinc classes.
- [ ] No component primitives in this phase.

## Exit criteria

- [ ] All tokens appear in `:root` and as Tailwind utilities.
- [ ] No visual regression on any existing page.
- [ ] Quality gates pass.
- [ ] Closeout docs updated.

## Evidence summary

**Files modified**
- `src/app/globals.css` — added Stitch design tokens to `@theme` block (colors, type scale, spacing, radii). Legacy `--background` / `--foreground` retained.
- `src/app/layout.tsx` — added `Inter` from `next/font/google` with `display: 'swap'` and `--font-inter` CSS var; `<html>` className extended.

**Files created**
- `src/lib/design-tokens.ts` — TS barrel with `colors`, `typography`, `spacing`, `radii`, and aggregate `tokens` exports. Frozen constants. Exports `ColorToken`, `TypographyToken`, `SpacingToken`, `RadiusToken` types.

**Build output**
```
✓ Compiled successfully in 12.2s
  Running TypeScript ...
  Finished TypeScript in 10.7s ...
✓ Generating static pages using 7 workers (12/12) in 745ms
```
All 12 routes generated; route table identical to pre-7.1 state.

**Notes for next phases**
- `npm run typecheck` script does not exist in this worktree's `package.json`. Build's TypeScript pass is the substitute.
- `npm run test:ci` script does not exist; no test framework installed. Phase 7.3 should consider whether to scaffold vitest before adding tests for primitives.
- Pre-existing lint error (`useDashboardActions.ts:50`) is unrelated to 7.1 — flag for separate cleanup.
- Tailwind v4 token approach: tokens go in `@theme` (auto-emits `:root`) for new tokens; legacy aliases stay in `@theme inline` (var() references).
