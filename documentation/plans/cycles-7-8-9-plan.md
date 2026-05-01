# Cycles 7-8-9 Plan — Quest, Habit & Second-Brain Pivot

Drafted 2026-04-27. Refined 2026-04-29 to a habit + second-brain framing with 6 phases per cycle.
Replaces the Cycle 6 (PWA + portability + monitoring) work as the active roadmap. Cycle 6 documentation stays parked; revisit after Cycle 9 ships.

## Mental model

SideQuest is three apps in one quest UI:

1. **A todo system** — one-off quests with a deadline. Complete once, log XP, done.
2. **A habit tracker** — recurring quests with cadence, per-quest streaks, completion history, progressions.
3. **A second brain** — every quest carries durable context: tags, notes (journal entries), and links to related quests. Quick capture from anywhere goes into an inbox.

The unit of intent is **the quest**. Whether it's a one-off task, a daily habit, or a meta-goal, the schema, page, and form are the same — they just light up different sections of the UI based on `cadence`. This keeps the mental model simple for the user and the codebase narrow for us.

## Why we pivoted from Cycle 6

The quest tab has been carrying raw Tailwind defaults with no design tokens, no component library, and no quest hierarchy. The Edit form in particular is visually broken (cramped layout, duplicated quest title, mismatched buttons, faint placeholder text). Three Stitch design mockups (Drawer / Map / Web) gave us a viable visual target. Cycle 6 work — PWA monitoring, data export, year-in-review — is valuable but doesn't address the *thing the user looks at every day*. Cycle 9 keeps the minimum PWA shell so the redesign feels appy on install. Full Cycle 6 returns post-9.

## Mockup direction

**Map Mobile** as base (bottom-nav, hierarchical hero card + sibling/child rails). Cherry-picks freely:
- From **Web**: collapsible parent-context strip; "EPIC TIER" difficulty badge; metric meta strip.
- From **Drawer**: inline "add sub-task" composer; minimal hero card variant for leaf quests.
- **Skipped**: comments, assignees, campaignId concept, the literal "Map" and "Guild" tabs, FAB on detail page.
- **Added beyond mockups**: tag chips, embedded notes, capture FAB, calendar heatmap for habits.

## Data model evolution (cumulative)

| Field | Lands in | Notes |
|---|---|---|
| `parentQuestId` | 7.2 ✓ | nullable, 2-level cap, daily-parent disallowed |
| `cadence` | 7.3 | `{ kind, daysOfWeek?, everyNDays? }`; default `oneoff` for back-compat |
| `lastCompletedDate` | 7.3 | denormalized UTC date string for cheap streak math |
| `tags` | 7.4 | `string[]`, normalized lowercase, max 8, length-capped |
| `notes` | 7.4 | embedded array `{ id, body, createdAt }`, max 50, body ≤ 4kB |
| `links` | 7.4 | embedded array `{ questId, kind: 'related' \| 'blocks' \| 'depends-on' }` (UI lands 8.6) |
| `order` | 9.2 | child ordering integer |

**`CompletionLog` shape change** (7.3): add `completionDate` (UTC date string), drop unique `(questId, userId)`, add unique `(questId, userId, completionDate)` so habits log once per cadence period. Backfill from `completedAt`.

**`isDaily`** is deprecated in favor of `cadence.kind === 'daily'`. Read paths normalize both during transition; new writes only use `cadence`. Removal scheduled for Cycle 9.5 sweep.

---

## Cycle 7 — Foundation: Habit & Second-Brain Schema + Primitives

> Theme: tokens, schema, primitives. No user-visible redesign yet.

### Phase 7.1 — Design tokens ✓ DONE

Stitch tokens in `globals.css` via Tailwind v4 `@theme`. Inter font wired. Light theme only — dark deferred to 9.5. See `phase-7-1-design-tokens-tracker.md`.

### Phase 7.2 — Quest hierarchy schema (parentQuestId, 2-level cap) ✓ DONE

`parentQuestId` field, indexes, pre-save validator (2-level cap + daily-parent disallow), `POST/GET /api/quests/[id]/children` routes, selector helpers `withChildren` / `siblingsOf`, contract tests. See `phase-7-2-schema-migration-parent-quest-tracker.md`.

