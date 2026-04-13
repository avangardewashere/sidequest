import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { CompletionLogModel } from "@/models/CompletionLog";
import { MilestoneRewardLogModel } from "@/models/MilestoneRewardLog";
import { QuestModel } from "@/models/Quest";

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

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [createdCount, completedCount, dailyCreatedCount, dailyCompletedCount, milestoneCount, completionStats] = await Promise.all([
      QuestModel.countDocuments({ createdBy: userId, createdAt: { $gte: since } }),
      QuestModel.countDocuments({
        createdBy: userId,
        status: "completed",
        completedAt: { $gte: since },
      }),
      QuestModel.countDocuments({
        createdBy: userId,
        isDaily: true,
        createdAt: { $gte: since },
      }),
      QuestModel.countDocuments({
        createdBy: userId,
        isDaily: true,
        status: "completed",
        completedAt: { $gte: since },
      }),
      MilestoneRewardLogModel.countDocuments({
        userId: userObjectId,
        awardedAt: { $gte: since },
      }),
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
    ]);

    const completionRate = createdCount === 0 ? 0 : completedCount / createdCount;
    const dailyCompletionRate =
      dailyCreatedCount === 0 ? 0 : dailyCompletedCount / dailyCreatedCount;
    const stats = completionStats[0] ?? {
      avgXpPerCompletion: 0,
      totalXpFromCompletions: 0,
      completionEvents: 0,
    };

    logger.info("api.metrics.summary.success", { userId });
    return NextResponse.json({
      last7Days: {
        questsCreated: createdCount,
        questsCompleted: completedCount,
        completionRate,
        dailyQuestsCreated: dailyCreatedCount,
        dailyQuestsCompleted: dailyCompletedCount,
        dailyCompletionRate,
        milestoneRewardsTriggered: milestoneCount,
        avgXpPerCompletion: Math.round(stats.avgXpPerCompletion ?? 0),
        totalXpFromCompletions: stats.totalXpFromCompletions ?? 0,
        completionEvents: stats.completionEvents ?? 0,
      },
    });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "metrics.summary.GET",
    });
    return NextResponse.json({ error: "Failed to fetch metrics summary" }, { status: 500 });
  }
}
