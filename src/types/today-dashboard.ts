import type { Profile, Quest } from "@/types/dashboard";

/**
 * Mock → API source map for Today/Focus (`TodayFocusMockData` in today-focus-mock-data.ts).
 * Phase 1.1 only ships the raw snapshot; UI mapping happens in later phases.
 *
 * | Mock key    | Data source (future mapping)                                      |
 * |-------------|-------------------------------------------------------------------|
 * | header      | Mostly `new Date()` + static copy (Phase 1.2)                     |
 * | xp          | `profile`: level, xpIntoLevel, xpForNextLevel; role label TBD     |
 * | stats       | Derived counts / streak / focus time — not in raw snapshot        |
 * | mainQuest   | Heuristic from `activeQuests` / `dailies` (Phase 1.2+)           |
 * | sections    | Built from `activeQuests` + filters (Phase 1.3)                   |
 * | tabs        | Static shell labels — local only                                  |
 */

/** Progression API profile; includes optional `email` from GET /api/progression. */
export type ProgressionProfile = Profile & {
  email?: string;
};

/** JSON body shape for GET /api/dailies. */
export type DailiesApiResponse = {
  dailyKey: string;
  dailies: Quest[];
};

/** One habit row for Today home (Phase 8.3). */
export type TodayHabitSurfaceRow = {
  quest: Quest;
  streak: number;
  completedTodayUtc: boolean;
};

/** Server-built habit + capture slices for the Today home. */
export type TodayHabitSurfacePayload = {
  habitsDue: TodayHabitSurfaceRow[];
  atRisk: TodayHabitSurfaceRow[];
  captured: Quest[];
};

export const emptyTodayHabitSurface: TodayHabitSurfacePayload = {
  habitsDue: [],
  atRisk: [],
  captured: [],
};

/**
 * Aggregated client bundle for the authenticated home (Cycle 1 Phase 1.1).
 * Each leg may be empty if that request failed; callers map to UI in later phases.
 */
export type TodayDashboardSnapshot = {
  profile: ProgressionProfile | null;
  activeQuests: Quest[];
  dailies: Quest[];
  dailyKey: string | null;
  focusMinutesLast7d: number;
  /** Present when `GET /api/today/habit-surface` succeeds; otherwise treat as empty buckets. */
  habitSurface: TodayHabitSurfacePayload;
};