### Phase 7.3 — Habit cadence + completion history (4 days)

Status: done (see `phase-7-3-habit-cadence-completion-history-tracker.md`).

Make a quest a habit by giving it a cadence and allowing many completions over time.

- Schema: add `cadence` to Quest with discriminated kinds (`oneoff` / `daily` / `weekdays` / `weekly` / `custom`), `daysOfWeek?: number[]`, `everyNDays?: number`. Default `{ kind: 'oneoff' }`.
- Schema: add `lastCompletedDate` (UTC date string `YYYY-MM-DD`) on Quest for cheap streak queries.
- `CompletionLog` migration: add `completionDate` field; replace unique `(questId, userId)` with unique `(questId, userId, completionDate)`; backfill `completionDate = formatUTCDate(completedAt)`.
- Behavior: completing a habit inserts a new `CompletionLog`, updates `lastCompletedDate`, awards XP — does NOT transition Quest.status to `completed`. Completing a one-off keeps the existing terminal-state behavior.
- New helpers: `src/lib/cadence.ts` — `isDueToday(quest, today)`, `expectedDateForCadence(quest, date)`, `streakFromLogs(logs, cadence)`.
- New endpoint: `GET /api/quests/[id]/history?days=N` returning `{ completions: { date, xp }[] }` for the heatmap.
- Tests for cadence math (boundary cases: timezone DST, weekly resets), migration idempotency, completion-log uniqueness.

### Phase 7.4 — Tags, notes & links schema (3 days)

Status: done (schema, routes, helper, and quality gates complete).

Second-brain context attaches to every quest. Implementation now, UI in 8.x.

- Schema: `tags: string[]` (max 8, normalized lowercase trimmed, length 1-32 each).
- Schema: `notes: { id: ObjectId, body: string, createdAt: Date }[]` embedded (max 50, body ≤ 4kB).
- Schema: `links: { questId: ObjectId, kind: 'related' | 'blocks' | 'depends-on' }[]` embedded (max 32; reciprocal write deferred to 8.6).
- Routes: `PATCH /api/quests/[id]/tags`, `POST /api/quests/[id]/notes`, `PATCH /api/quests/[id]/notes/[noteId]`, `DELETE /api/quests/[id]/notes/[noteId]`, `POST /api/quests/[id]/links`, `DELETE /api/quests/[id]/links/[linkId]`.
- Validation: tags pass through a normalizer that dedupes + lowercases; notes body sanitized (markdown-allowed, no HTML); links reject self-reference and reject if either side is missing.
- New helper: `src/lib/quest-tags.ts` — `normalizeTags(input)`, `userTagSuggestions(userId, prefix)` for the form autocomplete in 8.4.
- Tests: tag normalizer edge cases, note-body length limits, link self-reference and orphan handling.

### Phase 7.5 — Core UI primitives (4 days)

Status: done (see `phase-7-5-core-ui-primitives-plan.md` + `phase-7-5-core-ui-primitives-tracker.md`).

Pure components. No business logic. Built in `src/components/ui/`.

- `Button` (variants: primary / secondary / ghost / destructive; sizes: sm / md / lg).
- `Card` (variants: surface / elevated; with optional accent border).
- `Badge` (variants: difficulty / status / cadence / tier; semantic color via tokens).
- `ProgressRing` (SVG, accepts pct + size + label slot).
- `TaskRow` (checkbox + title + meta slots; complete/incomplete states).
- `FormField` (label + control + helper text + error).
- `Sheet` / `Drawer` (bottom sheet on mobile, side drawer on desktop; used by capture in 8.5 and inline composer in 8.2).
- `BottomNav` (4-slot, active indicator from `usePathname`).
- Dev harness page at `src/app/_dev/components/page.tsx` for visual review.

### Phase 7.6 — Habit & capture primitives (4 days)

Status: next up (starts after 7.5 primitive layer; see roadmap checklist below).

Habit-and-second-brain-specific UI atoms. Still no business logic — these consume props and emit events.

