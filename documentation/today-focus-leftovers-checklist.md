# Today/Focus Leftovers Checklist

This checklist tracks the remaining items from `documentation/today-focus-ui-plan.md` (Section E exit criteria and Section F exit gate) before moving to the next phase.

## Source Reference

- `documentation/today-focus-ui-plan.md` (lines 438-451)
- `documentation/Design References/color analysis colorscheme.md`

## Remaining Items To Close

### Section E Exit Criteria (Execution-Ready)

**Goal:** Close Section E with evidence-backed manual QA: each focus area has a clear pass condition, comparison anchors, and a place to record findings under **Issues** before Section F.

#### E.0 Preconditions

- [x] Dev server running; note the URL (e.g. `http://localhost:3000` or `http://localhost:3001` if the port is taken).
- [x] Two ways to test auth: **authenticated** session and **unauthenticated** (incognito or signed out).
- [x] References available (optional but recommended):
  - `documentation/Design References/sidequest-demo.jsx` (Today / header + composition)
  - `documentation/Design References/color analysis colorscheme.md` (paper, indigo CTA, ember accent, text tiers)

#### E.1 Manual visual checks (five focus areas)

For each area: **Pass** = matches intent below and no obvious contrast/layout break. **Fail** = log under **Issues** with screenshot + one-line repro + viewport.

- [x] **E.1.1 Top app bar hierarchy**
  - [x] Open authenticated `/`.
  - [x] Verify order and weight: day/date line reads as **secondary**; title reads as **primary**; menu and search read as controls (not body text).
  - [x] Compare to demo: `AppBar` / header region in `sidequest-demo.jsx` (date above title, actions on the right).
  - [x] **Pass if:** hierarchy matches reference; no clipped text at narrow width (360px).

- [x] **E.1.2 XP + stats grouping**
  - [x] XP block reads as one **card** on `--color-bg-surface` with subtle border; track uses **primary-subtle** fill + **primary** progress.
  - [x] Stats row: three tiles share one rhythm (padding, border, label size); values are readable at a glance.
  - [x] Cross-check color doc: stats strip uses surface + subtle border; labels use tertiary/secondary as intended.
  - [x] **Pass if:** grouping is obvious; no “floating” tiles; streak row does not fight the XP bar for attention.

- [x] **E.1.3 Main quest emphasis + CTA**
  - [x] Hero card reads as **primary surface** with clear border; **ember left accent** (3px) visible per color spec.
  - [x] “Main Quest” eyebrow uses **secondary-strong** (readable ember text), not decorative orange on tiny text.
  - [x] XP chip uses **primary-subtle** bg + **primary** text; CTA uses **primary** fill + **primary-on-accent** label.
  - [x] Secondary button (Open) is visibly **secondary** to CTA (outline/neutral), not competing.
  - [x] **Pass if:** CTA is the strongest interactive element; hero is unmistakably the focal card.

- [x] **E.1.4 Section spacing rhythm**
  - [x] Scroll full page: spacing between **Header → XP → Main quest → sections** feels consistent (no random tight/loose jumps).
  - [x] Section headers: label + optional right label align; uppercase rhythm matches reference.
  - [x] Task rows: done vs active states are distinguishable (opacity/strike + tertiary where expected).
  - [x] **Pass if:** scan from top to bottom feels like one system, not stacked unrelated panels.

- [x] **E.1.5 FAB + bottom tab bar anchoring**
  - [x] Scroll to bottom: last section content is **not hidden** behind tab bar or FAB (padding / safe area).
  - [x] FAB sits above tab bar, not overlapping it; tap targets do not overlap.
  - [x] Active tab state is obvious (primary fill vs inactive tertiary).
  - [x] **Pass if:** no overlap at 360px and 390px widths; keyboard tab order still reaches tab buttons and FAB.

- [x] **E.1 Summary:** All five areas **Pass** → tick parent item: “Manual visual checks completed for all five focus areas”.

#### E.2 Responsive checks (mobile + desktop)

Use DevTools device toolbar or a real device. Record viewport in **Issues** if anything fails.

- [x] **E.2.1 Mobile — 360×800**
  - [x] No horizontal scroll unless intentional.
  - [x] Long titles wrap or truncate without breaking layout.
  - [x] FAB + tab bar do not obscure content (see E.1.5).

- [x] **E.2.2 Mobile — 390×844**
  - [x] Smoke pass E.1.1–E.1.5: hierarchy, grouping, hero, rhythm, anchors.

