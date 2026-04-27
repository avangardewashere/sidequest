---
name: today-focus-ui-plan
overview: Identify missing features from the design docs and deliver a UI-only Home (Today/Focus) experience first, using client-side mock data and reusable components with no database integration.
todos:
  - id: phase-1-foundation
    content: Build Today/Focus Home shell and shared primitives with mock UI data.
    status: pending
  - id: phase-2-home-interactions
    content: Add presentational interactions and local state for Home controls.
    status: pending
  - id: phase-3-other-shells
    content: Add UI shells for Quest List, Calendar, and Codex using shared primitives.
    status: pending
  - id: phase-4-detail-quickadd
    content: Implement Quest Detail and Quick Add bottom sheet UI.
    status: pending
  - id: phase-5-polish-handoff
    content: Apply responsive polish, accessibility pass, and handoff notes for data integration.
    status: pending
isProject: false
---

# Today/Focus UI-First Plan

## Missing Features vs Current State

From [documentation/status/current-status-architecture.md](documentation/status/current-status-architecture.md), [documentation/reference/design-references/screens.jsx](documentation/reference/design-references/screens.jsx), and [documentation/reference/design-references/sidequest-demo.jsx](documentation/reference/design-references/sidequest-demo.jsx), the app is missing most of the designed Home/TODAY experience:

- Current `/` in [src/app/page.tsx](src/app/page.tsx) is a simple authenticated dashboard with `Quick Actions`, not a task-focused mobile hub.
- Not implemented on Home yet:
  - App bar with date/context + search/menu actions
  - XP hero + segmented progress treatment for gamified mode
  - Stats strip (streak/daily goal/focus time)
  - Main Quest hero card with progress and "Start focus" action
  - Structured sections (`In Progress`, `Today Queue`, `Claimed`)
  - Floating quick-add action button
  - Mobile bottom tab bar shell for `Today/Quests/Calendar/Codex`
- Supporting design primitives shown in [documentation/reference/design-references/screens-a.jsx](documentation/reference/design-references/screens-a.jsx) are not represented as reusable components in `src/components` yet.

## Scope

- Build **Home Today/Focus UI only** for authenticated users.
- Use static/mock client-side data (hardcoded or local constants).
- No API wiring changes, no DB model changes, no route-handler changes.
- Preserve existing auth gate/login surface behavior in [src/app/page.tsx](src/app/page.tsx).

## 5-Phase Roadmap

### Phase 1: Home UI Foundation (Today/Focus)

- Replace authenticated dashboard content in [src/app/page.tsx](src/app/page.tsx) with a reusable Today/Focus UI shell.
- Create Home primitives for:
  - top app bar (`menu`, date/title, `search`) following `AppBar` and `TodayScreen` patterns in [documentation/reference/design-references/sidequest-demo.jsx](documentation/reference/design-references/sidequest-demo.jsx)
  - XP hero and quick stats strip (inspired by `WFXPBar` + stat cards from design references)
  - Main Quest hero card with progress and CTA
  - task rows and section headers for `In Progress`, `Queued`, `Claimed`
  - floating quick-add button and bottom tab bar
- Add strongly typed mock data module for Home sections only.
- Keep all interactions presentational with lightweight no-op handlers or local callbacks.

### Phase 2: Home Presentational Interactions

- Add local state toggles for visual states (active tab, section collapse, selected task highlight).
- Add client-only UI states for focus controls (`start`, `pause`, `resume`) without timers persisted to backend.
- Add empty/loading visual placeholders for each Home section while still using mock data.
- Ensure keyboard and touch behavior is consistent for buttons/chips/fab.

### Phase 3: Adjacent Screen UI Shells

- Build UI-only shells for Quest List, Calendar, and Codex, reusing Home primitives where applicable.
- Keep navigation presentational and route-safe (no API coupling).
- Align visual language (spacing, chips, section framing, bottom nav behavior) across shells.

### Phase 4: Detail + Quick Add UI