- `StreakFlame` — animated flame + streak number; pulses at milestone thresholds (7, 14, 30, 100).
- `CalendarHeatmap` — GitHub-style 7×N grid; consumes `{ date, intensity }[]`; click emits date.
- `CadencePicker` — radio (oneoff/daily/weekdays/weekly/custom) + day-of-week multi-select + "every N days" stepper.
- `HabitChip` — pill showing cadence + current streak inline (used on list rows).
- `TagChip` — interactive tag pill (label, dismiss button optional, color variant by hash for visual diversity).
- `TagInput` — multi-tag input with autocomplete + create-on-enter.
- `NoteCard` — timestamp header + body (markdown rendered) + edit/delete actions.
- `LinkPicker` — autocomplete-style picker for "link to another quest" (consumes search results from 8.6 endpoints; degrades to "no results" if 8.6 not yet shipped).

---

## Cycle 8 — Quest tab redesign + habit experience + second-brain capture

> Theme: the user-facing transformation. Replace the ugly quest pages, add habit + capture surfaces.

### Phase 8.1 — Quest list redesign (Habits / Todos / All) (4 days)

Rewrite `src/app/quests/view/page.tsx` using new primitives. Three-tab top section: **Habits** (cadence != 'oneoff'), **Todos** (cadence == 'oneoff'), **All**. Top-level only by default (`parentQuestId: null`); child count badge on rows that have children. Habits show `StreakFlame` and `HabitChip` inline; todos show due date. Sticky filter bar (category, tag, status). Tag chips render inline and are clickable to filter.

### Phase 8.2 — Quest detail page (5 days)

Create `src/app/quests/[id]/page.tsx` (new route). Sections, ordered:

1. Hero card: title, description, difficulty badge, due date OR cadence chip, `ProgressRing` for parent quests (children completion %) OR `StreakFlame` for habits.
2. `CalendarHeatmap` of last 90 days when habit; hidden for one-offs.
3. Child quests list with inline composer (Drawer-style).
4. Tags row (clickable to filter list).
5. Notes section (chronological journal feed; add-note composer at bottom).
6. Linked quests rail (rendered if `links.length > 0` or backrefs exist).
7. Collapsible parent-context strip + horizontal sibling rail when nested.
8. **Undo completion** — after a mistaken complete, the user can undo: **one-off** quests return to `active` with XP rolled back to match removal of the terminal completion; **habits** remove the completion for a selected UTC calendar day (delete matching `CompletionLog`, recompute `lastCompletedDate` / streak from remaining logs). Expose a clear control on the detail hero (and document parity rules for list-row quick-complete vs detail-only undo in implementation).

### Phase 8.3 — Today surface: habits due, at-risk streaks (3 days)

Augment the existing home (`/`) Today shell:

- "Habits due today" section: rows with quick-tick completion, streak flame, cadence chip.
- "At-risk streaks" callout when a habit hasn't been completed today and current streak >= 3.
- "Captured this week" condensed list of recent inbox items (cadence='oneoff', no tags) prompting the user to triage.
- Existing Today/Focus shell content stays; new sections inserted above it.
- `useTodayDashboard` hook extended to surface today's habit list + at-risk + recent captures.

### Phase 8.4 — Quest/habit form redesign (4 days)

Single `<QuestForm>` for create + edit, replacing the current cramped form.

- Title + description (rich enough for a one-line habit).
- `CadencePicker` (the field that flips a quest between todo and habit).
- Difficulty selector.
- Category dropdown (kept until tags fully replace it in a later cycle).
- `TagInput` with autocomplete from user's existing tags.
- Notes inline editor (one note inline at create; full notes section at edit).
- "Type quest title to enable delete" pattern, properly styled with a destructive `Button`.
- Validates: cadence type, daysOfWeek required when `kind='custom'`, tags normalized, notes length capped.
- Form is a controlled component; submission goes through existing API + new `7.4` endpoints.

### Phase 8.5 — Bottom nav + Capture FAB (4 days)

Replace `dashboard-nav.tsx` with a mobile-first bottom nav:

- 4 tabs: **Today** (`/`), **Quests** (`/quests/view`), **Stats** (`/stats`), **Profile** (`/profile` — new stub holding logout, theme toggle later).
- Top app-bar carries title + secondary actions (search, settings).
- Persistent **Capture FAB** above the bottom nav: opens a `Sheet` with a fast quick-add (title + tags only). Submission posts to `/api/quests` with `cadence='oneoff'` and no due date — these are inbox items the user triages later.
- FAB hides on `/quests/[id]` detail (where its own composer takes over) and on auth pages.

