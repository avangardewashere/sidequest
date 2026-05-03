import type mongoose from "mongoose";
import type { ClientSession } from "mongoose";
import { normalizeToUtcDate } from "@/lib/progression";
import { parseUtcDateKey, toUtcDateKey } from "@/lib/cadence";
import { mondayWeekStartUtcFromDateKey } from "@/lib/quest-insights";
import { StreakFreezeLogModel } from "@/models/StreakFreezeLog";

const DAY_MS = 24 * 60 * 60 * 1000;
const RECOVER_WINDOW_MS = 48 * 60 * 60 * 1000;

export function addUtcDaysToDateKey(dateKey: string, deltaDays: number): string {
  const d = parseUtcDateKey(dateKey);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return toUtcDateKey(d);
}

/** Calendar-day gap between two UTC date keys (non-negative). */
export function utcDateKeysGapDays(aKey: string, bKey: string): number {
  const a = parseUtcDateKey(aKey).getTime();
  const b = parseUtcDateKey(bKey).getTime();
  return Math.floor((b - a) / DAY_MS);
}

/**
 * If global streak would skip exactly one UTC day (diffDays === 2), grace can bridge.
 * Returns effective `lastCompletedAt` for streak progression (yesterday UTC midnight).
 */
export function graceAdjustedLastCompletedAt(params: {
  lastCompletedAt: Date | null | undefined;
  streakGraceEnabled: boolean;
  streakGraceWeekUtc: string | null | undefined;
  now: Date;
}): { effectiveLastCompletedAt: Date | null; consumeGraceWeek: string | null } {
  const { lastCompletedAt, streakGraceEnabled, streakGraceWeekUtc, now } = params;
  if (!lastCompletedAt || !streakGraceEnabled) {
    return { effectiveLastCompletedAt: lastCompletedAt ?? null, consumeGraceWeek: null };
  }
  const todayKey = toUtcDateKey(now);
  const thisWeekMonday = mondayWeekStartUtcFromDateKey(todayKey);
  if (streakGraceWeekUtc === thisWeekMonday) {
    return { effectiveLastCompletedAt: lastCompletedAt, consumeGraceWeek: null };
  }
  const todayNorm = normalizeToUtcDate(now);
  const lastNorm = normalizeToUtcDate(lastCompletedAt);
  const diffDays = Math.floor((todayNorm.getTime() - lastNorm.getTime()) / DAY_MS);
  if (diffDays !== 2) {
    return { effectiveLastCompletedAt: lastCompletedAt, consumeGraceWeek: null };
  }
  const yesterdayKey = addUtcDaysToDateKey(todayKey, -1);
  return {
    effectiveLastCompletedAt: parseUtcDateKey(yesterdayKey),
    consumeGraceWeek: thisWeekMonday,
  };
}

export function isRecoverWindowOpen(missedDateKey: string, now: Date): boolean {
  const start = parseUtcDateKey(missedDateKey).getTime();
  return now.getTime() < start + RECOVER_WINDOW_MS;
}

export type RecoverEligibility =
  | { ok: true; missedDateKey: string }
  | { ok: false; reason: string };

/**
 * Eligible when: last habit activity was two UTC days before today (so yesterday was missed),
 * and we are still inside 48h after midnight UTC of the missed day, and that day is "yesterday".
 */
export function evaluateHabitStreakRecover(args: {
  lastCompletedDate: string | null | undefined;
  now: Date;
}): RecoverEligibility {
  const { lastCompletedDate, now } = args;
  const todayKey = toUtcDateKey(now);
  const yesterdayKey = addUtcDaysToDateKey(todayKey, -1);
  const twoDaysAgoKey = addUtcDaysToDateKey(todayKey, -2);
  if (!lastCompletedDate) {
    return { ok: false, reason: "no_last_completion" };
  }
  if (lastCompletedDate !== twoDaysAgoKey) {
    return { ok: false, reason: "not_single_day_gap" };
  }
  if (!isRecoverWindowOpen(yesterdayKey, now)) {
    return { ok: false, reason: "window_closed" };
  }
  return { ok: true, missedDateKey: yesterdayKey };
}

export async function countStreakFreezeBalance(
  userId: mongoose.Types.ObjectId | string,
  session?: ClientSession | null,
): Promise<number> {
  const grantQ = StreakFreezeLogModel.countDocuments({ userId, kind: "grant" });
  const spendQ = StreakFreezeLogModel.countDocuments({ userId, kind: "spend" });
  const [grants, spends] = await Promise.all([
    session ? grantQ.session(session) : grantQ,
    session ? spendQ.session(session) : spendQ,
  ]);
  return Math.max(0, grants - spends);
}
