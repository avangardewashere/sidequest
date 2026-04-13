import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { buildDailyQuestSet, getUtcDailyKey } from "@/lib/dailies";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "dailies.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "dailies.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const dailyKey = getUtcDailyKey();

    let dailyQuests = await QuestModel.find({
      createdBy: userId,
      isDaily: true,
      dailyKey,
    }).sort({ createdAt: 1 });

    if (dailyQuests.length === 0) {
      const generated = buildDailyQuestSet(userId, dailyKey);
      const userObjectId = new mongoose.Types.ObjectId(userId);
      await QuestModel.bulkWrite(
        generated.map((item) => ({
          updateOne: {
            filter: {
              createdBy: userObjectId,
              isDaily: true,
              dailyKey,
              title: item.title,
            },
            update: {
              $setOnInsert: {
                ...item,
                createdBy: userObjectId,
                status: "active",
                dueDate: null,
                completedAt: null,
              },
            },
            upsert: true,
          },
        })),
        { ordered: false },
      );
      dailyQuests = await QuestModel.find({
        createdBy: userId,
        isDaily: true,
        dailyKey,
      }).sort({ createdAt: 1 });
    }

    logger.info("api.dailies.success", { count: dailyQuests.length, dailyKey });
    return NextResponse.json({
      dailyKey,
      dailies: dailyQuests,
    });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "dailies.GET" });
    return NextResponse.json({ error: "Failed to fetch dailies" }, { status: 500 });
  }
}
