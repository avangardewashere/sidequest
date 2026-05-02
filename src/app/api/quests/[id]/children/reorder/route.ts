import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

const reorderBodySchema = z.object({
  orderedChildIds: z.array(z.string().trim().min(1)).min(1),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.children.reorder.PATCH" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.children.reorder.PATCH" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn("api.validation.invalid_parent_id", { handler: "quests.id.children.reorder.PATCH", parentId: id });
      return NextResponse.json({ error: "Invalid parent quest id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = reorderBodySchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "quests.id.children.reorder.PATCH" });
      return NextResponse.json({ error: "Invalid payload: orderedChildIds required" }, { status: 400 });
    }

    const orderedChildIds = parsed.data.orderedChildIds;
    const uniqueIds = new Set(orderedChildIds);
    if (uniqueIds.size !== orderedChildIds.length) {
      return NextResponse.json({ error: "Duplicate child ids in orderedChildIds" }, { status: 400 });
    }

    await connectToDatabase();
    const parentQuest = await QuestModel.findOne({ _id: id, createdBy: userId }).select("_id");
    if (!parentQuest) {
      logger.warn("api.quests.children.reorder.parent_not_found", { parentId: id });
      return NextResponse.json({ error: "Parent quest not found" }, { status: 404 });
    }

    const children = await QuestModel.find({
      createdBy: userId,
      parentQuestId: parentQuest._id,
    })
      .select("_id")
      .lean();

    if (children.length !== orderedChildIds.length) {
      return NextResponse.json(
        { error: "orderedChildIds must list every subtask exactly once" },
        { status: 400 },
      );
    }

    const childIdSet = new Set(children.map((c) => String(c._id)));
    for (const cid of orderedChildIds) {
      if (!mongoose.Types.ObjectId.isValid(cid) || !childIdSet.has(cid)) {
        return NextResponse.json({ error: "Invalid or unknown child id in orderedChildIds" }, { status: 400 });
      }
    }

    await Promise.all(
      orderedChildIds.map((childId, index) =>
        QuestModel.updateOne(
          { _id: childId, createdBy: userId, parentQuestId: parentQuest._id },
          { $set: { order: index } },
        ).exec(),
      ),
    );

    const updated = await QuestModel.find({
      createdBy: userId,
      parentQuestId: parentQuest._id,
    })
      .sort({ order: 1, createdAt: -1 })
      .exec();

    logger.info("api.quests.children.reorder.success", { parentId: id, count: updated.length });
    return NextResponse.json({ children: updated });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.children.reorder.PATCH",
    });
    return NextResponse.json({ error: "Failed to reorder subtasks" }, { status: 500 });
  }
}
