import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { FocusSessionModel } from "@/models/FocusSession";

const startFocusSchema = z.object({
  questId: z.string().optional(),
});

export async function POST(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "focus.start.POST" });
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    logger.warn("api.auth.unauthorized", { handler: "focus.start.POST" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = startFocusSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("api.validation.invalid_payload", { handler: "focus.start.POST" });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (parsed.data.questId && !mongoose.Types.ObjectId.isValid(parsed.data.questId)) {
    logger.warn("api.validation.invalid_payload", { handler: "focus.start.POST", reason: "bad_quest_id" });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectToDatabase();
  const dbSession = await mongoose.startSession();

  try {
    let created:
      | {
          _id: string;
          startedAt: string;
          questId: string | null;
        }
      | undefined;

    await dbSession.withTransaction(async () => {
      const now = new Date();
      const existing = await FocusSessionModel.findOne({
        userId,
        endedAt: null,
      }).session(dbSession);

      if (existing) {
        existing.endedAt = now;
        existing.durationSec = Math.max(
          0,
          Math.floor((now.getTime() - existing.startedAt.getTime()) / 1000),
        );
        await existing.save({ session: dbSession });
      }

      const [newSession] = await FocusSessionModel.create(
        [
          {
            userId,
            questId: parsed.data.questId ? new mongoose.Types.ObjectId(parsed.data.questId) : null,
            startedAt: now,
            endedAt: null,
            durationSec: 0,
          },
        ],
        { session: dbSession },
      );

      created = {
        _id: String(newSession._id),
        startedAt: newSession.startedAt.toISOString(),
        questId: newSession.questId ? String(newSession.questId) : null,
      };
    });

    if (!created) {
      logger.error("api.focus.start.empty_response");
      return NextResponse.json({ error: "Could not start focus session" }, { status: 500 });
    }

    logger.info("api.focus.start.success", { userId });
    return NextResponse.json({ session: created }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000) {
      logger.warn("api.focus.start.conflict", { userId });
      return NextResponse.json({ error: "Another focus session is already active" }, { status: 409 });
    }
    logRequestException(logger, "api.request.exception", error, {
      handler: "focus.start.POST",
    });
    return NextResponse.json({ error: "Failed to start focus session" }, { status: 500 });
  } finally {
    await dbSession.endSession();
  }
}
