import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { QuestModel } from "@/models/Quest";

const updateQuestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.enum(["work", "study", "health", "personal", "other"]),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await connectToDatabase();
  const quest = await QuestModel.findOne({ _id: id, createdBy: userId });
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  return NextResponse.json({ quest });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateQuestSchema.safeParse(body);
  if (!parsed.success) {
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
      },
    },
    { new: true },
  );
  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  return NextResponse.json({ quest });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await connectToDatabase();
  const deleted = await QuestModel.findOneAndDelete({ _id: id, createdBy: userId });
  if (!deleted) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
