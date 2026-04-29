import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

type Params = { id: string; linkId: string };

export async function DELETE(request: Request, context: { params: Promise<Params> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.links.linkId.DELETE" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.links.linkId.DELETE" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, linkId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(linkId)) {
      return NextResponse.json({ error: "Invalid identifier" }, { status: 400 });
    }

    await connectToDatabase();
    const quest = await QuestModel.findOne({ _id: id, createdBy: userId });
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const linkIndex = quest.links.findIndex((link) => String(link._id) === linkId);
    if (linkIndex < 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    quest.links.splice(linkIndex, 1);

    await quest.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.links.linkId.DELETE",
    });
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