### Phase 8.6 — Search + cross-linking (4 days)

Make the second brain searchable.

- `GET /api/quests/search?q=...&kind=tag|title|note` — Mongo text-or-regex search across title, tag exact match, and note body. Paginated.
- Search bar in top app-bar (Cmd-K to open globally).
- Inside `QuestForm` and `QuestDetail`, the `LinkPicker` consumes the search endpoint to find quests to link.
- Detail page gets a "Linked from N quests" backref rail rendered from a server query that finds quests with `links.questId === currentId`.
- Tags clicked anywhere in the app deep-link to `/quests/view?tag=X`.

---

## Cycle 9 — Progressions, Insights & Polish

> Theme: turn the data into insight, harden cascade rules, polish the design system end-to-end, ship a minimum PWA shell.

### Phase 9.1 — Cascade & XP integrity (3 days)

- Completing a parent prompts "complete N children?" (default no).
- Deleting a parent prompts re-parent vs cascade-delete.
- XP rule: parents with children no longer carry their own XP — XP rolls up from leaves. Activates on first child added; existing XP preserved on parents that never gain a child.
- Habit XP rule: each completion log awards XP per the cadence rate (no per-streak-day double-counting; streak bonuses come through `MilestoneRewardLog`).

### Phase 9.2 — Habit progressions & insights (4 days)

- Per-quest analytics surface inside detail page: completion rate over time, best day of week, longest vs current streak, XP per week.
- Stats page additions: top habits by streak, aggregated completion heatmap across all habits, weekly XP trend line.
- New endpoint: `GET /api/quests/[id]/insights` returning a typed payload consumed by detail + stats.
- Add `order: number` field on Quest for manual child ordering (up/down buttons; drag-reorder still deferred).

### Phase 9.3 — Streak resilience (3 days)

- Streak freeze tokens (existing `MilestoneRewardLog` extended with `kind: 'streak-freeze'`; user balance derived).
- Grace-day policy: opt-in setting allowing 1 missed cadence period per week without breaking the streak.
- "Recover streak" UX after a miss: prompt the user to spend a token within 24h to keep the streak.
- New endpoint: `POST /api/quests/[id]/streak/recover` — validates token balance, rewrites streak, logs the spend.

### Phase 9.4 — Reflection layer & weekly review (3 days)

- Weekly review surface (Sunday default, configurable): prompt user with "what went well / didn't / next week" — answers stored as a special `note.kind = 'reflection'`.
- Reflection feed inside detail page filterable from notes section.
- New route: `/review/weekly` — single-page review flow with prefilled stats from the prior week.
- Reflection notes feed into the `8.3` Today surface as "last week's takeaways" callout on Mondays.

### Phase 9.5 — Polish, animations, dark theme, sweep (4 days)

- Micro-animations: confetti on milestone completions, flame pulse on streak threshold crossings, ring fill on parent-quest progress changes.
- Empty-state copy + lightweight illustrations across list / detail / today / stats / profile.
- Dark theme tokens added (matches system pref initially; toggle in profile later).
- Sweep zinc remnants from Home / Stats / auth pages — full design-token migration. Remove dead `--background`/`--foreground` legacy tokens after the sweep is verified.
- Remove deprecated `isDaily` writes; reads continue to normalize during a deprecation window.

### Phase 9.6 — PWA shell minimum (3 days)

- `public/manifest.json` with name/short_name/icons (192/512/maskable)/theme_color/display=standalone.
- Viewport + theme-color meta in `layout.tsx`.
- Service worker (`public/sw.js`) registered via a client component on mount; app-shell precache + stale-while-revalidate for `GET /api/*`.
- Install prompt banner using `beforeinstallprompt`, dismissable, persists dismissal for 30 days.
- Lighthouse PWA score >= 90 as a verifiable manual check (CI integration deferred to a later cycle).

---

## Sequencing rules

