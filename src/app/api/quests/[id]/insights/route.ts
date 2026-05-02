import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import {
  bestDayOfWeekFromDates,
  buildWeeklyRows,
  computeQuestInsightStreaks,
} from "@/lib/quest-insights";
import {
  isHabitCadence,
  normalizeQuestCadence,
  type CompletionHistoryPoint,
} from "@/lib/cadence";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { CompletionLogModel } from "@/models/CompletionLog";
import { QuestModel } from "@/models/Quest";
import type { QuestInsightsResponse } from "@/types/quest-insights";

const insightsQuerySchema = z.object({
  weeks: z.coerce.number().int().min(1).max(52).default(12),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.insights.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.insights.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsedQ = insightsQuerySchema.safeParse({
      weeks: url.searchParams.get("weeks") ?? undefined,
    });
    if (!parsedQ.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }
    const windowWeeks = parsedQ.data.weeks;

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid quest id" }, { status: 400 });
    }

    await connectToDatabase();
    const quest = await QuestModel.findOne({ _id: id, createdBy: userId }).lean();
    if (!quest) {
      logger.warn("api.quests.insights.not_found", { questId: id });
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const cadence = normalizeQuestCadence(quest);
    if (!isHabitCadence(cadence.kind)) {
      const payload: QuestInsightsResponse = {
        habit: false,
        questId: String(quest._id),
        message: "Insights are available for habits (recurring cadence). This quest is a one-off.",
      };
      return NextResponse.json(payload);
    }

    const daySpan = windowWeeks * 7;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - daySpan);
    since.setUTCHours(0, 0, 0, 0);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const logs = await CompletionLogModel.find({
      questId: quest._id,
      userId: userObjectId,
      completedAt: { $gte: since },
    })
      .sort({ completedAt: 1 })
      .select("completionDate xpEarned")
      .lean();

    const historyPoints: CompletionHistoryPoint[] = logs.map((log) => ({
      completionDate: log.completionDate,
      xpEarned: log.xpEarned,
    }));

    const { currentStreak, longestStreak } = computeQuestInsightStreaks(historyPoints, cadence);
    const weeks = buildWeeklyRows(
      logs.map((l) => ({ completionDate: l.completionDate, xpEarned: l.xpEarned })),
      cadence,
      windowWeeks,
    );
    const dates = logs.map((l) => l.completionDate);
    const bestDayOfWeek = bestDayOfWeekFromDates(dates);

    const payload: QuestInsightsResponse = {
      habit: true,
      questId: String(quest._id),
      windowWeeks,
      currentStreak,
      longestStreak,
      bestDayOfWeek,
      weeks,
    };

    logger.info("api.quests.insights.success", { questId: id, windowWeeks });
    return NextResponse.json(payload);
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.insights.GET",
    });
    return NextResponse.json({ error: "Failed to load quest insights" }, { status: 500 });
  }
}
