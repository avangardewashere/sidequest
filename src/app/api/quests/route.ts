import { NextResponse } from "next/server";
import { z } from "zod";
import type { PipelineStage } from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";
import { getXpReward, QuestDifficulty } from "@/lib/xp";

const createQuestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.enum(["work", "study", "health", "personal", "other"]),
  dueDate: z.string().datetime().optional().nullable(),
});

const questListQuerySchema = z.object({
  status: z.enum(["all", "active", "completed", "daily"]).default("all"),
  category: z.enum(["all", "work", "study", "health", "personal", "other"]).default("all"),
  sort: z.enum(["newest", "oldest", "highest_xp", "category", "priority_due"]).default("newest"),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsed = questListQuerySchema.safeParse(query);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_query", { handler: "quests.GET" });
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const filter: Record<string, unknown> = { createdBy: userId };
    if (parsed.data.status === "active") {
      filter.status = "active";
    } else if (parsed.data.status === "completed") {
      filter.status = "completed";
    } else if (parsed.data.status === "daily") {
      filter.isDaily = true;
    }
    if (parsed.data.category !== "all") {
      filter.category = parsed.data.category;
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (parsed.data.sort === "oldest") {
      sort = { createdAt: 1 };
    } else if (parsed.data.sort === "highest_xp") {
      sort = { xpReward: -1, createdAt: -1 };
    } else if (parsed.data.sort === "category") {
      sort = { category: 1, createdAt: -1 };
    }

    await connectToDatabase();
    let quests;
    if (parsed.data.sort === "priority_due") {
      const pipeline: PipelineStage[] = [
        { $match: filter },
        {
          $addFields: {
            difficultyRank: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficulty", "hard"] }, then: 0 },
                  { case: { $eq: ["$difficulty", "medium"] }, then: 1 },
                ],
                default: 2,
              },
            },
            dueDateSort: {
              $ifNull: ["$dueDate", new Date("9999-12-31T00:00:00.000Z")],
            },
          },
        },
        { $sort: { difficultyRank: 1, dueDateSort: 1, xpReward: -1, createdAt: -1 } },
      ];
      if (parsed.data.limit != null) {
        pipeline.push({ $limit: parsed.data.limit });
      }
      quests = await QuestModel.aggregate(pipeline);
    } else {
      let queryBuilder = QuestModel.find(filter).sort(sort);
      if (parsed.data.limit != null) {
        queryBuilder = queryBuilder.limit(parsed.data.limit);
      }
      quests = await queryBuilder.exec();
    }

    logger.info("api.quests.list.success", { count: quests.length });
    return NextResponse.json({ quests });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.GET" });
    return NextResponse.json({ error: "Failed to load quests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.POST" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.POST" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createQuestSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "quests.POST" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();

    const difficulty = parsed.data.difficulty as QuestDifficulty;
    const quest = await QuestModel.create({
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty,
      category: parsed.data.category,
      xpReward: getXpReward(difficulty),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdBy: userId,
    });

    logger.info("api.quests.create.success", { questId: String(quest._id) });
    return NextResponse.json({ quest }, { status: 201 });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.POST" });
    return NextResponse.json({ error: "Failed to create quest" }, { status: 500 });
  }
}
