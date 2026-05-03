# Phase 9.3 — Streak resilience

Companion tracker: `phase-9-3-streak-resilience-tracker.md`.

## Design locks

### Token storage (Option B)

Separate **`StreakFreezeLog`** collection (`grant` | `spend`) so [`MilestoneRewardLog`](../../src/models/MilestoneRewardLog.ts) milestone XP semantics and unique `(userId, streakMilestone)` stay unchanged.

### Grants

One freeze token granted whenever the user earns a **new** global streak milestone bonus XP (same moments as [`getMilestoneBonus`](../../src/lib/progression.ts) in complete flow).

### Grace week (UTC)

User preference **`streakGraceEnabled`**. When completing any quest, if the global streak would reset because `lastCompletedAt` is **exactly two UTC calendar days** before today (skipped yesterday only), and grace is enabled and `streakGraceWeekUtc` !== this ISO week’s Monday (UTC), treat streak as **consecutive** (as if last completion were yesterday UTC). Then set `streakGraceWeekUtc` to this week’s Monday.

### Recover semantics

- **Eligible** when: habit quest; `quest.lastCompletedDate` equals **two days ago** UTC (relative to today); no `CompletionLog` for **yesterday** for this quest; freeze balance ≥ 1; within **48 hours** after UTC midnight of the missed day (missed day = yesterday → window ends 48h after that midnight).

- **Effect:** insert `CompletionLog` for **yesterday** with `xpEarned: 0` (streak continuity only), append `spend` freeze log, set `quest.lastCompletedDate` to the latest completion date from logs, rebuild global user streak via [`replayStreakFromCompletionLogs`](../../src/lib/progression.ts) from all user completion logs.

### Timezone

All date keys use existing UTC helpers ([`toUtcDateKey`](../../src/lib/cadence.ts)).
