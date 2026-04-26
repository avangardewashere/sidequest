import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { CompletionLogModel } from "@/models/CompletionLog";
import { UserModel } from "@/models/User";

type EncouragementStyle = "gentle" | "direct" | "celebration";
type Trend = "rising" | "steady" | "declining";

const SUPPORTED_WEEKS = 4;

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

function classifyTrend(weeklyCounts: number[], weeklyTarget: number): Trend {
  const last = weeklyCounts[weeklyCounts.length - 1] ?? 0;
  const prior = weeklyCounts.slice(0, -1);
  const avg = prior.length === 0 ? 0 : prior.reduce((sum, value) => sum + value, 0) / prior.length;
  const threshold = 0.2 * weeklyTarget;
  if (last >= avg + threshold) {
    return "rising";
  }
  if (last <= avg - threshold) {
    return "declining";
  }
  return "steady";
}

const TONE_COPY: Record<EncouragementStyle, Record<Trend, { summaryHeadline: string; summaryMessage: string }>> = {
  gentle: {
    rising: {
      summaryHeadline: "Quiet upward trend.",
      summaryMessage: "This week edged ahead of your recent pace. Keep tending the rhythm.",
    },
    steady: {
      summaryHeadline: "Steady four-week rhythm.",
      summaryMessage: "Your weekly cadence has been consistent. Consistency compounds.",
    },
    declining: {
      summaryHeadline: "A softer week, that's okay.",
      summaryMessage: "This week dipped below your recent pace. Be kind, then pick one quest to begin again.",
    },
  },
  direct: {
    rising: {
      summaryHeadline: "Trending up.",
      summaryMessage: "This week beat your prior 3-week average. Keep the cadence.",
    },
    steady: {
      summaryHeadline: "Holding steady.",
      summaryMessage: "Last 4 weeks are within range of your weekly target. Maintain.",
    },
    declining: {
      summaryHeadline: "Trending down.",
      summaryMessage: "This week dropped below your prior 3-week average. Reset and ship one today.",
    },
  },
  celebration: {
    rising: {
      summaryHeadline: "You're climbing!",
      summaryMessage: "This week outpaced the last three. The streak gods are smiling.",
    },
    steady: {
      summaryHeadline: "Reliable hero energy!",
      summaryMessage: "Four weeks of steady completions - that's a saga, not a sprint.",
    },
    declining: {
      summaryHeadline: "Plot twist incoming!",
      summaryMessage: "This week eased off. Shake it off, pick a small quest, and start the comeback arc.",
    },
  },
};

function buildWeekWindows(now: Date, weeks: number): Array<{ start: Date; endExclusive: Date }> {
  const todayUtcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const tomorrowUtcMidnight = new Date(todayUtcMidnight);
  tomorrowUtcMidnight.setUTCDate(tomorrowUtcMidnight.getUTCDate() + 1);

  const windows: Array<{ start: Date; endExclusive: Date }> = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const endExclusive = new Date(tomorrowUtcMidnight);
    endExclusive.setUTCDate(endExclusive.getUTCDate() - 7 * i);
    const start = new Date(endExclusive);
    start.setUTCDate(start.getUTCDate() - 7);
    windows.push({ start, endExclusive });
  }
  return windows;
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "review.historical.GET" });

  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "review.historical.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const weeksParam = url.searchParams.get("weeks");
    if (weeksParam === null || !/^\d+$/.test(weeksParam)) {
      return NextResponse.json(
        { error: "Query parameter 'weeks' is required and must be numeric." },
        { status: 400 },
      );
    }
    const weeks = Number(weeksParam);
    if (weeks !== SUPPORTED_WEEKS) {
      return NextResponse.json(
        { error: `Query parameter 'weeks' must be ${SUPPORTED_WEEKS} in this version.` },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.review.historical.user_not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const weeklyTarget = Math.max(1, user.onboardingWeeklyTarget ?? 5);
    const encouragementStyle = normalizeStyle(user.onboardingEncouragementStyle);

    const windows = buildWeekWindows(new Date(), weeks);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const weeklyBuckets = await Promise.all(
      windows.map(async ({ start, endExclusive }) => {
        const completions = await CompletionLogModel.countDocuments({
          userId: userObjectId,
          completedAt: { $gte: start, $lt: endExclusive },
        });
        const lastInclusiveDay = new Date(endExclusive);
        lastInclusiveDay.setUTCDate(lastInclusiveDay.getUTCDate() - 1);
        const progressPct = Math.min(100, Math.round((completions / weeklyTarget) * 100));
        return {
          rangeStart: toUtcDateKey(start),
          rangeEnd: toUtcDateKey(lastInclusiveDay),
          completions,
          weeklyTarget,
          progressPct,
        };
      }),
    );

    const trend = classifyTrend(
      weeklyBuckets.map((bucket) => bucket.completions),
      weeklyTarget,
    );
    const copy = TONE_COPY[encouragementStyle][trend];

    logger.info("api.review.historical.success", { userId, weeks });
    return NextResponse.json({
      historicalReview: {
        weeks: weeklyBuckets,
        trend,
        encouragementStyle,
        ...copy,
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "review.historical.GET" });
    return NextResponse.json({ error: "Failed to fetch historical review" }, { status: 500 });
  }
}
