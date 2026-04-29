import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

const createLinkSchema = z.object({
  questId: z.string().min(1),
  kind: z.enum(["related", "blocks", "depends-on"]),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.links.POST" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.id.links.POST" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid quest id" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success || !mongoose.Types.ObjectId.isValid(parsed.data.questId)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (id === parsed.data.questId) {
      return NextResponse.json({ error: "A quest cannot link to itself" }, { status: 400 });
    }

    await connectToDatabase();
    const [quest, target] = await Promise.all([
      QuestModel.findOne({ _id: id, createdBy: userId }),
      QuestModel.findOne({ _id: parsed.data.questId, createdBy: userId }).select("_id"),
    ]);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }
    if (!target) {
      return NextResponse.json({ error: "Linked quest not found" }, { status: 404 });
    }

    const links = quest.links ?? [];
    if (links.length >= 32) {
      return NextResponse.json({ error: "A quest can have at most 32 links" }, { status: 400 });
    }

    const duplicate = links.some(
      (link) => String(link.questId) === parsed.data.questId && link.kind === parsed.data.kind,
    );
    if (duplicate) {
      return NextResponse.json({ error: "Link already exists" }, { status: 400 });
    }

    quest.links.push({
      questId: new mongoose.Types.ObjectId(parsed.data.questId),
      kind: parsed.data.kind,
    } as never);
    await quest.save();

    const link = quest.links[quest.links.length - 1];
    return NextResponse.json({
      link: {
        id: String(link._id),
        questId: String(link.questId),
        kind: link.kind,
      },
    }, { status: 201 });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.links.POST",
    });
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
