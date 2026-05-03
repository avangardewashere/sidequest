import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { UserModel } from "@/models/User";
import { countStreakFreezeBalance } from "@/lib/streak-freeze";

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  remindersEnabled: z.boolean().optional(),
  reminderTimeLocal: z
    .union([z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), z.null()])
    .optional(),
  reminderDays: z.array(z.number().int().min(0).max(6)).min(1).max(7).optional(),
  reminderLastFiredOn: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]).optional(),
  streakGraceEnabled: z.boolean().optional(),
});

function toReminderPayload(user: {
  remindersEnabled?: boolean;
  reminderTimeLocal?: string | null;
  reminderDays?: number[];
  reminderLastFiredOn?: string | null;
}) {
  return {
    enabled: Boolean(user.remindersEnabled),
    timeLocal: user.reminderTimeLocal ?? null,
    days: Array.isArray(user.reminderDays) ? user.reminderDays : [1, 2, 3, 4, 5],
    lastFiredOn: user.reminderLastFiredOn ?? null,
  };
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "you.profile.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "you.profile.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.you.profile.not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const streakFreezeBalance = await countStreakFreezeBalance(user._id);

    return NextResponse.json({
      profile: {
        email: user.email,
        displayName: user.displayName,
        level: user.level,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        streakFreezeBalance,
        streakGraceEnabled: Boolean(user.streakGraceEnabled),
        reminders: toReminderPayload(user),
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "you.profile.GET" });
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "you.profile.PATCH" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "you.profile.PATCH" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("api.validation.invalid_payload", { handler: "you.profile.PATCH" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const payload = parsed.data;
    const hasAnySupportedField =
      typeof payload.displayName === "string" ||
      "remindersEnabled" in payload ||
      "reminderTimeLocal" in payload ||
      "reminderDays" in payload ||
      "reminderLastFiredOn" in payload ||
      "streakGraceEnabled" in payload;
    if (!hasAnySupportedField) {
      logger.warn("api.validation.invalid_payload", { handler: "you.profile.PATCH" });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.you.profile.not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (typeof payload.displayName === "string") {
      user.displayName = payload.displayName;
    }
    if (typeof payload.remindersEnabled === "boolean") {
      user.remindersEnabled = payload.remindersEnabled;
    }
    if ("reminderTimeLocal" in payload) {
      user.reminderTimeLocal = payload.reminderTimeLocal ?? null;
    }
    if (Array.isArray(payload.reminderDays)) {
      // Keep weekdays unique and stable in ascending order.
      user.reminderDays = [...new Set(payload.reminderDays)].sort((a, b) => a - b);
    }
    if ("reminderLastFiredOn" in payload) {
      user.reminderLastFiredOn = payload.reminderLastFiredOn ?? null;
    }
    if (typeof payload.streakGraceEnabled === "boolean") {
      user.streakGraceEnabled = payload.streakGraceEnabled;
    }
    await user.save();

    const streakFreezeBalance = await countStreakFreezeBalance(user._id);

    return NextResponse.json({
      profile: {
        email: user.email,
        displayName: user.displayName,
        level: user.level,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        streakFreezeBalance,
        streakGraceEnabled: Boolean(user.streakGraceEnabled),
        reminders: toReminderPayload(user),
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "you.profile.PATCH" });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
