import mongoose from "mongoose";
import { CompletionLogModel } from "@/models/CompletionLog";
import { longestRunOfConsecutiveDays, mondayWeekStartUtcFromDateKey } from "@/lib/quest-insights";

export type HabitTopRow = { questId: string; title: string; streak: number };

/** Habit quests: cadence other than one-off, or legacy isDaily. */
const habitQuestMatch = {
  $or: [{ "q.cadence.kind": { $in: ["daily", "weekdays", "weekly", "custom"] as const } }, { "q.isDaily": true }],
};

export async function aggregateHabitCompletionsByDay(
  userObjectId: mongoose.Types.ObjectId,
  since: Date,
): Promise<Map<string, number>> {
  const rows = await CompletionLogModel.aggregate<{ _id: string; value: number }>([
    { $match: { userId: userObjectId, completedAt: { $gte: since } } },
    {
      $lookup: {
        from: "quests",
        localField: "questId",
        foreignField: "_id",
        as: "q",
      },
    },
    { $unwind: "$q" },
    {
      $match: {
        "q.createdBy": userObjectId,
        ...habitQuestMatch,
      },
    },
    { $group: { _id: "$completionDate", value: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return new Map(rows.map((r) => [r._id, r.value]));
}

export async function aggregateTopHabitsByStreak(
  userObjectId: mongoose.Types.ObjectId,
  since: Date,
  limit: number,
): Promise<HabitTopRow[]> {
  const rows = await CompletionLogModel.aggregate<{
    _id: mongoose.Types.ObjectId;
    dates: string[];
    title: string;
  }>([
    { $match: { userId: userObjectId, completedAt: { $gte: since } } },
    {
      $lookup: {
        from: "quests",
        localField: "questId",
        foreignField: "_id",
        as: "q",
      },
    },
    { $unwind: "$q" },
    {
      $match: {
        "q.createdBy": userObjectId,
        ...habitQuestMatch,
      },
    },
    {
      $group: {
        _id: "$questId",
        dates: { $addToSet: "$completionDate" },
        title: { $first: "$q.title" },
      },
    },
  ]);

  const scored = rows.map((r) => ({
    questId: String(r._id),
    title: r.title ?? "Habit",
    streak: longestRunOfConsecutiveDays(r.dates),
  }));
  scored.sort((a, b) => b.streak - a.streak || a.title.localeCompare(b.title));
  return scored.slice(0, limit);
}

export type WeeklyXpRow = { weekStart: string; weekLabel: string; xp: number };

export function foldXpByWeek(xpByDay: Array<{ date: string; value: number }>): WeeklyXpRow[] {
  const weekMap = new Map<string, number>();
  for (const row of xpByDay) {
    const ws = mondayWeekStartUtcFromDateKey(row.date);
    weekMap.set(ws, (weekMap.get(ws) ?? 0) + row.value);
  }
  const sortedWeeks = [...weekMap.keys()].sort();
  return sortedWeeks.map((weekStart) => {
    const d = new Date(`${weekStart}T00:00:00.000Z`);
    const weekLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
    return { weekStart, weekLabel, xp: weekMap.get(weekStart) ?? 0 };
  });
}
