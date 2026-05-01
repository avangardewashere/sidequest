import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.linked-from.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.linked-from.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid quest id" }, { status: 400 });
    }

    await connectToDatabase();
    const targetId = new mongoose.Types.ObjectId(id);
    const rows = await QuestModel.find({
      createdBy: userId,
      links: { $elemMatch: { questId: targetId } },
    })
      .select("_id title")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const quests = rows.map((r) => ({
      _id: String(r._id),
      title: r.title,
    }));

    logger.info("api.quests.linked-from.success", { questId: id, count: quests.length });
    return NextResponse.json({ quests });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.id.linked-from.GET" });
    return NextResponse.json({ error: "Failed to load linked-from quests" }, { status: 500 });
  }
}
