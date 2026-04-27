# Cycles 4-6 Plan — Post-Ship Roadmap

Drafted 2026-04-25 (Cycle 3 closeout day) for a full focus day starting 2026-04-26.

## Where this picks up

Cycle 3 is closed. Per `documentation/status/progress-summary.md`:

- Authenticated `/` is the live Today/Focus shell powered by `useTodayDashboard`.
- `/stats` is wired to `/api/metrics/summary` with KPIs, range switching, and three core charts.
- Resilience layer landed: error boundaries, toasts, offline banner, loading boundaries.
- Open placeholders: real focus-time source, bottom tab routing behavior, stats `FOCUS` strip.
- Test, perf, and deploy hardening checks all green; project is ship-ready.

These three cycles take the app from "ship-ready" to "actually engaging long-term and distributable."

## Tomorrow's focus (single-day starting block)

If you only do one phase tomorrow, do **Phase 4.1 — Real focus-time pipeline**. It kills the biggest known placeholder, unlocks Phase 4.2 (Pomodoro), and gives `/stats` its missing third dimension. Time-box it: 2 hours backend, 2 hours hook + UI, 1 hour tests, 30 min polish.

If the day goes well, push into 4.2 and 4.3 — they share the same surface area and momentum compounds.

---

## Cycle 4 — Engagement Depth

> Theme: fill the placeholder gaps and deepen the gameplay loop.

### Phase 4.1 — Real focus-time pipeline

Replaces the `FOCUS` placeholder in the stats strip and unlocks Pomodoro.

1. **`FocusSession` model** — `userId`, `questId?`, `startedAt`, `endedAt?`, `durationSec`. Indexes: `(userId, startedAt -1)`, `(userId, endedAt)` partial where `endedAt` exists.
2. **`POST /api/focus/start` and `POST /api/focus/stop`** — auth-gated, idempotent (auto-close any open session for that user before starting a new one).
3. **`useFocusTimer()` hook** — owns running/paused state, ticks via `requestAnimationFrame`, syncs to API on stop and on `visibilitychange`.
4. **Wire into `/api/metrics/summary` + stats strip** — sum 7d focus minutes, render in the strip in place of the placeholder.

### Phase 4.2 — Pomodoro mode UI

1. **Timer drawer on the active main quest** — 25/5 default, configurable.
2. **Cycle-end notification** — in-app toast + browser Notification API if permitted.
3. **Auto-attach focus session to active quest** — passes `questId` to `/api/focus/start`.
4. **Focus-XP boost** — small bonus (e.g., +5 XP per completed 25-min cycle) recorded as `xpBonusSource: 'focus'` on `CompletionLog` extension or a sibling log.

### Phase 4.3 — Bottom tab routing (kill presentational stub)

1. **Real route switching** — `Today` `/`, `Quests` `/quests/view`, `Stats` `/stats`, `You` `/you`.
2. **Active-tab indicator from `usePathname()`** — no client state needed.
3. **Persist last-tab on cold open** — read `sessionStorage` on `/`, soft-redirect once.
4. **Prefetch on hover/focus** — use `next/link` `prefetch` so cold navigation feels instant.

### Phase 4.4 — "You" tab and settings

1. **`/you` route** — profile card, level/streak summary, inventory teaser.
2. **Profile editing** — `displayName`, email change with confirmation step.
3. **Change password flow** — current + new + confirm, bcrypt re-hash server-side.
4. **Theme picker entry point** — exposes the toggle that Phase 5.6 expands.

### Phase 4.5 — Onboarding for new accounts

1. **First-run detection** — `quests.length === 0 && !onboardingCompletedAt` on User.
2. **3-step coach overlay** — create / complete / streak, dismissable, persisted.
3. **Seed example quest** — non-daily, easy, deletable, on first registration.
4. **`onboardingCompletedAt` on User** — set on first dismiss or first quest completion, whichever comes first.

### Phase 4.6 — Notifications and reminders

1. **Browser notification opt-in** — request permission from `/you`, store grant state.
2. **Daily-quest reminder** — user-chosen local time, scheduled via service worker (foundation for PWA in 6.1).
3. **Streak-in-danger evening nudge** — if current streak >= 3 and no completion yet today after 8pm local.
4. **Notification preferences UI** — granular toggles in `/you`.

---

## Cycle 5 — Personalization & Customization

> Theme: make the app feel like the user's, not a template.

### Phase 5.1 — Custom categories and tags

1. **User-scoped categories** — replace fixed enum with a `Category` collection per user; seed the existing 5 on registration.
2. **Tags array on Quest** — multi, freeform, capped at e.g. 6 per quest.
3. **Filter and sort by tag** — extend `/quests/view` filters.
4. **Top-tag insight** — new chart on `/stats` showing tag distribution + completion rate.

### Phase 5.2 — Recurring quests beyond dailies

1. **`recurrence` field** — `{ kind: 'daily' | 'weekly' | 'custom', days?: number[] }`.
2. **Materialization on completion** — when a recurring quest is completed, server creates the next instance with the right `dueDate`.
3. **UI controls** — recurrence picker in create + edit forms.
4. **Recurrence badge** — distinct from daily badge on quest rows.