- Implement Quest Detail layout with subtasks/progress/focus area.
- Implement Quick Add bottom sheet UI (title capture + parsed chips + actions) as client-only.
- Wire UI transitions between Today, Detail, and Quick Add in a presentational manner.

### Phase 5: Polish + Handoff Readiness

- Responsive refinement for mobile-first and desktop container behavior.
- Accessibility pass (labels, focus states, semantic landmarks, contrast checks).
- Cleanup and codify component contracts so data wiring can replace mock data safely.
- Add handoff notes for future API integration boundaries.

## Refined Phase 1 Execution Plan (Ready To Start)

### Phase 1 Goal

Ship a complete UI-only Home (`Today/Focus`) screen that visually matches the design references and replaces the current authenticated dashboard surface.

### Phase 1 Boundaries

- In scope:
  - authenticated Home (`/`) visual replacement with Today/Focus UI
  - static mock data only
  - reusable UI components under `src/components/home`
- Out of scope:
  - API calls, DB integration, model changes, route-handler changes
  - Quest Detail, Quick Add sheet internals, Calendar/Codex screen builds
  - animation polish beyond basic transitions

### Design Reference Mapping (Source Of Truth)

- Use `TodayScreen` composition and section order from [documentation/reference/design-references/sidequest-demo.jsx](documentation/reference/design-references/sidequest-demo.jsx).
- Match visual intent of:
  - `AppBar` for top navigation/date/title treatment
  - XP hero block behavior in the top section
  - Main Quest hero emphasis and CTA row
  - sectioned task lists plus floating add and bottom tab shell

### Deliverables (End Of Phase 1)

- Authenticated Home route renders Today/Focus experience.
- Componentized Home UI blocks with typed props and typed mock data.
- Existing unauthenticated auth card flow remains unchanged.
- Phase 1 verification checklist completed (type/lint/manual visual checks).

### File Plan (Phase 1)

- Update: [src/app/page.tsx](src/app/page.tsx)
- Add: [src/components/home/today-focus-shell.tsx](src/components/home/today-focus-shell.tsx)
- Add: [src/components/home/today-focus-header.tsx](src/components/home/today-focus-header.tsx)
- Add: [src/components/home/today-focus-xp-stats.tsx](src/components/home/today-focus-xp-stats.tsx)
- Add: [src/components/home/today-focus-main-quest.tsx](src/components/home/today-focus-main-quest.tsx)
- Add: [src/components/home/today-focus-task-row.tsx](src/components/home/today-focus-task-row.tsx)
- Add: [src/components/home/today-focus-task-section.tsx](src/components/home/today-focus-task-section.tsx)
- Add: [src/components/home/today-focus-fab.tsx](src/components/home/today-focus-fab.tsx)
- Add: [src/components/home/today-focus-tab-bar.tsx](src/components/home/today-focus-tab-bar.tsx)
- Add: [src/components/home/today-focus-mock-data.ts](src/components/home/today-focus-mock-data.ts)
- Optional style consolidation: [src/app/globals.css](src/app/globals.css) only if needed for shared tokens/utilities

### Execution Sequence (Ordered)

#### Step 1: Baseline And Data Contracts

- Define and export Home-focused types in [src/components/home/today-focus-mock-data.ts](src/components/home/today-focus-mock-data.ts):
  - `TodayHeaderData`
  - `TodayXpData`
  - `TodayStatItem`
  - `MainQuestData`
  - `TaskMetaItem`
  - `TaskRowData`
  - `TaskSectionData`
  - `TodayTabItem`
- Seed one canonical mock object graph for the full screen.
- Keep mock structure aligned with `sidequest-demo.jsx` section order.

**Checkpoint:** mock module compiles cleanly and can drive all planned components without `any`.

#### Step 2: Primitive Component Build

