import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";
import { getXpReward, QuestDifficulty } from "@/lib/xp";

const childQuestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.enum(["work", "study", "health", "personal", "other"]),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.children.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.children.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn("api.validation.invalid_parent_id", { handler: "quests.id.children.GET", parentId: id });
      return NextResponse.json({ error: "Invalid parent quest id" }, { status: 400 });
    }

    await connectToDatabase();
    const parentQuest = await QuestModel.findOne({ _id: id, createdBy: userId }).select("_id");
    if (!parentQuest) {
      logger.warn("api.quests.children.parent_not_found", { parentId: id });
      return NextResponse.json({ error: "Parent quest not found" }, { status: 404 });
    }

    const children = await QuestModel.find({
      createdBy: userId,
      parentQuestId: parentQuest._id,
    })
      .sort({ createdAt: -1 })
      .exec();

    logger.info("api.quests.children.list.success", { parentId: id, count: children.length });
    return NextResponse.json({ children });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.children.GET",
    });
    return NextResponse.json({ error: "Failed to load child quests" }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.children.POST" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.children.POST" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn("api.validation.invalid_parent_id", { handler: "quests.id.children.POST", parentId: id });
      return NextResponse.json({ error: "Invalid parent quest id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = childQuestSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "quests.id.children.POST" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const parentQuest = await QuestModel.findOne({
      _id: id,
      createdBy: userId,
    });
    if (!parentQuest) {
      logger.warn("api.quests.children.parent_not_found", { parentId: id });
      return NextResponse.json({ error: "Parent quest not found" }, { status: 404 });
    }

    if (parentQuest.parentQuestId) {
      logger.warn("api.validation.max_depth_violation", { parentId: id });
      return NextResponse.json({ error: "Child quests cannot have their own children" }, { status: 400 });
    }

    if (parentQuest.isDaily) {
      logger.warn("api.validation.daily_parent_disallowed", { parentId: id });
      return NextResponse.json({ error: "Daily quests cannot be parent quests" }, { status: 400 });
    }

    const difficulty = parsed.data.difficulty as QuestDifficulty;
    const quest = await QuestModel.create({
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty,
      category: parsed.data.category,
      xpReward: getXpReward(difficulty),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      cadence: { kind: "oneoff" },
      createdBy: userId,
      parentQuestId: parentQuest._id,
    });

    logger.info("api.quests.children.create.success", {
      parentId: id,
      childQuestId: String(quest._id),
    });
    return NextResponse.json({ quest }, { status: 201 });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.children.POST",
    });
    return NextResponse.json({ error: "Failed to create child quest" }, { status: 500 });
  }
}
