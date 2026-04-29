import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

const createNoteSchema = z.object({
  body: z.string().trim().min(1).max(4096),
});

function hasHtml(value: string) {
  return /[<][^>]+[>]/.test(value);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.notes.POST" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.notes.POST" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn("api.validation.invalid_quest_id", { handler: "quests.id.notes.POST", questId: id });
      return NextResponse.json({ error: "Invalid quest id" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success || hasHtml(parsed.data.body)) {
      logger.warn("api.validation.invalid_payload", { handler: "quests.id.notes.POST" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const quest = await QuestModel.findOne({ _id: id, createdBy: userId });
    if (!quest) {
      logger.warn("api.quests.notes.not_found", { questId: id });
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if ((quest.notes?.length ?? 0) >= 50) {
      return NextResponse.json({ error: "A quest can have at most 50 notes" }, { status: 400 });
    }

    const note = {
      id: new mongoose.Types.ObjectId(),
      body: parsed.data.body,
      createdAt: new Date(),
    };
    quest.notes.push(note as never);
    await quest.save();

    logger.info("api.quests.notes.created", { questId: id, noteId: String(note.id) });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.notes.POST",
    });
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