- Implement [src/components/home/today-focus-header.tsx](src/components/home/today-focus-header.tsx) for top bar/date/title/actions.
- Implement [src/components/home/today-focus-xp-stats.tsx](src/components/home/today-focus-xp-stats.tsx) for XP + stats strip.
- Implement [src/components/home/today-focus-main-quest.tsx](src/components/home/today-focus-main-quest.tsx) for hero task and progress.
- Implement [src/components/home/today-focus-task-row.tsx](src/components/home/today-focus-task-row.tsx) and [src/components/home/today-focus-task-section.tsx](src/components/home/today-focus-task-section.tsx).
- Implement [src/components/home/today-focus-fab.tsx](src/components/home/today-focus-fab.tsx) and [src/components/home/today-focus-tab-bar.tsx](src/components/home/today-focus-tab-bar.tsx).

**Checkpoint:** each component renders from mock props in isolation and supports required variants (`done`, `meta`, `xp`, `priority` where applicable).

#### Step 3: Screen Composition

- Build [src/components/home/today-focus-shell.tsx](src/components/home/today-focus-shell.tsx) to compose:
  - header
  - xp/stats
  - main quest
  - sections (`In Progress`, `Queued`, `Claimed`)
  - FAB
  - tab bar
- Keep interactions presentational (placeholder callbacks, local event handlers only).
- Ensure mobile-first vertical flow with desktop-safe max width/container.

**Checkpoint:** complete Today/Focus surface visible from shell with no broken layout at common viewport widths.

#### Step 4: Route Integration

- Update [src/app/page.tsx](src/app/page.tsx):
  - keep loading and unauthenticated branches unchanged
  - replace current authenticated dashboard block with `TodayFocusShell`
- Keep existing `DashboardNav` references only if intentionally retained; otherwise remove dead imports.

**Checkpoint:** authenticated users land on new Home UI, unauthenticated users still see login/register UI.

#### Step 5: Verification Pass

- Run diagnostics for touched files and resolve introduced issues.
- Manual visual verification against reference sections from [documentation/reference/design-references/sidequest-demo.jsx](documentation/reference/design-references/sidequest-demo.jsx):
  - app bar hierarchy
  - xp/stats grouping
  - main quest visual emphasis
  - task section rhythm
  - anchored FAB + bottom tab bar
- Confirm no backend, API, or model files changed.

**Checkpoint:** Phase 1 acceptance criteria fully satisfied.

### Implementation Notes

- Prefer extracting shared, simple UI primitives first to avoid large `page.tsx` diffs.
- Keep color/token usage aligned with current app variables to reduce theme regressions.
- Add minimal, purposeful comments only for non-obvious composition logic.
- Use predictable naming (`today-focus-*`) so future phases can reuse components.

### Risks And Mitigations (Phase 1)

- Risk: visual mismatch with reference due to token differences.
  - Mitigation: perform side-by-side section-level checks for spacing, hierarchy, and emphasis.
- Risk: `page.tsx` churn introduces auth branch regression.
  - Mitigation: preserve existing branch conditions and only swap authenticated content.
- Risk: component sprawl without stable contracts.
  - Mitigation: centralize data types in mock-data module and keep component props explicit.

### Phase 1 Acceptance Criteria

- Authenticated `/` no longer shows the old `Quick Actions` dashboard.
- Home renders all target blocks using mock data:
  - app bar
  - xp/stats strip
  - main quest hero
  - at least three task sections
  - FAB + bottom tab bar
- Existing auth behavior remains intact for unauthenticated users.
- No backend or DB files are changed.
- Touched files pass lint/type checks.

### Definition Of Done (Phase 1)

- All Phase 1 deliverables are present and validated.
- Home UI implementation is merge-ready without backend coupling.
- Plan is ready to advance directly into Phase 2 without refactoring Phase 1 structure.

## Phase 1 Live Execution Checklist

### A) Setup And Contracts

- [x] Create [src/components/home/today-focus-mock-data.ts](src/components/home/today-focus-mock-data.ts)
- [x] Define and export types:
  - [x] `TodayHeaderData`
  - [x] `TodayXpData`
  - [x] `TodayStatItem`
  - [x] `MainQuestData`
  - [x] `TaskMetaItem`
  - [x] `TaskRowData`
  - [x] `TaskSectionData`
  - [x] `TodayTabItem`
