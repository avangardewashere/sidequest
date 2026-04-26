import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { CompletionLogModel } from "@/models/CompletionLog";
import { FocusSessionModel } from "@/models/FocusSession";
import { MilestoneRewardLogModel } from "@/models/MilestoneRewardLog";
import { QuestModel } from "@/models/Quest";
import { UserModel } from "@/models/User";

type MetricsRange = "7d" | "30d" | "90d";

type DailyPoint = {
  date: string;
  value: number;
};

type CategoryPoint = {
  category: string;
  count: number;
  xpTotal: number;
};

type MetricsSummaryResponse = {
  range: MetricsRange;
  rangeDays: number;
  completionsByDay: DailyPoint[];
  xpByDay: DailyPoint[];
  byCategory: CategoryPoint[];
  streakHistory: {
    current: number;
    longest: number;
    last7d: Array<{ date: string; active: boolean }>;
  };
  kpis: {
    totalCompletions: number;
    totalXp: number;
    avgXpPerCompletion: number;
    avgCompletionsPerDay: number;
    focusMinutesLast7d: number;
  };
  previousPeriod: {
    totalCompletions: number;
    totalXp: number;
    avgXpPerCompletion: number;
    avgCompletionsPerDay: number;
  };
  // Deprecated compatibility block for old consumers.
  last7Days: {
    questsCreated: number;
    questsCompleted: number;
    completionRate: number;
    dailyQuestsCreated: number;
    dailyQuestsCompleted: number;
    dailyCompletionRate: number;
    milestoneRewardsTriggered: number;
    avgXpPerCompletion: number;
    totalXpFromCompletions: number;
    completionEvents: number;
  };
};

