import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { UserModel } from "@/models/User";

const onboardingSchema = z.object({
  focusArea: z.enum(["work", "health", "learning", "life"]),
  weeklyTarget: z.number().int().min(1).max(21),
  encouragementStyle: z.enum(["gentle", "direct", "celebration"]),
  complete: z.literal(true),
});

function toOnboardingPayload(user: {
  onboardingCompletedAt?: Date | null;
  onboardingFocusArea?: string | null;
  onboardingWeeklyTarget?: number | null;
  onboardingEncouragementStyle?: string | null;
}) {
  return {
    completed: Boolean(user.onboardingCompletedAt),
    completedAt: user.onboardingCompletedAt ? user.onboardingCompletedAt.toISOString() : null,
    focusArea: user.onboardingFocusArea ?? null,
    weeklyTarget: user.onboardingWeeklyTarget ?? null,
    encouragementStyle: user.onboardingEncouragementStyle ?? null,
  };
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "onboarding.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "onboarding.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.onboarding.not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      onboarding: toOnboardingPayload(user),
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "onboarding.GET" });
    return NextResponse.json({ error: "Failed to fetch onboarding state" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "onboarding.PATCH" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "onboarding.PATCH" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "onboarding.PATCH" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.onboarding.not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.onboardingFocusArea = parsed.data.focusArea;
    user.onboardingWeeklyTarget = parsed.data.weeklyTarget;
    user.onboardingEncouragementStyle = parsed.data.encouragementStyle;
    user.onboardingCompletedAt = new Date();
    await user.save();

    return NextResponse.json({
      onboarding: toOnboardingPayload(user),
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "onboarding.PATCH" });
    return NextResponse.json({ error: "Failed to save onboarding state" }, { status: 500 });
  }
}
