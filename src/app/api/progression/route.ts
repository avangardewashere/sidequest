import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { UserModel } from "@/models/User";
import { currentLevelProgress } from "@/lib/xp";
import { countStreakFreezeBalance } from "@/lib/streak-freeze";

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "progression.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "progression.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.progression.user_not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const levelProgress = currentLevelProgress(user.totalXp);
    const streakFreezeBalance = await countStreakFreezeBalance(user._id);

    logger.info("api.progression.success", { userId });
    return NextResponse.json({
      profile: {
        email: user.email,
        displayName: user.displayName,
        totalXp: user.totalXp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        xpIntoLevel: levelProgress.xpIntoLevel,
        xpForNextLevel: levelProgress.xpForNextLevel,
        streakFreezeBalance,
        streakGraceEnabled: Boolean(user.streakGraceEnabled),
      },
    });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "progression.GET" });
    return NextResponse.json({ error: "Failed to fetch progression" }, { status: 500 });
  }
}