### Phase 5.3 — Goals (multi-quest grouping)

1. **`Goal` model** — `title`, `targetXp` or `targetCount`, `dueDate`, `questIds: ObjectId[]`.
2. **Aggregated progress** — derived from member quests, surfaced as a progress bar.
3. **Active-goals widget on Today shell** — top 1-2 goals with progress.
4. **Completion ceremony** — full-screen celebration on 100%, logged to a new `GoalCompletionLog`.

### Phase 5.4 — Streak freeze tokens

1. **Award a token at every 14-day milestone** — extend `MilestoneRewardLog` payload or add `StreakFreezeLedger`.
2. **Auto-apply on missed-day detection** — at next completion, if `daysMissed === 1` and `tokens >= 1`, consume one and preserve the streak.
3. **Inventory in `/you`** — token count + earn history.
4. **Optional manual-apply prompt** — toast offers freeze instead of reset on first completion after a miss.

### Phase 5.5 — Achievements and badges

1. **`Achievement` model + seeded definitions** — first-quest, 7-streak, 14-streak, 100-XP, 1000-XP, 50 completions, etc.
2. **Server-side check on relevant events** — wrap the completion transaction so unlocks are atomic with XP.
3. **Achievement gallery in `/you`** — locked vs unlocked grid with descriptions.
4. **Unlock toast + animation** — reuse celebration animation primitive from Cycle 3.

### Phase 5.6 — Theme and appearance polish

1. **Light / dark / system toggle** — persisted on User.
2. **Accent color palette** — 4 options; CSS variable-based to avoid Tailwind class explosion.
3. **Density toggle** — comfortable / compact, controls list row paddings.
4. **Typography scale** — default / large for accessibility.

---

## Cycle 6 — Platform & Distribution

> Theme: PWA, account hygiene, data portability, ship publicly.

### Phase 6.1 — PWA installability

1. **Web manifest** — name, icons (192 + 512), theme color, display=standalone.
2. **Service worker** — app-shell cache + stale-while-revalidate for `GET` API calls.
3. **Install prompt banner** — uses `beforeinstallprompt`, dismissable, remembers dismissal for 30d.
4. **Lighthouse PWA score >= 90** — codify as CI check.

### Phase 6.2 — Real offline mode

1. **Mutation queue** — IndexedDB-backed; complete/create operations queued while offline.
2. **Replay on reconnect** — flush queue when `navigator.onLine` returns; surface progress.
3. **Sync-state indicator** — small badge near the offline banner.
4. **Conflict policy** — server wins; surface a non-blocking warning when a queued mutation is rejected.

### Phase 6.3 — Account self-service

1. **Password reset** — token email via NextAuth Email provider, time-limited.
2. **Account deletion** — soft-delete + 30-day grace + permanent purge job.
3. **Sessions list and revoke** — list active JWTs (jti tracked in a `Session` collection) with per-session revoke.
4. **2FA (TOTP)** — opt-in, `speakeasy`/`otplib`-style, recovery codes.

### Phase 6.4 — Data portability

1. **`GET /api/export`** — NDJSON of user's quests, completions, milestone logs, focus sessions.
2. **`POST /api/import`** — idempotent merge keyed on stable IDs; rejects unknown user data.
3. **UI in `/you`** — download button + import file picker.
4. **Optional weekly self-email summary** — opt-in, single-table HTML email.

### Phase 6.5 — Year-in-review and long-window analytics

1. **Yearly stats endpoint** — bucketed completion count by week, month-over-month XP delta.
2. **Shareable card image** — canvas-rendered PNG with totals + top category + longest streak.
3. **Recap page** — accessible from `/stats`, scrolling sections.
4. **Confetti easter egg** — on every 1000 XP threshold the user passes inside the recap.

### Phase 6.6 — Ship and monitor

1. **Production deploy** — Vercel + custom domain + env hardening.
2. **Error reporting** — Sentry (or similar), wired through error boundaries with user-id scrubbing.
3. **Uptime + status page** — simple ping monitor + a static `/status` summary.
4. **Privacy + terms pages** — static MDX, linked from footer; required before public launch.

---

## How to use this plan

- **Per phase**: branch as `cycle-N/phase-N.M-slug`, write the plan-doc + tracker-doc pair you've used in prior cycles, ship via PR, log in `documentation/status/progress-summary.md`.
- **Definition of done per phase**: green CI (`test:ci`, `typecheck`, `lint`, `build`), updated checklist, manual sign-off note in the cycle's tracker, no new placeholders introduced.
- **Cadence target**: ~1 cycle per week running solo at a comfortable pace; faster if you front-load Cycle 4.

## Suggested ordering for tomorrow specifically

1. Phase 4.1 first — backend → hook → UI → tests, in that order.
2. Spike Phase 4.3 once 4.1 is in: it's small, mostly routing plumbing, and unlocks the "You" surface for Phase 4.4.
3. End the day with the Phase 4.1 closeout note in `documentation/status/progress-summary.md` so Cycle 4 has a paper trail from day one.
