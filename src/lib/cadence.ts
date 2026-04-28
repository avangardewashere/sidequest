import type { QuestCadence, QuestCadenceKind } from "@/types/dashboard";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type LooseQuestCadence = {
  kind: QuestCadenceKind;
  daysOfWeek?: number[] | null;
  everyNDays?: number | null;
};

export type CadenceQuestLike = {
  cadence?: LooseQuestCadence | null;
  isDaily?: boolean | null;
  lastCompletedDate?: string | null;
};

export type CompletionHistoryPoint = {
  completionDate: string;
  xpEarned: number;
};

export function toUtcDateKey(timestamp: Date): string {
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, "0");
  const day = String(timestamp.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseUtcDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map((value) => Number(value));
  return new Date(Date.UTC(year, month - 1, day));
}

export function normalizeQuestCadence(quest: CadenceQuestLike): QuestCadence {
  if (quest.cadence?.kind) {
    return {
      ...quest.cadence,
      daysOfWeek: quest.cadence.daysOfWeek ?? undefined,
      everyNDays: quest.cadence.everyNDays ?? undefined,
    };
  }
  if (quest.isDaily) {
    return { kind: "daily" };
  }
  return { kind: "oneoff" };
}

export function expectedDateForCadence(cadence: QuestCadence, date: Date): string {
  const utcKey = toUtcDateKey(date);
  if (cadence.kind === "oneoff") {
    return utcKey;
  }
  if (cadence.kind === "daily" || cadence.kind === "weekdays" || cadence.kind === "weekly") {
    return utcKey;
  }

  // For custom cadence, the day key still anchors completion uniqueness daily;
  // due/every-N logic is evaluated in isDueToday.
  return utcKey;
}

export function isDueToday(quest: CadenceQuestLike, today: Date = new Date()): boolean {
  const cadence = normalizeQuestCadence(quest);
  const todayKey = toUtcDateKey(today);

  if (cadence.kind === "oneoff") {
    return true;
  }

  if (cadence.kind === "daily") {
    return quest.lastCompletedDate !== todayKey;
  }

  const dayOfWeek = today.getUTCDay();

  if (cadence.kind === "weekdays") {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (cadence.kind === "weekly" || cadence.kind === "custom") {
    let dayMatches = true;
    if (cadence.daysOfWeek && cadence.daysOfWeek.length > 0) {
      dayMatches = cadence.daysOfWeek.includes(dayOfWeek);
    }

    if (cadence.kind === "custom" && cadence.everyNDays && quest.lastCompletedDate) {
      const last = parseUtcDateKey(quest.lastCompletedDate);
      const todayUtc = parseUtcDateKey(todayKey);
      const diffDays = Math.floor((todayUtc.getTime() - last.getTime()) / DAY_IN_MS);
      return dayMatches && diffDays >= cadence.everyNDays;
    }

    return dayMatches;
  }
  return true;
}

export function streakFromLogs(logs: CompletionHistoryPoint[], cadence: QuestCadence): number {
  if (logs.length === 0) {
    return 0;
  }

  const sorted = [...logs].sort((a, b) => b.completionDate.localeCompare(a.completionDate));
  if (cadence.kind === "oneoff") {
    return Math.min(sorted.length, 1);
  }

  let streak = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    const current = parseUtcDateKey(sorted[index - 1].completionDate);
    const previous = parseUtcDateKey(sorted[index].completionDate);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / DAY_IN_MS);
    if (diffDays <= 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function isHabitCadence(kind: QuestCadenceKind): boolean {
  return kind !== "oneoff";
}