- [x] Seed one canonical `todayFocusMockData` object for full-screen rendering
- [x] Verify no `any` types are used in new Home data contracts

### B) Build Home Primitives

- [x] Create [src/components/home/today-focus-header.tsx](src/components/home/today-focus-header.tsx)
- [x] Create [src/components/home/today-focus-xp-stats.tsx](src/components/home/today-focus-xp-stats.tsx)
- [x] Create [src/components/home/today-focus-main-quest.tsx](src/components/home/today-focus-main-quest.tsx)
- [x] Create [src/components/home/today-focus-task-row.tsx](src/components/home/today-focus-task-row.tsx)
- [x] Create [src/components/home/today-focus-task-section.tsx](src/components/home/today-focus-task-section.tsx)
- [x] Create [src/components/home/today-focus-fab.tsx](src/components/home/today-focus-fab.tsx)
- [x] Create [src/components/home/today-focus-tab-bar.tsx](src/components/home/today-focus-tab-bar.tsx)
- [x] Confirm variants render correctly:
  - [x] done task row
  - [x] task row with `xp`
  - [x] task row with `meta`
  - [x] section with right-side label/counter

### C) Compose Home Screen

- [x] Create [src/components/home/today-focus-shell.tsx](src/components/home/today-focus-shell.tsx)
- [x] Compose sections in this exact order:
  - [x] Header
  - [x] XP + stats strip
  - [x] Main Quest hero
  - [x] `In Progress` section
  - [x] `Queued` section
  - [x] `Claimed` section
  - [x] Floating quick-add button
  - [x] Bottom tab bar
- [x] Keep all actions presentational (no API calls, no DB mutations)
- [x] Validate mobile-first layout and desktop-safe max width behavior

#### Refined Section C Plan (Execution Ready)

**Objective**
- Compose a single reusable `TodayFocusShell` that stitches all Section B primitives together using `todayFocusMockData`, with the exact visual hierarchy from the design references.

**Inputs**
- Data source: [src/components/home/today-focus-mock-data.ts](src/components/home/today-focus-mock-data.ts)
- Primitives:
  - [src/components/home/today-focus-header.tsx](src/components/home/today-focus-header.tsx)
  - [src/components/home/today-focus-xp-stats.tsx](src/components/home/today-focus-xp-stats.tsx)
  - [src/components/home/today-focus-main-quest.tsx](src/components/home/today-focus-main-quest.tsx)
  - [src/components/home/today-focus-task-section.tsx](src/components/home/today-focus-task-section.tsx)
  - [src/components/home/today-focus-fab.tsx](src/components/home/today-focus-fab.tsx)
  - [src/components/home/today-focus-tab-bar.tsx](src/components/home/today-focus-tab-bar.tsx)
- Visual reference: [documentation/reference/design-references/sidequest-demo.jsx](documentation/reference/design-references/sidequest-demo.jsx)

**Implementation Steps**
1. Create [src/components/home/today-focus-shell.tsx](src/components/home/today-focus-shell.tsx) with a mobile-first page wrapper:
   - centered container with safe max width
   - bottom padding reserved for fixed tab bar and FAB
2. Import `todayFocusMockData` and render sections in fixed order:
   - header -> xp/stats -> main quest -> in progress -> queued -> claimed
3. Bind section rendering dynamically:
   - map `todayFocusMockData.sections` into `TodayFocusTaskSection`
   - preserve order from mock data to avoid hardcoded duplication
4. Add presentational handlers only:
   - `onMenuClick`, `onSearchClick`, `onStartFocus`, `onOpenQuest`, `onTaskClick`, `onTabChange`, `onFabClick`
   - handlers are local no-op/log placeholders, no API calls
5. Add fixed anchors:
   - `TodayFocusFab` above tab bar
   - `TodayFocusTabBar` fixed to bottom with active tab defaulted to `today`

