import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { QuestModel } from "@/models/Quest";
import { getXpReward, QuestDifficulty } from "@/lib/xp";

const createQuestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  difficulty: z.enum(["easy", "medium", "hard"]),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const quests = await QuestModel.find({ createdBy: userId }).sort({
    status: 1,
    createdAt: -1,
  });

  return NextResponse.json({ quests });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createQuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectToDatabase();

  const difficulty = parsed.data.difficulty as QuestDifficulty;
  const quest = await QuestModel.create({
    title: parsed.data.title,
    difficulty,
    xpReward: getXpReward(difficulty),
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    createdBy: userId,
  });

  return NextResponse.json({ quest }, { status: 201 });
}
