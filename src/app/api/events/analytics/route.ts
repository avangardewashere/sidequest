import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { summarizeEvents, type SummarizableBehaviorEvent } from "@/lib/event-analytics";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { BehaviorEventModel } from "@/models/BehaviorEvent";

const RANGE_VALUES = ["7d", "30d", "90d"] as const;
type Range = (typeof RANGE_VALUES)[number];

const RANGE_TO_DAYS: Record<Range, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const rangeSchema = z.enum(RANGE_VALUES);

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function computeSinceDate(now: Date, range: Range): Date {
  const todayUtcMidnight = startOfUtcDay(now);
  const since = new Date(todayUtcMidnight);
  since.setUTCDate(since.getUTCDate() - (RANGE_TO_DAYS[range] - 1));
  return since;
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "events.analytics.GET" });

  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "events.analytics.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const rawRange = url.searchParams.get("range");
    const parsedRange = rangeSchema.safeParse(rawRange);
    if (!parsedRange.success) {
      logger.warn("api.validation.invalid_payload", {
        handler: "events.analytics.GET",
        reason: "invalid_range",
      });
      return NextResponse.json(
        { error: "Query parameter 'range' must be one of 7d, 30d, 90d." },
        { status: 400 },
      );
    }

    const range = parsedRange.data;
    const since = computeSinceDate(new Date(), range);

    await connectToDatabase();

    const events = (await BehaviorEventModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .lean()) as SummarizableBehaviorEvent[];

    const core = summarizeEvents(events);

    logger.info("api.events.analytics.success", { userId, range, totalEvents: core.totalEvents });
    return NextResponse.json({
      analytics: {
        range,
        rangeDays: RANGE_TO_DAYS[range],
        ...core,
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "events.analytics.GET",
    });
    return NextResponse.json({ error: "Failed to load event analytics" }, { status: 500 });
  }
}
