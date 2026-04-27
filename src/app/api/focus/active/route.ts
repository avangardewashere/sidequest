import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { FocusSessionModel } from "@/models/FocusSession";

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "focus.active.GET" });
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    logger.warn("api.auth.unauthorized", { handler: "focus.active.GET" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const active = await FocusSessionModel.findOne({ userId, endedAt: null }).sort({ startedAt: -1 });

    logger.info("api.focus.active.success", { userId, hasActive: Boolean(active) });
    return NextResponse.json({
      session: active
        ? {
            _id: String(active._id),
            startedAt: active.startedAt.toISOString(),
            questId: active.questId ? String(active.questId) : null,
          }
        : null,
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "focus.active.GET",
    });
    return NextResponse.json({ error: "Failed to fetch active focus session" }, { status: 500 });
  }
}
