# Cycles 7-8-9 Plan — Quest Tab Redesign Pivot

Drafted 2026-04-27. Replaces the Cycle 6 (PWA + portability + monitoring) work as the active roadmap. Cycle 6 documentation stays parked; revisit after Cycle 9 ships.

## Why we pivoted

The quest tab — the app's centerpiece — has been carrying raw Tailwind defaults with no design tokens, no component library, and no quest hierarchy. The Edit form in particular is visually broken (cramped layout, duplicated quest title, mismatched buttons, faint placeholder text). Three Stitch design mockups (Drawer / Map / Web) gave us a viable visual target. Cycle 6 work — PWA monitoring, data export, year-in-review — is valuable but doesn't address the *thing the user looks at every day*.

Cycle 9 keeps the minimum PWA shell from Cycle 6.1 so the redesign feels appy on install. Full Cycle 6 returns once 9 closes.

## Mockup direction

**Map Mobile** as base (bottom-nav, hierarchical hero card + sibling/child rails). Cherry-picks freely from the other two:

- From **Web**: collapsible parent-context strip; "EPIC TIER" difficulty badge; metric meta strip (due / sub-task count).
- From **Drawer**: inline "add sub-task" composer; minimal hero card variant for leaf quests.
- **Skipped**: tags, comments, assignees, campaignId, FAB on detail page, the "Map" and "Guild" tabs.

## Data model direction

Single field: `parentQuestId` on the existing `Quest` model. **2-level cap** — sub-tasks ARE quests but cannot themselves have children. Keeps `CompletionLog`, XP pipeline, and streak rules untouched. Progress % is computed (children completed / total), not stored. Easy to lift the cap later.

---

## Cycle 7 — Foundation (no user-visible redesign)

> Theme: tokens, schema, primitives. Lays the floor for Cycle 8's visible redesign.

### Phase 7.1 — Design tokens (3 days)

Stitch tokens land in `globals.css` via Tailwind v4's `@theme` directive (no `tailwind.config.ts` — this is Tailwind v4). Coexists with existing zinc classes; no visual regression.

- Colors: `canvas #FAFAF7`, `primary #5B5BD6`, `ember #9b4513`, neutral scale, semantic (success/warning/danger/info).
- Type scale: `display`, `hero-title`, `body-primary`, `body-secondary`, `label-caps`, `badge-label`.
- Spacing: `stack-sm/md/lg`, `section-gap`, `gutter`, `container-margin`.
- Radii: default / lg / xl / full.

### Phase 7.2 — Schema migration: parentQuestId (3 days)

- Add nullable indexed `parentQuestId` to `src/models/Quest.ts`. Compound index `{ createdBy, parentQuestId, status }`.
- 2-level cap enforced in pre-save validator + Zod schemas + dedicated `POST /api/quests/[id]/children` route.
- `GET /api/quests/[id]/children`. Extend `quest-selectors.ts` with `withChildren`, `siblingsOf`.
- `isDaily=true` parents disallowed in form validation.
- Cascade on parent complete/delete deferred to Phase 9.1.

### Phase 7.3 — Component primitives (4 days)

`src/components/ui/`: `Button`, `Card`, `Badge` (difficulty/status variants), `ProgressRing` (SVG), `TaskRow` (checkbox + title + meta), `FormField`, `BottomNav`. Pure primitives — no business logic.

Dev harness page at `src/app/_dev/components/page.tsx` for visual review.

---

## Cycle 8 — Quest tab redesign (the visible pivot)

> Theme: replace the ugly quest pages with the new design system + new hierarchy.

### Phase 8.1 — Quest list redesign (3 days)

Rewrite `src/app/quests/view/page.tsx` using new primitives. Card-based, top-level only by default (`parentQuestId: null`), child count badge, expand-to-reveal. Sticky filter bar.

### Phase 8.2 — Quest detail page (5 days)

Create `src/app/quests/[id]/page.tsx` — new route, doesn't exist today. Hero card with ProgressRing, child quests list with inline composer, collapsible parent-context strip + horizontal sibling rail when nested.

### Phase 8.3 — Quest form redesign (3 days)

Refactor create/edit pages around a shared `<QuestForm>`. Replace `window.confirm()` delete with the "type quest title to enable delete" pattern, properly styled.

### Phase 8.4 — Bottom nav rework (2 days)

Replace `dashboard-nav.tsx` dropdown with mobile-first `BottomNav` (Quests / Stats / Profile). Top app-bar carries title + actions. Logout moves to a stub `/profile` page.

---

## Cycle 9 — Polish & hierarchy depth

> Theme: cascade rules, XP integrity, sweep stale styling, minimum PWA shell.

### Phase 9.1 — Cascade & XP integrity (3 days)

- Completing a parent prompts "complete N children?" (default no).
- Deleting a parent prompts re-parent vs delete-cascade.
- XP rule: parents with children no longer carry their own XP — XP rolls up from leaves. Activates on first child added.

### Phase 9.2 — Detail polish (3 days)

Add `order` field for manual child ordering (up/down buttons; drag-reorder deferred). Empty-state copy + micro-animations on completion. Sweep zinc remnants from Home/Stats pages.

### Phase 9.3 — PWA shell minimum (3 days)

`manifest.json` + app icons + viewport meta + service worker registration. Minimum slice from Cycle 6.1; rest of Cycle 6 returns post-9.

---

## Sequencing

1. 7.1 tokens precede ALL UI primitives.
2. 7.1 and 7.2 can run in parallel.
3. 8.x waits on 7.2 schema deployment.
4. 8.1 list → 8.2 detail (navigation entry).
5. 8.3 form runs parallel to 8.2.
6. 8.4 nav ships LAST in Cycle 8 to avoid mid-cycle churn.
7. 9.1 cascade precedes 9.2 polish.
8. 9.3 PWA shell independent of 9.1/9.2.

## Definition of done per phase

Same as cycles 4-5-6: green CI (`test:ci`, `typecheck`, `lint`, `build`), updated phase tracker, closeout note in `documentation/status/progress-summary.md`, no new placeholders introduced.
