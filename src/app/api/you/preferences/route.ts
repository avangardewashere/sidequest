import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { onboardingPreferencesSchema, toOnboardingPayload } from "@/lib/onboarding-state";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { UserModel } from "@/models/User";

export async function PATCH(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "you.preferences.PATCH" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "you.preferences.PATCH" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = onboardingPreferencesSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "you.preferences.PATCH" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.you.preferences.not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.onboardingFocusArea = parsed.data.focusArea;
    user.onboardingWeeklyTarget = parsed.data.weeklyTarget;
    user.onboardingEncouragementStyle = parsed.data.encouragementStyle;
    await user.save();

    return NextResponse.json({
      onboarding: toOnboardingPayload(user),
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "you.preferences.PATCH" });
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
