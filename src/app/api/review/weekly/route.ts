import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { CompletionLogModel } from "@/models/CompletionLog";
import { UserModel } from "@/models/User";

type EncouragementStyle = "gentle" | "direct" | "celebration";

function toUtcDateKey(input: Date): string {
  const year = input.getUTCFullYear();
  const month = `${input.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${input.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeStyle(value: unknown): EncouragementStyle {
  if (value === "direct" || value === "celebration") {
    return value;
  }
  return "gentle";
}

function summaryCopy(style: EncouragementStyle, completionsLast7d: number, weeklyTarget: number) {
  const remaining = Math.max(0, weeklyTarget - completionsLast7d);
  if (style === "direct") {
    if (remaining === 0) {
      return {
        summaryHeadline: "Weekly target complete.",
        summaryMessage: "You hit your goal for this 7-day window.",
      };
    }
    return {
      summaryHeadline: `${remaining} to goal.`,
      summaryMessage: `You have ${remaining} completion${remaining === 1 ? "" : "s"} left to hit your weekly target.`,
    };
  }

  if (style === "celebration") {
    if (remaining === 0) {
      return {
        summaryHeadline: "Quest legend energy unlocked!",
        summaryMessage: "You crushed your weekly target - keep that momentum blazing.",
      };
    }
    return {
      summaryHeadline: "Great streak in motion!",
      summaryMessage: `Only ${remaining} more to turn this week into a full win.`,
    };
  }

  if (remaining === 0) {
    return {
      summaryHeadline: "Steady progress, beautifully done.",
      summaryMessage: "You reached your weekly target. Take a breath and celebrate the consistency.",
    };
  }

  return {
    summaryHeadline: "You're building momentum.",
    summaryMessage: `${remaining} more completion${remaining === 1 ? "" : "s"} to reach your weekly target this week.`,
  };
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "review.weekly.GET" });

  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "review.weekly.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.review.weekly.user_not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    since.setUTCDate(since.getUTCDate() - 6);
    const completionsLast7d = await CompletionLogModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      completedAt: { $gte: since },
    });

    const weeklyTarget = Math.max(1, user.onboardingWeeklyTarget ?? 5);
    const progressPct = Math.min(100, Math.round((completionsLast7d / weeklyTarget) * 100));
    const encouragementStyle = normalizeStyle(user.onboardingEncouragementStyle);
    const copy = summaryCopy(encouragementStyle, completionsLast7d, weeklyTarget);

    logger.info("api.review.weekly.success", { userId });
    return NextResponse.json({
      weeklyReview: {
        rangeStart: toUtcDateKey(since),
        rangeEnd: toUtcDateKey(now),
        completionsLast7d,
        weeklyTarget,
        progressPct,
        encouragementStyle,
        ...copy,
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "review.weekly.GET" });
    return NextResponse.json({ error: "Failed to fetch weekly review" }, { status: 500 });
  }
}
