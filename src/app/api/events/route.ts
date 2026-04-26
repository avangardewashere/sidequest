import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import {
  MAX_BEHAVIOR_EVENT_PROPERTIES_BYTES,
  isBehaviorEventName,
  sanitizeBehaviorEventProperties,
} from "@/lib/behavior-events";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { BehaviorEventModel } from "@/models/BehaviorEvent";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const eventSchema = z.object({
  name: z.string().min(1),
  properties: z.record(z.string(), z.unknown()).optional(),
});

type RateLimitEntry = {
  windowStartedAtMs: number;
  count: number;
};

const rateLimitByUserId = new Map<string, RateLimitEntry>();

function isRateLimitExceeded(userId: string, nowMs: number): boolean {
  const entry = rateLimitByUserId.get(userId);
  if (!entry) {
    rateLimitByUserId.set(userId, { windowStartedAtMs: nowMs, count: 1 });
    return false;
  }

  if (nowMs - entry.windowStartedAtMs >= RATE_LIMIT_WINDOW_MS) {
    rateLimitByUserId.set(userId, { windowStartedAtMs: nowMs, count: 1 });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  return false;
}

export function __resetEventRateLimitForTests() {
  rateLimitByUserId.clear();
}

export async function POST(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "events.POST" });

  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "events.POST" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success || !isBehaviorEventName(parsed.data.name)) {
      logger.warn("api.validation.invalid_payload", { handler: "events.POST", reason: "invalid_name_or_payload" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const sanitizedProperties = sanitizeBehaviorEventProperties(
      parsed.data.properties,
      MAX_BEHAVIOR_EVENT_PROPERTIES_BYTES,
    );
    if (parsed.data.properties != null && !sanitizedProperties) {
      logger.warn("api.validation.invalid_payload", { handler: "events.POST", reason: "invalid_properties" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (isRateLimitExceeded(userId, Date.now())) {
      logger.warn("api.rate_limit.exceeded", { handler: "events.POST", userId });
      return NextResponse.json({ error: "Too many event requests" }, { status: 429 });
    }

    await connectToDatabase();

    const event = await BehaviorEventModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: parsed.data.name,
      properties: sanitizedProperties ?? {},
      createdAt: new Date(),
    });

    logger.info("api.events.created", { userId, name: event.name });
    return NextResponse.json({
      event: {
        id: String(event._id),
        name: event.name,
        createdAt: event.createdAt.toISOString(),
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "events.POST" });
    return NextResponse.json({ error: "Failed to record behavior event" }, { status: 500 });
  }
}
