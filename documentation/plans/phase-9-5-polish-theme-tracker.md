# Phase 9.5 — Tracker

| Slice | Status | Notes |
|-------|--------|-------|
| Kickoff docs | Done | This plan + tracker |
| Dark tokens (`prefers-color-scheme`) | Done | `:root` dark overrides in `globals.css` |
| Zinc / legacy token sweep (priority surfaces) | Done | Semantic tokens on Home / Stats / auth |
| Micro-animations (streak / ring / milestone toast) | Done | `StreakFlame`, `ProgressRing`, complete toasts |
| Empty states | Done | `EmptyState` + list / weekly wiring |
| Stop `isDaily` writes (queries keep legacy read path) | Done | `buildDailyQuestSet`, `dailies` route, indexes |
| CI gates | Done | `test:ci`, typecheck, lint, build |

## Manual smoke checklist

- [ ] OS dark mode: Home, Stats, login card readable; no invisible borders/text.
- [ ] Complete a habit at streak 7/14/30/100 (or mock): milestone toast copy appears when API awards bonus.
- [ ] Empty quest filters: friendly empty panel + reset path.
- [ ] `/review/weekly` loads with placeholder stats copy when ranges are sparse.