const RANGE_TO_DAYS: Record<MetricsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function toUtcDateKey(input: Date): string {
  const year = input.getUTCFullYear();
  const month = `${input.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${input.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDateKeys(rangeDays: number, endDate = new Date()): string[] {
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  const keys: string[] = [];
  for (let offset = rangeDays - 1; offset >= 0; offset -= 1) {
    const current = new Date(end);
    current.setUTCDate(end.getUTCDate() - offset);
    keys.push(toUtcDateKey(current));
  }
  return keys;
}

function parseRangeFromUrl(request: Request): MetricsRange {
  const url = new URL(request.url);
  const range = url.searchParams.get("range");
  if (range === "30d" || range === "90d") {
    return range;
  }
  return "7d";
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "metrics.summary.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "metrics.summary.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const range = parseRangeFromUrl(request);
    const rangeDays = RANGE_TO_DAYS[range];
    const now = new Date();
    const since = new Date(now.getTime() - (rangeDays - 1) * 24 * 60 * 60 * 1000);
    const previousEnd = new Date(since.getTime() - 24 * 60 * 60 * 1000);
    const previousSince = new Date(previousEnd.getTime() - (rangeDays - 1) * 24 * 60 * 60 * 1000);
    const dateKeys = buildDateKeys(rangeDays, now);
    const last7DateKeys = buildDateKeys(7, now);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [
      completionStats,
      completionsByDayRows,
      xpByDayRows,
      categoryRows,
      userProfile,
      previousStats,
      last7CreatedCount,
      last7CompletedCount,
      last7DailyCreatedCount,
      last7DailyCompletedCount,
      last7MilestoneCount,
      last7CompletionStats,
      focusMinutesLast7dRows,
    ] = await Promise.all([
      CompletionLogModel.aggregate([
        { $match: { userId: userObjectId, completedAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            avgXpPerCompletion: { $avg: "$xpEarned" },
            totalXpFromCompletions: { $sum: "$xpEarned" },
            completionEvents: { $sum: 1 },
          },
        },
      ]),
      CompletionLogModel.aggregate([
        { $match: { userId: userObjectId, completedAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$completedAt",
              },
            },
            value: { $sum: 1 },
          },
        },
      ]),
      CompletionLogModel.aggregate([
        { $match: { userId: userObjectId, completedAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$completedAt",
              },
            },
            value: { $sum: "$xpEarned" },
          },
        },
      ]),
      QuestModel.aggregate([
        {
          $match: {
            createdBy: userObjectId,
            status: "completed",
            completedAt: { $gte: since },
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            xpTotal: { $sum: "$xpReward" },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
            xpTotal: 1,
          },
        },
        { $sort: { xpTotal: -1, count: -1, category: 1 } },
      ]),
      UserModel.findById(userId),
      CompletionLogModel.aggregate([
        { $match: { userId: userObjectId, completedAt: { $gte: previousSince, $lte: previousEnd } } },
        {
          $group: {
            _id: null,
            avgXpPerCompletion: { $avg: "$xpEarned" },
            totalXpFromCompletions: { $sum: "$xpEarned" },
            completionEvents: { $sum: 1 },
          },
        },
      ]),
      QuestModel.countDocuments({
        createdBy: userId,
        createdAt: { $gte: new Date(now.getTime() - (7 - 1) * 24 * 60 * 60 * 1000) },
      }),
      QuestModel.countDocuments({
        createdBy: userId,
        status: "completed",
        completedAt: { $gte: new Date(now.getTime() - (7 - 1) * 24 * 60 * 60 * 1000) },
      }),
      QuestModel.countDocuments({
        createdBy: userId,
        isDaily: true,
        createdAt: { $gte: new Date(now.getTime() - (7 - 1) * 24 * 60 * 60 * 1000) },
      }),
      QuestModel.countDocuments({
        createdBy: userId,
        isDaily: true,
        status: "completed",
        completedAt: { $gte: new Date(now.getTime() - (7 - 1) * 24 * 60 * 60 * 1000) },
      }),
      MilestoneRewardLogModel.countDocuments({
        userId: userObjectId,
        awardedAt: { $gte: new Date(now.getTime() - (7 - 1) * 24 * 60 * 60 * 1000) },
      }),
      CompletionLogModel.aggregate([
        {
          $match: {
            userId: userObjectId,
            completedAt: { $gte: new Date(now.getTime() - (7 - 1) * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: null,
            avgXpPerCompletion: { $avg: "$xpEarned" },
            totalXpFromCompletions: { $sum: "$xpEarned" },
            completionEvents: { $sum: 1 },
          },
        },
      ]),
      FocusSessionModel.aggregate([
        {
          $match: {
            userId: userObjectId,
            endedAt: {
              $gte: new Date(now.getTime() - (7 - 1) * 24 * 60 * 60 * 1000),
            },
            durationSec: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            durationSecTotal: { $sum: "$durationSec" },
          },
        },
      ]),
    ]);

    const completionCountByKey = new Map<string, number>(
      (completionsByDayRows as Array<{ _id: string; value: number }>).map((row) => [row._id, row.value]),
    );
    const xpByKey = new Map<string, number>(
      (xpByDayRows as Array<{ _id: string; value: number }>).map((row) => [row._id, row.value]),
    );

    const completionsByDay: DailyPoint[] = dateKeys.map((date) => ({
      date,
      value: completionCountByKey.get(date) ?? 0,
    }));
    const xpByDay: DailyPoint[] = dateKeys.map((date) => ({
      date,
      value: xpByKey.get(date) ?? 0,
    }));
    const byCategory = (categoryRows as CategoryPoint[]) ?? [];

    const stats = completionStats[0] ?? {
      avgXpPerCompletion: 0,
      totalXpFromCompletions: 0,
      completionEvents: 0,
    };
    const totalCompletions = stats.completionEvents ?? 0;
    const totalXp = stats.totalXpFromCompletions ?? 0;
    const avgXpPerCompletion = Math.round(stats.avgXpPerCompletion ?? 0);
    const previous = previousStats[0] ?? {
      avgXpPerCompletion: 0,
      totalXpFromCompletions: 0,
      completionEvents: 0,
    };
    const previousCompletions = previous.completionEvents ?? 0;

    const activeLast7d = new Set(
      (completionsByDayRows as Array<{ _id: string; value: number }>)
        .filter((row) => row.value > 0)
        .map((row) => row._id),
    );
    const streakHistory = {
      current: userProfile?.currentStreak ?? 0,
      longest: userProfile?.longestStreak ?? 0,
      last7d: last7DateKeys.map((date) => ({
        date,
        active: activeLast7d.has(date),
      })),
    };
    const legacyStats = last7CompletionStats[0] ?? {
      avgXpPerCompletion: 0,
      totalXpFromCompletions: 0,
      completionEvents: 0,
    };
    const focusDurationSec = (focusMinutesLast7dRows[0]?.durationSecTotal as number | undefined) ?? 0;
    const focusMinutesLast7d = Math.max(0, Math.floor(focusDurationSec / 60));

    logger.info("api.metrics.summary.success", { userId, range, rangeDays });
    const response: MetricsSummaryResponse = {
      range,
      rangeDays,
      completionsByDay,
      xpByDay,
      byCategory,
      streakHistory,
      kpis: {
        totalCompletions,
        totalXp,
        avgXpPerCompletion,
        avgCompletionsPerDay: Number((totalCompletions / rangeDays).toFixed(1)),
        focusMinutesLast7d,
      },
      previousPeriod: {
        totalCompletions: previousCompletions,
        totalXp: previous.totalXpFromCompletions ?? 0,
        avgXpPerCompletion: Math.round(previous.avgXpPerCompletion ?? 0),
        avgCompletionsPerDay: Number((previousCompletions / rangeDays).toFixed(1)),
      },
      last7Days: {
        questsCreated: last7CreatedCount,
        questsCompleted: last7CompletedCount,
        completionRate: last7CreatedCount === 0 ? 0 : last7CompletedCount / last7CreatedCount,
        dailyQuestsCreated: last7DailyCreatedCount,
        dailyQuestsCompleted: last7DailyCompletedCount,
        dailyCompletionRate:
          last7DailyCreatedCount === 0 ? 0 : last7DailyCompletedCount / last7DailyCreatedCount,
        milestoneRewardsTriggered: last7MilestoneCount,
        avgXpPerCompletion: Math.round(legacyStats.avgXpPerCompletion ?? 0),
        totalXpFromCompletions: legacyStats.totalXpFromCompletions ?? 0,
        completionEvents: legacyStats.completionEvents ?? 0,
      },
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "metrics.summary.GET",
    });
    return NextResponse.json({ error: "Failed to fetch metrics summary" }, { status: 500 });
  }
}
