import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { levelFromTotalXp } from "@/lib/xp";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { CompletionLogModel } from "@/models/CompletionLog";
import { QuestModel } from "@/models/Quest";
import { UserModel } from "@/models/User";

const cadenceSchema = z
  .object({
    kind: z.enum(["oneoff", "daily", "weekdays", "weekly", "custom"]),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    everyNDays: z.number().int().min(1).optional(),
  })
  .superRefine((cadence, ctx) => {
    if ((cadence.kind === "weekdays" || cadence.kind === "weekly" || cadence.kind === "custom") && (!cadence.daysOfWeek || cadence.daysOfWeek.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daysOfWeek"],
        message: "daysOfWeek is required for weekdays/weekly/custom cadence",
      });
    }
    if (cadence.kind === "custom" && cadence.everyNDays == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["everyNDays"],
        message: "everyNDays is required for custom cadence",
      });
    }
  });

const updateQuestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.enum(["work", "study", "health", "personal", "other"]),
  dueDate: z.string().datetime().optional().nullable(),
  cadence: cadenceSchema.optional(),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();
    const quest = await QuestModel.findOne({ _id: id, createdBy: userId });
    if (!quest) {
      logger.warn("api.quests.get.not_found", { questId: id });
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    logger.info("api.quests.get.success", { questId: id });
    return NextResponse.json({ quest });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.id.GET" });
    return NextResponse.json({ error: "Failed to get quest" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.PATCH" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.PATCH" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateQuestSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "quests.id.PATCH" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { id } = await context.params;
    await connectToDatabase();
    const setDoc: Record<string, unknown> = {
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      category: parsed.data.category,
      cadence: parsed.data.cadence ?? { kind: "oneoff" },
    };
    if (parsed.data.dueDate !== undefined) {
      setDoc.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    }
    const quest = await QuestModel.findOneAndUpdate({ _id: id, createdBy: userId }, { $set: setDoc }, { new: true });
    if (!quest) {
      logger.warn("api.quests.update.not_found", { questId: id });
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    logger.info("api.quests.update.success", { questId: id });
    return NextResponse.json({ quest });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.id.PATCH" });
    return NextResponse.json({ error: "Failed to update quest" }, { status: 500 });
  }
}

const deleteQuestBodySchema = z.object({
  confirmTitle: z.string().trim().min(1).max(120),
  /** Required when the quest has child quests (subtasks). */
  childDisposition: z.enum(["reparent-to-root", "cascade-delete"]).optional(),
});

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.DELETE" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.DELETE" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const parsedBody = deleteQuestBodySchema.safeParse(body);
    if (!parsedBody.success) {
      logger.warn("api.validation.invalid_payload", { handler: "quests.id.DELETE" });
      return NextResponse.json(
        { error: "confirmTitle is required and must match the quest title" },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    await connectToDatabase();
    const quest = await QuestModel.findOne({ _id: id, createdBy: userId });
    if (!quest) {
      logger.warn("api.quests.delete.not_found", { questId: id });
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if (quest.title.trim() !== parsedBody.data.confirmTitle.trim()) {
      logger.warn("api.validation.title_mismatch", { questId: id });
      return NextResponse.json({ error: "Title does not match" }, { status: 400 });
    }

    const childCount = await QuestModel.countDocuments({
      parentQuestId: quest._id,
      createdBy: userId,
    });
    if (childCount > 0 && !parsedBody.data.childDisposition) {
      logger.warn("api.quests.delete.subtasks_need_disposition", { questId: id, childCount });
      return NextResponse.json(
        {
          error:
            "This quest has subtasks. Choose whether to detach them (make top-level) or delete them with the parent.",
          code: "SUBTASKS_REQUIRE_DISPOSITION",
          childCount,
        },
        { status: 400 },
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        if (childCount > 0 && parsedBody.data.childDisposition === "reparent-to-root") {
          await QuestModel.updateMany(
            { parentQuestId: quest._id, createdBy: userId },
            { $set: { parentQuestId: null } },
          ).session(dbSession);
        }

        if (childCount > 0 && parsedBody.data.childDisposition === "cascade-delete") {
          const children = await QuestModel.find({ parentQuestId: quest._id, createdBy: userId })
            .select("_id")
            .session(dbSession)
            .lean();
          const userForChildren = await UserModel.findById(userObjectId).session(dbSession);
          if (!userForChildren) {
            throw new Error("User not found");
          }
          let xpRemovedChildren = 0;
          for (const ch of children) {
            const logs = await CompletionLogModel.find({
              questId: ch._id,
              userId: userObjectId,
            }).session(dbSession);
            for (const log of logs) {
              xpRemovedChildren += log.xpEarned;
            }
            await CompletionLogModel.deleteMany({ questId: ch._id, userId: userObjectId }).session(dbSession);
            await QuestModel.deleteOne({ _id: ch._id, createdBy: userId }).session(dbSession);
          }
          userForChildren.totalXp = Math.max(0, userForChildren.totalXp - xpRemovedChildren);
          userForChildren.level = levelFromTotalXp(userForChildren.totalXp);
          await userForChildren.save({ session: dbSession });
        }

        const user = await UserModel.findById(userObjectId).session(dbSession);
        if (!user) {
          throw new Error("User not found");
        }
        let xpRemovedParent = 0;
        const parentLogs = await CompletionLogModel.find({
          questId: quest._id,
          userId: userObjectId,
        }).session(dbSession);
        for (const log of parentLogs) {
          xpRemovedParent += log.xpEarned;
        }
        await CompletionLogModel.deleteMany({ questId: quest._id, userId: userObjectId }).session(dbSession);
        user.totalXp = Math.max(0, user.totalXp - xpRemovedParent);
        user.level = levelFromTotalXp(user.totalXp);
        await user.save({ session: dbSession });
        await QuestModel.deleteOne({ _id: id, createdBy: userId }).session(dbSession);
      });
    } finally {
      await dbSession.endSession();
    }

    logger.info("api.quests.delete.success", { questId: id });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.id.DELETE" });
    return NextResponse.json({ error: "Failed to delete quest" }, { status: 500 });
  }
}
