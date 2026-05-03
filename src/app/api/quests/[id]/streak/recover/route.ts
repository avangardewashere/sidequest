import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import {
  isHabitCadence,
  normalizeQuestCadence,
  parseUtcDateKey,
  toUtcDateKey,
} from "@/lib/cadence";
import { replayStreakFromCompletionLogs } from "@/lib/progression";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import {
  countStreakFreezeBalance,
  evaluateHabitStreakRecover,
} from "@/lib/streak-freeze";
import { CompletionLogModel } from "@/models/CompletionLog";
import { QuestModel } from "@/models/Quest";
import { StreakFreezeLogModel } from "@/models/StreakFreezeLog";
import { UserModel } from "@/models/User";

class ApiConflictError extends Error {}
class ApiNotFoundError extends Error {}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.streak.recover.POST" });
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    logger.warn("api.auth.unauthorized", { handler: "quests.id.streak.recover.POST" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await connectToDatabase();
  const dbSession = await mongoose.startSession();

  let payload:
    | {
        ok: true;
        quest: unknown;
        missedDateKey: string;
        progression: {
          currentStreak: number;
          longestStreak: number;
          lastCompletedAt: string | null;
        };
        streakFreezeBalance: number;
      }
    | undefined;

  try {
    await dbSession.withTransaction(async () => {
      const quest = await QuestModel.findOne({ _id: id, createdBy: userId }).session(dbSession);
      if (!quest) {
        throw new ApiNotFoundError("Quest not found");
      }
      const cadence = normalizeQuestCadence(quest);
      if (!isHabitCadence(cadence.kind)) {
        throw new ApiConflictError("Streak recover is only for habit quests");
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const user = await UserModel.findById(userObjectId).session(dbSession);
      if (!user) {
        throw new ApiNotFoundError("User not found");
      }

      const now = new Date();
      const eligibility = evaluateHabitStreakRecover({
        lastCompletedDate: quest.lastCompletedDate,
        now,
      });
      if (!eligibility.ok) {
        throw new ApiConflictError(`not_eligible:${eligibility.reason}`);
      }
      const { missedDateKey } = eligibility;

      const balance = await countStreakFreezeBalance(userObjectId, dbSession);
      if (balance < 1) {
        throw new ApiConflictError("not_eligible:no_tokens");
      }

      const dup = await CompletionLogModel.findOne({
        questId: quest._id,
        userId: userObjectId,
        completionDate: missedDateKey,
      })
        .session(dbSession)
        .lean();
      if (dup) {
        throw new ApiConflictError("already_completed_that_day");
      }

      const completedAt = parseUtcDateKey(missedDateKey);

      await CompletionLogModel.create(
        [
          {
            questId: quest._id,
            userId: userObjectId,
            xpEarned: 0,
            difficulty: quest.difficulty,
            completedAt,
            completionDate: missedDateKey,
          },
        ],
        { session: dbSession },
      );

      await StreakFreezeLogModel.create(
        [
          {
            userId: userObjectId,
            kind: "spend",
            questId: quest._id,
            recoveryForDateKey: missedDateKey,
          },
        ],
        { session: dbSession },
      );

      quest.lastCompletedDate = missedDateKey;
      await quest.save({ session: dbSession });

      const allRemaining = await CompletionLogModel.find({ userId: userObjectId })
        .session(dbSession)
        .select("completedAt")
        .sort({ completedAt: 1 })
        .lean();
      const replay = replayStreakFromCompletionLogs(
        allRemaining.map((l) => ({ completedAt: l.completedAt as Date })),
      );
      user.currentStreak = replay.currentStreak;
      user.longestStreak = replay.longestStreak;
      user.lastCompletedAt = replay.lastCompletedAt;
      await user.save({ session: dbSession });

      const streakFreezeBalance = await countStreakFreezeBalance(userObjectId, dbSession);

      payload = {
        ok: true,
        quest,
        missedDateKey,
        progression: {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastCompletedAt: user.lastCompletedAt ? toUtcDateKey(user.lastCompletedAt) : null,
        },
        streakFreezeBalance,
      };
    });

    if (!payload) {
      return NextResponse.json({ error: "Recover transaction failed" }, { status: 500 });
    }
    logger.info("api.quests.streak.recover.success", { questId: id });
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ApiConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code?: number }).code;
      if (code === 11000) {
        return NextResponse.json({ error: "Duplicate completion" }, { status: 409 });
      }
    }
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.streak.recover.POST",
      questId: id,
    });
    return NextResponse.json({ error: "Failed to recover streak" }, { status: 500 });
  } finally {
    await dbSession.endSession();
  }
}
