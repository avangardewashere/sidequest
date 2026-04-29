import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

const updateNoteSchema = z.object({
  body: z.string().trim().min(1).max(4096),
});

function hasHtml(value: string) {
  return /[<][^>]+[>]/.test(value);
}

type Params = { id: string; noteId: string };

export async function PATCH(request: Request, context: { params: Promise<Params> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.notes.noteId.PATCH" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.notes.noteId.PATCH" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid identifier" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateNoteSchema.safeParse(body);
    if (!parsed.success || hasHtml(parsed.data.body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const quest = await QuestModel.findOne({ _id: id, createdBy: userId });
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const notes = quest.notes ?? [];
    const note = notes.find((item) => String(item.id) === noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    note.body = parsed.data.body;
    await quest.save();
    return NextResponse.json({ note });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.notes.noteId.PATCH",
    });
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<Params> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.notes.noteId.DELETE" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.notes.noteId.DELETE" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid identifier" }, { status: 400 });
    }

    await connectToDatabase();
    const quest = await QuestModel.findOne({ _id: id, createdBy: userId });
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const noteIndex = quest.notes.findIndex((item) => String(item.id) === noteId);
    if (noteIndex < 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    quest.notes.splice(noteIndex, 1);

    await quest.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.notes.noteId.DELETE",
    });
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