- [x] **E.2.3 Desktop — ≥1280 width**
  - [x] Content stays within intended max width (`max-w-md` shell); page does not look stretched or misaligned.
  - [x] Fixed tab bar spans full width while content stays centered — confirm it looks intentional, not broken.

- [x] **E.2.4 Optional: prefers-color-scheme dark**
  - [x] Quick smoke: body text still readable; note any invisible pairs (full dark polish is future work).

- [x] **E.2 Summary:** All required viewports **Pass** → tick: “Responsive checks completed for mobile + desktop container behavior”.

#### E.3 Handoff to Section F

- [x] If any E.1/E.2 item **failed**, add under **Issues**: viewport, route (`/`), expected vs observed, severity (blocker / non-blocker), suggested fix (UI/CSS).
- [x] If all **passed**, tick: **Ready to check all Section F Phase 1 exit gate items** and run Section F below.

**Section E parent checklist (tick when E.1–E.3 done)**

- [x] Manual visual checks completed for all five focus areas (E.1)
- [x] Responsive checks completed for mobile + desktop container behavior (E.2)
- [x] Ready to check all Section F Phase 1 exit gate items (E.3)

### Section F Phase 1 Exit Gate (Open)

- [x] Authenticated `/` shows new Today/Focus UI
- [x] Unauthenticated `/` still shows existing auth surface
- [x] All Phase 1 acceptance criteria are met
- [x] Ready to start Phase 2 without rework

## Execution Notes

- Keep this checklist focused on **verification/sign-off** only.
- No new feature scope should be added here.
- If any check fails, record under **Issues** using the template below before marking the parent checkbox complete.
- Work through **E.0 → E.1 → E.2 → E.3** in order; do not tick Section F until Section E is fully closed.

## Issues

Use one bullet per issue:

- `[E.x.x] Viewport: … | Route: … | Expected: … | Observed: … | Severity: blocker|non-blocker | Fix: …`

- None recorded after closeout QA pass.

## Sign-Off Summary

- Status: `Closed - Section E/F complete`
- Reviewer: USER
- Date: 2026-04-25
- Notes:
  - 2026-04-25 — Home shell wired to APIs (XP bar, header date, sections, complete checkbox, quick-add). Section E checkboxes above are intentionally **not** bulk-ticked here; record findings under **Issues** as you run them.
  - Phase 1.2 hero acceptance criteria:
    - Hero must render live `profile.level`, `profile.xpIntoLevel`, `profile.xpForNextLevel` values via mappers.
    - Header + XP region must show skeleton during cold load (`isLoading && !data && !error`).
    - XP bar width transition must animate on value change (target ~500-600ms ease-out).
    - On fetch error, UI must show usable values (session/local cached snapshot when available, otherwise safe placeholder values).
  - 2026-04-25 validation log:
    - Automated checks passed: `vitest` (Phase 1.2 tests), `eslint`.
    - Added tests for session cache-first load and local last-known fallback on network failure.
    - Manual browser QA for E.1/E.2 remains pending and should be completed before final sign-off.
  - 2026-04-25 Phase 1.3 (solo quest list) updates:
    - Added explicit home quest sort mode `priority_due` (`difficulty` priority, then `dueDate` ascending with nulls last, then XP/createdAt tie-breakers).
    - Home list loading now includes a 3-row task skeleton in addition to header/XP skeleton.
    - In-progress empty state CTA text aligned to plan: `No quests forged yet — start your first one ->`.
    - Task row edit navigation remains `/quests/[id]/edit` for both list rows and main quest open action.
  - Cycle 1 post-1.3 review checklist:
    - Functional smoke: hero loads, list order follows `priority_due`, edit navigation works, empty-state CTA points to quick-add.
    - State transitions: list skeleton appears on cold load; cached fallback remains active when network fails; optimistic completion remains stable.
    - Quality gates: run `npm run test`, `npm run lint`, `npm run typecheck` before moving to Phase 1.4.
  - Closeout decision:
    - Cycle 1 is closed with implementation + QA evidence; no blocker remains in the checklist.
    - Intentional deferrals: stats charts (Cycle 2), deeper tab routing behavior, and advanced celebration/toast polish.
  - 2026-04-25 E2E coverage expansion:
    - Added `e2e/cycle1-home.spec.ts` with mocked Cycle 1 home flows:
      - home render and solo queue order expectations
      - 3-row list skeleton on cold load
      - task row edit-route navigation
      - optimistic completion + quick-add flow
      - local cache fallback rendering when network fails
