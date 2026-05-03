import { toUtcDateKey } from "@/lib/cadence";
import { mondayWeekStartUtcFromDateKey } from "@/lib/quest-insights";
import { addUtcDaysToDateKey } from "@/lib/streak-freeze";

export function currentWeekMondayUtcKey(now: Date): string {
  return mondayWeekStartUtcFromDateKey(toUtcDateKey(now));
}

export function previousWeekMondayUtcKey(weekStartMonday: string): string {
  return addUtcDaysToDateKey(weekStartMonday, -7);
}

/** True when `now` is Monday in UTC (for weekly reflection callout). */
export function isUtcMonday(now: Date): boolean {
  return now.getUTCDay() === 1;
}

/** First non-empty line up to ~140 chars for previews. */
export function reflectionPreview(text: string, maxLen = 140): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  const line = trimmed.split(/\r?\n/).find((l) => l.trim().length > 0) ?? trimmed;
  return line.length <= maxLen ? line : `${line.slice(0, maxLen - 1)}…`;
}