1. **7.1, 7.2 done**. 7.3 starts next.
2. **7.4 (tags/notes) can run parallel to 7.3** — disjoint schema fields, no migration overlap.
3. **7.5 (core primitives) can start as soon as 7.1 closeout** — does not depend on 7.3/7.4.
4. **7.6 (habit primitives) depends on 7.5** — `HabitChip` reuses `Badge`, `CalendarHeatmap` may reuse `Card`.
5. **8.1 (list)** depends on 7.3 (cadence to split tabs) + 7.5 (primitives).
6. **8.2 (detail)** depends on 7.3 + 7.4 + 7.5 + 7.6.
7. **8.3 (today)** depends on 8.1 (list helpers used to compute "habits due") + 7.6 (StreakFlame).
8. **8.4 (form)** can run parallel to 8.2.
9. **8.5 (bottom nav + capture)** ships LAST in Cycle 8 to avoid mid-cycle nav churn.
10. **8.6 (search + linking)** depends on 7.4 (tags/notes/links exist) and benefits from 8.5 being live (Cmd-K from app-bar).
11. **9.1 cascade** must precede **9.2 insights** (XP rules drive insight math).
12. **9.3 streak resilience** depends on 7.3 cadence/streak math being stable.
13. **9.4 reflection layer** depends on 7.4 notes existing.
14. **9.5 polish + 9.6 PWA** can run in parallel; 9.5 is a sweep, 9.6 is additive.

## Definition of done per phase

Same as cycles 4-5-6: green CI (`test:ci`, `typecheck`, `lint`, `build`), updated phase tracker, closeout note in `documentation/status/progress-summary.md`, no new placeholders introduced. Each phase gets its own `phase-X-Y-{slug}-plan.md` + `phase-X-Y-{slug}-tracker.md` pair, drafted just-in-time when the prior phase closes (avoids stale plans).

## Risks & deferred items

- **Cycle 6 entirely deferred**: PWA monitoring, Sentry, /api/health, legal pages, data export, year-in-review. Phase 9.6 is a minimum slice; the rest returns post-9.
- **Migration risk in 7.3** — `CompletionLog` unique-index swap requires a backfill ahead of the new index. Plan: write migration script that backfills `completionDate` first, then drop old index, then add new. Keep idempotent.
- **`isDaily` deprecation** spans cycles. Reads normalize across both shapes through 9.5; writes stop using `isDaily` in 7.3.
- **Embedded notes/links arrays** can grow if a user is prolific. Caps at 50 / 32 are early guardrails; if a power user hits the cap, promote to a separate collection in a future cycle.
- **Search endpoint** in 8.6 starts as title + tag + note body via Mongo `$text` index; if performance lags, swap to a typesense/atlas-search backend in a follow-up.
- **Capture FAB inbox drift** — captured items pile up if the user doesn't triage. Mitigation: 8.3 surface "captured this week" prompt; 9.4 weekly review forces triage.
- **Backwards compat during dual styling era** (Cycles 7-8) — zinc-themed Home/Stats pages coexist with redesigned tokens. Swept in 9.5.

## Suggested ordering for the next sprint

Now that 7.1 and 7.2 are done:

1. **7.3 first** — habit cadence + completion history. This is the schema lever that makes the rest of Cycle 7-8 possible.
2. **7.4 in parallel** — tags/notes/links schema. Disjoint from 7.3, fast.
3. **7.5 next** — primitives so 7.6 has Card/Badge/Sheet to compose on.
4. **7.6 closes Cycle 7** — habit + capture primitives ready for Cycle 8 to consume.

### Execution lane lock (to avoid drift)

- **Backend lane (7.3 first):** cadence schema + CompletionLog migration + completion behavior split + history endpoint.
- **Schema context lane (7.4):** starts only after 7.3 migration contract is frozen (can run parallel once frozen).
- **UI primitives lane (7.5 -> 7.6):** can progress in parallel, independent from 7.3 migration internals.
- **Cycle 8 implementation gate:** no 8.x execution starts until 7.3 start-gates are approved and tracked.

Total: ~15-18 days for Cycle 7. Cycles 8 and 9 estimated similarly. The whole pivot is roughly 2 months of focused solo work; faster if 7.3/7.4 and 7.5 truly run in parallel.
