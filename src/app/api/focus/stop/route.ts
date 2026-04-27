import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { FocusSessionModel } from "@/models/FocusSession";

export async function POST(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "focus.stop.POST" });
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    logger.warn("api.auth.unauthorized", { handler: "focus.stop.POST" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const active = await FocusSessionModel.findOne({ userId, endedAt: null });
    if (!active) {
      logger.warn("api.focus.stop.conflict", { userId, reason: "no_active_session" });
      return NextResponse.json({ error: "No active focus session" }, { status: 409 });
    }

    const now = new Date();
    active.endedAt = now;
    active.durationSec = Math.max(0, Math.floor((now.getTime() - active.startedAt.getTime()) / 1000));
    await active.save();

    logger.info("api.focus.stop.success", { userId, focusSessionId: String(active._id) });
    return NextResponse.json({
      session: {
        _id: String(active._id),
        startedAt: active.startedAt.toISOString(),
        endedAt: now.toISOString(),
        durationSec: active.durationSec,
        questId: active.questId ? String(active.questId) : null,
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "focus.stop.POST",
    });
    return NextResponse.json({ error: "Failed to stop focus session" }, { status: 500 });
  }
}
