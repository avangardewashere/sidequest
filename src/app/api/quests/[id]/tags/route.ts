import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { normalizeTags } from "@/lib/normalize-quest-tags";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

const tagsSchema = z.object({
  tags: z.array(z.string()).max(100),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.tags.PATCH" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.tags.PATCH" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn("api.validation.invalid_quest_id", { handler: "quests.id.tags.PATCH", questId: id });
      return NextResponse.json({ error: "Invalid quest id" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = tagsSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "quests.id.tags.PATCH" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const normalizedTags = normalizeTags(parsed.data.tags);
    if (normalizedTags.length > 8) {
      return NextResponse.json({ error: "A quest can have at most 8 tags" }, { status: 400 });
    }

    await connectToDatabase();
    const quest = await QuestModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: { tags: normalizedTags } },
      { new: true },
    );
    if (!quest) {
      logger.warn("api.quests.tags.not_found", { questId: id });
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    logger.info("api.quests.tags.updated", { questId: id, tagCount: normalizedTags.length });
    return NextResponse.json({ tags: quest.tags });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.tags.PATCH",
    });
    return NextResponse.json({ error: "Failed to update quest tags" }, { status: 500 });
  }
}
