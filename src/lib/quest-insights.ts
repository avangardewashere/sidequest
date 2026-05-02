import type { QuestCadence } from "@/types/dashboard";
import type { CompletionHistoryPoint } from "@/lib/cadence";
import { parseUtcDateKey, streakFromLogs, toUtcDateKey } from "@/lib/cadence";
import type { QuestInsightsBestDay, QuestInsightsWeekRow } from "@/types/quest-insights";

const DAY_MS = 24 * 60 * 60 * 1000;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Monday 00:00 UTC of the week containing `dateKey`. */
export function mondayWeekStartUtcFromDateKey(dateKey: string): string {
  const d = parseUtcDateKey(dateKey);
  const dow = d.getUTCDay();
  const mondayOffset = (dow + 6) % 7;
  d.setUTCDate(d.getUTCDate() - mondayOffset);
  return toUtcDateKey(d);
}

export function longestRunOfConsecutiveDays(uniqueSortedDateKeysAsc: string[]): number {
  const sorted = [...new Set(uniqueSortedDateKeysAsc)].sort();
  if (sorted.length === 0) {
    return 0;
  }
  let maxRun = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = parseUtcDateKey(sorted[i - 1]).getTime();
    const cur = parseUtcDateKey(sorted[i]).getTime();
    const diffDays = Math.round((cur - prev) / DAY_MS);
    if (diffDays === 1) {
      run += 1;
      maxRun = Math.max(maxRun, run);
    } else if (diffDays === 0) {
      continue;
    } else {
      run = 1;
    }
  }
  return maxRun;
}

export function bestDayOfWeekFromDates(dateKeys: string[]): QuestInsightsBestDay | null {
  const counts = new Map<number, number>();
  for (const key of dateKeys) {
    const d = parseUtcDateKey(key);
    const day = d.getUTCDay();
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  let bestDay = -1;
  let bestCount = 0;
  for (const [day, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      bestDay = day;
    }
  }
  if (bestDay < 0 || bestCount === 0) {
    return null;
  }
  return {
    day: bestDay,
    label: WEEKDAY_LABELS[bestDay] ?? String(bestDay),
    count: bestCount,
  };
}

type LogRow = { completionDate: string; xpEarned: number };

export function buildWeeklyRows(
  logs: LogRow[],
  cadence: QuestCadence,
  windowWeeks: number,
  todayUtc: Date = new Date(),
): QuestInsightsWeekRow[] {
  const todayKey = toUtcDateKey(todayUtc);
  const endMonday = mondayWeekStartUtcFromDateKey(todayKey);
  const startMondayDate = parseUtcDateKey(endMonday);
  startMondayDate.setUTCDate(startMondayDate.getUTCDate() - (windowWeeks - 1) * 7);

  const byWeek = new Map<string, { completions: number; xpTotal: number }>();
  for (let w = 0; w < windowWeeks; w += 1) {
    const monday = new Date(startMondayDate);
    monday.setUTCDate(monday.getUTCDate() + w * 7);
    const key = toUtcDateKey(monday);
    byWeek.set(key, { completions: 0, xpTotal: 0 });
  }

  for (const log of logs) {
    const ws = mondayWeekStartUtcFromDateKey(log.completionDate);
    const bucket = byWeek.get(ws);
    if (!bucket) {
      continue;
    }
    bucket.completions += 1;
    bucket.xpTotal += log.xpEarned;
  }

  const rows: QuestInsightsWeekRow[] = [];
  for (let w = 0; w < windowWeeks; w += 1) {
    const monday = new Date(startMondayDate);
    monday.setUTCDate(monday.getUTCDate() + w * 7);
    const weekStart = toUtcDateKey(monday);
    const bucket = byWeek.get(weekStart) ?? { completions: 0, xpTotal: 0 };
    const denom = cadence.kind === "weekdays" ? 5 : 7;
    const completionRate = Math.min(1, bucket.completions / Math.max(1, denom));
    rows.push({
      weekStart,
      completions: bucket.completions,
      xpTotal: bucket.xpTotal,
      completionRate: Number(completionRate.toFixed(3)),
    });
  }

  return rows;
}

export function computeQuestInsightStreaks(
  historyPoints: CompletionHistoryPoint[],
  cadence: QuestCadence,
): { currentStreak: number; longestStreak: number } {
  const currentStreak = streakFromLogs(historyPoints, cadence);
  const dates = historyPoints.map((p) => p.completionDate);
  const longestStreak = longestRunOfConsecutiveDays(dates);
  return { currentStreak, longestStreak };
}