**Layout Rules**
- Keep Home shell scrollable while preserving fixed bottom controls.
- Ensure no overlap hides task rows (extra bottom spacing in content area).
- Keep component spacing consistent (`px-4`, section spacing cadence matching current primitives).

**Quality Checks (Section C)**
- Shell compiles without type errors.
- All six content blocks and two anchored controls render.
- Section ordering matches plan and reference.
- No backend imports, route handler imports, or API client calls appear in shell.

**Section C Exit Criteria**
- [x] `today-focus-shell.tsx` exists and fully composes the Home screen.
- [x] Composition uses typed mock data only.
- [x] Interactions remain presentational and local.
- [x] Ready to move directly into Section D route integration.

### D) Integrate With Route

- [x] Update [src/app/page.tsx](src/app/page.tsx) authenticated branch to render `TodayFocusShell`
- [x] Keep loading branch unchanged
- [x] Keep unauthenticated login/register branch unchanged
- [x] Remove obsolete authenticated-dashboard-only imports if no longer needed

#### Refined Section D Plan (Execution Ready)

**Objective**
- Replace only the authenticated Home surface in [src/app/page.tsx](src/app/page.tsx) with `TodayFocusShell`, while preserving existing loading and unauthenticated behavior exactly.

**Target File**
- [src/app/page.tsx](src/app/page.tsx)

**Primary Integration Rule**
- Do not change auth/session branching logic; only swap the JSX returned by the authenticated branch.

**Implementation Steps**
1. Add import:
   - `TodayFocusShell` from [src/components/home/today-focus-shell.tsx](src/components/home/today-focus-shell.tsx)
2. Identify the authenticated return block (currently dashboard header + quick actions content).
3. Replace authenticated block contents with a minimal wrapper that renders `TodayFocusShell`.
4. Keep these branches untouched:
   - loading branch (`status === "loading"`)
   - unauthenticated branch (`!session?.user`)
5. Remove authenticated-only dead imports no longer used after replacement:
   - likely `Link`
   - likely `DashboardNav`
   - likely `signOut`
   - keep `useDashboardActions` only if still required by unauthenticated flow fields
6. Confirm no route changes or navigation side effects are introduced.

**Safeguards**
- Preserve all existing form handlers/inputs used by unauthenticated auth UI.
- Do not alter font setup unless required by lint/type cleanup.
- Do not touch API calls, hooks, or auth config in this section.

**Quality Checks (Section D)**
- [src/app/page.tsx](src/app/page.tsx) compiles with no unused imports.
- Loading and unauthenticated states render as before.
- Authenticated state renders `TodayFocusShell`.
- No files under `src/app/api`, `src/lib/db.ts`, or `src/models` are changed.

**Section D Exit Criteria**
- [x] Authenticated branch of `/` renders `TodayFocusShell`.
- [x] Loading branch remains unchanged in behavior.
- [x] Unauthenticated branch remains unchanged in behavior.
- [x] `page.tsx` has no introduced lint/type errors.
- [x] Ready to proceed to Section E validation checklist.

### E) Validate Before Sign-Off

- [x] Run diagnostics/lint for touched files
- [x] Fix introduced type/lint issues
- [ ] Visual QA against [documentation/reference/design-references/sidequest-demo.jsx](documentation/reference/design-references/sidequest-demo.jsx):
  - [ ] top app bar hierarchy
  - [ ] xp/stats grouping
  - [ ] main quest emphasis and CTA
  - [ ] section spacing rhythm
  - [ ] FAB + tab bar anchoring
- [x] Confirm no backend/API/model files changed

#### Refined Section E Plan (Execution Ready)

**Objective**
- Validate that Phase 1 is functionally stable, visually aligned with references, and still isolated from backend/data-layer changes.

