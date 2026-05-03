# Phase 9.4 — Reflection layer & weekly review (design locks)

## Storage

- **Weekly prompts (global):** Dedicated collection **`WeeklyReflection`** with `userId`, `weekStartUtc` (UTC Monday `YYYY-MM-DD`, aligned with `mondayWeekStartUtcFromDateKey`), three text fields (`wentWell`, `didntGoWell`, `nextWeekFocus`), `updatedAt`. Unique compound index `(userId, weekStartUtc)`. Idempotent upsert per week.
- **Quest-scoped reflections:** Embedded **`Quest.notes[].kind`**: `note` | `reflection` (default `note`). Used for per-quest reflection feed on detail.

## Week boundaries

- **Reflection keys:** ISO-style UTC weeks starting **Monday 00:00 UTC** (same as insights).
- **Rolling stats** on `GET /api/review/weekly`: unchanged (last 7 UTC days from today), distinct from reflection week grid.

## Today callout

- On **UTC Monday** only, if a **`WeeklyReflection`** exists for **`previousWeekMondayUtc(currentMonday)`**, habit-surface returns **`mondayReflectionCallout`** with short preview + link target `/review/weekly`.

## Routes

- **`GET /api/review/weekly`:** stats + `reflectionWeekStartUtc`, `currentWeekReflection`, `priorWeekReflection`.
- **`POST /api/review/weekly`:** body optional `weekStartUtc` (defaults current Monday); three strings (trim, max 4000).
