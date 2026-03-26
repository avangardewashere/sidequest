import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { buildDailyQuestSet, getUtcDailyKey } from "@/lib/dailies";
import { QuestModel } from "@/models/Quest";

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
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

  return NextResponse.json({
    dailyKey,
    dailies: dailyQuests,
  });
}