**Validation Scope**
- Core files:
  - [src/app/page.tsx](src/app/page.tsx)
  - [src/components/home/today-focus-shell.tsx](src/components/home/today-focus-shell.tsx)
  - [src/components/home/today-focus-header.tsx](src/components/home/today-focus-header.tsx)
  - [src/components/home/today-focus-xp-stats.tsx](src/components/home/today-focus-xp-stats.tsx)
  - [src/components/home/today-focus-main-quest.tsx](src/components/home/today-focus-main-quest.tsx)
  - [src/components/home/today-focus-task-row.tsx](src/components/home/today-focus-task-row.tsx)
  - [src/components/home/today-focus-task-section.tsx](src/components/home/today-focus-task-section.tsx)
  - [src/components/home/today-focus-fab.tsx](src/components/home/today-focus-fab.tsx)
  - [src/components/home/today-focus-tab-bar.tsx](src/components/home/today-focus-tab-bar.tsx)
  - [src/components/home/today-focus-mock-data.ts](src/components/home/today-focus-mock-data.ts)
- Visual reference:
  - [documentation/reference/design-references/sidequest-demo.jsx](documentation/reference/design-references/sidequest-demo.jsx)

**Execution Steps**
1. **Static quality pass**
   - Run lints/diagnostics for all touched Home files.
   - Resolve unused imports, dead code, and type issues.
2. **Branch behavior validation**
   - Verify loading branch still renders for `status === "loading"`.
   - Verify unauthenticated branch still renders login/register surface.
   - Verify authenticated branch renders `TodayFocusShell`.
3. **Visual parity checks (manual)**
   - Confirm top app bar hierarchy (day/date/title/actions).
   - Confirm XP block and stats strip grouping and spacing.
   - Confirm Main Quest visual prominence and CTA arrangement.
   - Confirm section rhythm (`In Progress`, `Queued`, `Claimed`) and row readability.
   - Confirm FAB placement and tab bar anchoring without overlap.
4. **Layout sanity checks**
   - Validate narrow mobile viewport behavior.
   - Validate desktop-safe centered layout (`max width`) and scroll behavior.
5. **Boundary audit**
   - Confirm no backend/API/model files were changed in this phase.
   - Confirm no accidental data fetching was introduced in Home components.

**Evidence To Capture During Validation**
- Lint status: clean for touched files.
- File diff scope: includes only `src/app/page.tsx`, `src/components/home/*`, and documentation updates.
- Visual notes for any mismatches vs reference (if found), with follow-up fixes queued before Phase 1 sign-off.

**Section E Exit Criteria**
- [x] No lint/type errors in touched Home files.
- [x] Loading/unauthenticated/authenticated route behavior validated.
- [ ] Manual visual checks completed for all five focus areas.
- [ ] Responsive checks completed for mobile + desktop container behavior.
- [x] No backend/API/model-layer changes included.
- [ ] Ready to check all Section F Phase 1 exit gate items.

### F) Phase 1 Exit Gate

- [ ] Authenticated `/` shows new Today/Focus UI
- [ ] Unauthenticated `/` still shows existing auth surface
- [ ] All Phase 1 acceptance criteria are met
- [ ] Ready to start Phase 2 without rework

## UI Composition Flow

```mermaid
flowchart TD
  homePage[src_app_page_tsx] --> authGate[AuthGate]
  authGate -->|unauthenticated| loginCard[ExistingLoginRegisterCard]
  authGate -->|authenticated| todayShell[TodayFocusShell]
  todayShell --> topHeader[TopHeader_Date_Actions]
  todayShell --> xpStats[XPHero_StatsStrip]
  todayShell --> mainQuest[MainQuestCard]
  todayShell --> questSections[InProgress_Queued_Claimed]
  todayShell --> quickAdd[FAB_QuickAdd]
  todayShell --> tabBar[BottomTabBar]
```

## Acceptance Criteria

- Phase 1 acceptance criteria are met.
- Remaining phases have clear scope and dependencies to execute sequentially.

## Next Features After This

- Execute Phase 1 implementation.
- After Phase 1 sign-off, begin Phase 2 presentational interaction states.
