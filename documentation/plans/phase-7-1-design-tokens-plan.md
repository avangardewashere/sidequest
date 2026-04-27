# Phase 7.1 — Design Tokens (Plan)

Cycle 7 / Phase 7.1. Companion tracker: `phase-7-1-design-tokens-tracker.md`.

## Goal

Land the Stitch design tokens (colors, type scale, spacing, radii) into the Tailwind v4 theme so subsequent component primitives (Phase 7.3) and pages (Cycle 8) consume a single source of truth. Zinc-themed pages still render identically — this phase is additive, not a rewrite.

## Scope

### In scope

- Extend `src/app/globals.css` `@theme` block with Stitch color, font, spacing, and radius tokens.
- CSS custom properties in `:root` for the shared values (so future inline-style or non-Tailwind contexts can read them).
- Inter font wired through `next/font/google` (currently using Geist Sans).
- One small visual sanity check (a `_dev` page or inline test) showing the tokens render.

### Out of scope (explicit)

- Dark theme — light only this phase. Phase 9.2 may revisit.
- Replacing existing zinc classes anywhere — additive only.
- Component primitives — Phase 7.3.
- Removing Geist fonts entirely — keep them as a fallback until Cycle 8 sweeps them.

## Architecture decisions

1. **Tailwind v4, not v3** — this codebase already uses v4 (`@import "tailwindcss"` + `@theme inline` block). No `tailwind.config.ts` is created.
2. **CSS variables as the source of truth.** `:root` defines them; the `@theme` block exposes them as Tailwind utilities. Allows non-Tailwind code paths (canvas, SVG fills, inline styles) to read them.
3. **Token names mirror Stitch JSON.** `--color-canvas`, `--color-primary`, `--font-display`, `--spacing-stack-md` — exactly the names from the mockups so a designer can grep both worlds.
4. **No removal of existing tokens.** `--background`, `--foreground`, Geist fonts stay. Cycle 9.2 sweeps zinc usages and we'll prune dead tokens then.
5. **Prefix-free.** No `sq-` or `app-` prefix on token names. The Stitch mockups already namespace with `--color-`/`--spacing-`/etc.

## Token catalog

### Colors (light theme)

| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#FAFAF7` | Page background |
| `--color-bg-surface` | `#FFFFFF` | Cards, elevated surfaces |
| `--color-bg-elevated` | `#F5F4EF` | Hover state, subtle elevation |
| `--color-primary` | `#5B5BD6` | Primary brand accent (CTAs, active state) |
| `--color-primary-strong` | `#4241bc` | Pressed primary |
| `--color-primary-subtle` | `#EEEEFB` | Primary tint for badges/backgrounds |
| `--color-ember` | `#9b4513` | Secondary brand (streak, "epic" tier) |
| `--color-ember-subtle` | `#FBEAD9` | Ember tint |
| `--color-text-primary` | `#1A1A17` | Body text |
| `--color-text-secondary` | `#5A5954` | Secondary text |
| `--color-text-tertiary` | `#8E8C85` | Tertiary / placeholders |
| `--color-border-subtle` | `#EDECE6` | Divider, hairline |
| `--color-border-default` | `#D8D6CE` | Input borders |
| `--color-success` | `#15803D` | Completion, success |
| `--color-warning` | `#B45309` | Due-soon, attention |
| `--color-danger` | `#B91C1C` | Destructive, error |
| `--color-info` | `#2563EB` | Informational accent |

### Typography

Single family — Inter — at six scale steps:

| Token | Size / line-height / weight |
|---|---|
| `--text-display` | 28 / 36 / 600, letter-spacing -0.02em |
| `--text-hero-title` | 20 / 28 / 600 |
| `--text-body-primary` | 16 / 24 / 400 |
| `--text-body-secondary` | 14 / 20 / 400 |
| `--text-label-caps` | 12 / 16 / 600, letter-spacing 0.05em |
| `--text-badge-label` | 11 / 14 / 700 |

### Spacing

| Token | Value |
|---|---|
| `--spacing-stack-sm` | 0.5rem |
| `--spacing-stack-md` | 1rem |
| `--spacing-stack-lg` | 1.5rem |
| `--spacing-section-gap` | 2rem |
| `--spacing-gutter` | 1rem |
| `--spacing-container-margin` | 1.5rem |

### Radii

| Token | Value |
|---|---|
| `--radius-sm` | 0.25rem (default) |
| `--radius-lg` | 0.5rem |
| `--radius-xl` | 0.75rem |
| `--radius-full` | 9999px |

## File touch list

### Modified

- `src/app/globals.css` — add token definitions to `:root` and expose via `@theme`. Wire Inter font reference.
- `src/app/layout.tsx` — add Inter via `next/font/google` alongside Geist (Geist stays).

### New

- `src/lib/design-tokens.ts` — TS barrel that re-exports the canonical token values for any non-CSS consumer (canvas drawing, dynamic class building). Single object, frozen.

## Testing

### Visual sanity (no automated test required this phase)

- Boot dev server, open any existing page — confirm zero visual change (Geist still renders, zinc still renders).
- A `__dev` route is added in Phase 7.3 (component primitives); we'll verify token rendering then.

### Automated

- `npm run typecheck` covers the new `design-tokens.ts` export.
- `npm run lint` covers CSS not breaking.
- `npm run build` proves the Tailwind v4 compile still succeeds.

## Acceptance criteria

- New tokens appear in computed styles when inspecting `:root`.
- New Tailwind utilities are usable: `bg-canvas`, `text-text-primary`, `font-display` all compile.
- No existing page renders differently.
- `npm run test:ci`, `typecheck`, `lint`, `build` all green.
- Closeout note added to `documentation/status/progress-summary.md`.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Tailwind v4 syntax surprise | Read `node_modules/next/dist/docs/` (per AGENTS.md) and Tailwind v4 docs before writing the `@theme` block |
| Naming collision with existing `--background` / `--foreground` | Keep both; new tokens are purely additive |
| Inter font flash of unstyled text | Use `next/font/google` `display: 'swap'` and preload |
| Token explosion making Tailwind compile slow | Stitch has ~30 tokens — well within budget |

## Suggested order of operations

1. **Read globals.css carefully** — confirm Tailwind v4 import + `@theme inline` are doing what you expect.
2. **Add `:root` token block** — colors first, then type scale, then spacing, then radii.
3. **Mirror in `@theme`** — each token gets a `--color-X` / `--text-X` / `--spacing-X` / `--radius-X` line.
4. **Wire Inter** — `next/font/google` import in `layout.tsx`, add to `<html>` or `<body>` className.
5. **Create `design-tokens.ts`** — re-export the literal values for non-CSS consumers.
6. **Verify**: `npm run build` then `npm run dev`, eyeball one existing page, check inspector for `:root` values.
7. **Closeout**: tracker checkboxes, progress-summary note, branch + PR.
