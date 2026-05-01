import { levelFromTotalXp } from "@/lib/xp";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function normalizeToUtcDate(timestamp: Date): Date {
  return new Date(
    Date.UTC(
      timestamp.getUTCFullYear(),
      timestamp.getUTCMonth(),
      timestamp.getUTCDate(),
    ),
  );
}

export function getNextStreak(currentStreak: number, lastCompletedAt?: Date | null) {
  if (!lastCompletedAt) {
    return 1;
  }

  const today = normalizeToUtcDate(new Date());
  const previous = normalizeToUtcDate(lastCompletedAt);
  const diffDays = Math.floor((today.getTime() - previous.getTime()) / DAY_IN_MS);

  if (diffDays <= 0) {
    return currentStreak;
  }

  if (diffDays === 1) {
    return currentStreak + 1;
  }

  return 1;
}

export function applyQuestCompletion(params: {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: Date | null;
  xpGained: number;
}) {
  const updatedXp = params.totalXp + params.xpGained;
  const nextStreak = getNextStreak(params.currentStreak, params.lastCompletedAt);
  const updatedLevel = levelFromTotalXp(updatedXp);
  const longestStreak = Math.max(params.longestStreak, nextStreak);

  return {
    totalXp: updatedXp,
    level: updatedLevel,
    currentStreak: nextStreak,
    longestStreak,
    lastCompletedAt: new Date(),
  };
}

export const STREAK_MILESTONE_BONUS: Record<number, number> = {
  3: 15,
  7: 40,
  14: 100,
};

export function getMilestoneBonus(streak: number): number | null {
  return STREAK_MILESTONE_BONUS[streak] ?? null;
}

/** Next streak when completing at `at`, given prior streak anchored at `lastAt` (any quest). */
export function nextStreakInChain(
  currentStreak: number,
  lastAt: Date | null,
  at: Date,
): number {
  if (!lastAt) {
    return 1;
  }
  const prev = normalizeToUtcDate(lastAt);
  const cur = normalizeToUtcDate(at);
  const diffDays = Math.floor((cur.getTime() - prev.getTime()) / DAY_IN_MS);
  if (diffDays <= 0) {
    return currentStreak;
  }
  if (diffDays === 1) {
    return currentStreak + 1;
  }
  return 1;
}

/** Rebuild global streak profile from completion logs (ascending by time). Used after removing a log (undo). */
export function replayStreakFromCompletionLogs(
  logs: { completedAt: Date | string }[],
): { currentStreak: number; longestStreak: number; lastCompletedAt: Date | null } {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );
  let currentStreak = 0;
  let longestStreak = 0;
  let lastCompletedAt: Date | null = null;
  for (const log of sorted) {
    const at = log.completedAt instanceof Date ? log.completedAt : new Date(log.completedAt);
    currentStreak = nextStreakInChain(currentStreak, lastCompletedAt, at);
    longestStreak = Math.max(longestStreak, currentStreak);
    lastCompletedAt = at;
  }
  return { currentStreak, longestStreak, lastCompletedAt };
}
