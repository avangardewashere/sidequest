import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";
import { CompletionLogModel } from "@/models/CompletionLog";

const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(90),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.history.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.history.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsed = historyQuerySchema.safeParse({
      days: url.searchParams.get("days") ?? undefined,
    });
    if (!parsed.success) {
      logger.warn("api.validation.invalid_query", { handler: "quests.id.history.GET" });
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const quest = await QuestModel.findOne({ _id: id, createdBy: userId }).select("_id");
    if (!quest) {
      logger.warn("api.quests.history.not_found", { questId: id });
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - parsed.data.days);

    const logs = await CompletionLogModel.find({
      questId: quest._id,
      userId,
      completedAt: { $gte: since },
    })
      .sort({ completedAt: -1 })
      .select("completionDate xpEarned completedAt")
      .lean();

    const completions = logs.map((log: { completionDate: string; xpEarned: number; completedAt: Date | string }) => ({
      date: log.completionDate,
      xp: log.xpEarned,
      completedAt: log.completedAt instanceof Date ? log.completedAt.toISOString() : String(log.completedAt),
    }));

    logger.info("api.quests.history.success", { questId: id, count: completions.length });
    return NextResponse.json({ completions });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.history.GET",
    });
    return NextResponse.json({ error: "Failed to load quest history" }, { status: 500 });
  }
}
