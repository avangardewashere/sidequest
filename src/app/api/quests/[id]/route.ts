import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

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
    const quest = await QuestModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      {
        $set: {
          title: parsed.data.title,
          description: parsed.data.description,
          difficulty: parsed.data.difficulty,
          category: parsed.data.category,
          cadence: parsed.data.cadence ?? { kind: "oneoff" },
        },
      },
      { new: true },
    );
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

    await QuestModel.deleteOne({ _id: id, createdBy: userId });

    logger.info("api.quests.delete.success", { questId: id });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.id.DELETE" });
    return NextResponse.json({ error: "Failed to delete quest" }, { status: 500 });
  }
}
