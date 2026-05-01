import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { QuestModel } from "@/models/Quest";
import { UserModel } from "@/models/User";
import { CompletionLogModel } from "@/models/CompletionLog";
import { MilestoneRewardLogModel } from "@/models/MilestoneRewardLog";
import { applyQuestCompletion, getMilestoneBonus, replayStreakFromCompletionLogs } from "@/lib/progression";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { levelFromTotalXp } from "@/lib/xp";
import { isHabitCadence, normalizeQuestCadence, toUtcDateKey } from "@/lib/cadence";

class ApiConflictError extends Error {}
class ApiNotFoundError extends Error {}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.complete.PATCH" });
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    logger.warn("api.auth.unauthorized", { handler: "quests.id.complete.PATCH" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await connectToDatabase();
  const dbSession = await mongoose.startSession();

  let responsePayload:
    | {
        quest: unknown;
        progression: {
          totalXp: number;
          level: number;
          currentStreak: number;
          longestStreak: number;
        };
        xpGained: number;
        milestoneReward: { streakMilestone: number; bonusXp: number } | null;
      }
    | undefined;

  try {
    await dbSession.withTransaction(async () => {
      const quest = await QuestModel.findOne({ _id: id, createdBy: userId }).session(
        dbSession,
      );
      if (!quest) {
        throw new ApiNotFoundError("Quest not found");
      }
      const cadence = normalizeQuestCadence(quest);
      const isHabitQuest = isHabitCadence(cadence.kind);
      if (!isHabitQuest && quest.status === "completed") {
        throw new ApiConflictError("Quest already completed");
      }

      const user = await UserModel.findById(userId).session(dbSession);
      if (!user) {
        throw new ApiNotFoundError("User not found");
      }

      const completedAt = new Date();
      const completionDate = toUtcDateKey(completedAt);

      if (!isHabitQuest) {
        quest.status = "completed";
        quest.completedAt = completedAt;
      } else {
        quest.lastCompletedDate = completionDate;
      }

      await quest.save({ session: dbSession });

      const progression = applyQuestCompletion({
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastCompletedAt: user.lastCompletedAt,
        xpGained: quest.xpReward,
      });

      user.totalXp = progression.totalXp;
      user.level = progression.level;
      user.currentStreak = progression.currentStreak;
      user.longestStreak = progression.longestStreak;
      user.lastCompletedAt = progression.lastCompletedAt;

      let milestoneReward: { streakMilestone: number; bonusXp: number } | null = null;
      const bonusXp = getMilestoneBonus(user.currentStreak);
      if (bonusXp) {
        const existingMilestone = await MilestoneRewardLogModel.findOne({
          userId: user._id,
          streakMilestone: user.currentStreak,
        }).session(dbSession);
        if (!existingMilestone) {
          user.totalXp += bonusXp;
          user.level = levelFromTotalXp(user.totalXp);
          milestoneReward = {
            streakMilestone: user.currentStreak,
            bonusXp,
          };
          await MilestoneRewardLogModel.create(
            [
              {
                userId: user._id,
                streakMilestone: user.currentStreak,
                bonusXp,
              },
            ],
            { session: dbSession },
          );
        }
      }

      await user.save({ session: dbSession });

      await CompletionLogModel.create(
        [
          {
            questId: quest._id,
            userId: user._id,
            xpEarned: quest.xpReward,
            difficulty: quest.difficulty,
            completedAt,
            completionDate,
          },
        ],
        { session: dbSession },
      );

      responsePayload = {
        quest,
        progression: {
          totalXp: user.totalXp,
          level: user.level,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
        },
        xpGained: quest.xpReward,
        milestoneReward,
      };
    });

    if (!responsePayload) {
      logger.error("api.quests.complete.empty_response", { questId: id });
      return NextResponse.json(
        { error: "Completion transaction did not produce response" },
        { status: 500 },
      );
    }

    logger.info("api.quests.complete.success", { questId: id });
    return NextResponse.json(responsePayload);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      logger.warn("api.quests.complete.not_found", { questId: id, message: error.message });
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ApiConflictError) {
      logger.warn("api.quests.complete.conflict", { questId: id, message: error.message });
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code?: number }).code;
      if (code === 11000) {
        logger.warn("api.quests.complete.duplicate", { questId: id });
        return NextResponse.json(
          { error: "Duplicate completion event ignored" },
          { status: 409 },
        );
      }
    }

    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.complete.PATCH",
      questId: id,
    });
    return NextResponse.json(
      { error: "Failed to complete quest due to transient server error" },
      { status: 500 },
    );
  } finally {
    await dbSession.endSession();
  }
}

const MILESTONE_UNDO_WINDOW_MS = 8000;

async function removeMilestoneBonusNearCompletion(
  userId: mongoose.Types.ObjectId,
  completedAt: Date,
  dbSession: mongoose.mongo.ClientSession,
): Promise<number> {
  const from = new Date(completedAt.getTime() - MILESTONE_UNDO_WINDOW_MS);
  const to = new Date(completedAt.getTime() + MILESTONE_UNDO_WINDOW_MS);
  const mil = await MilestoneRewardLogModel.findOne({
    userId,
    awardedAt: { $gte: from, $lte: to },
  })
    .sort({ awardedAt: -1 })
    .session(dbSession);
  if (!mil) {
    return 0;
  }
  await MilestoneRewardLogModel.deleteOne({ _id: mil._id }).session(dbSession);
  return mil.bonusXp;
}

/** Undo completion: one-off (no query) removes terminal complete; habit requires `?date=YYYY-MM-DD`. */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.id.complete.DELETE" });
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    logger.warn("api.auth.unauthorized", { handler: "quests.id.complete.DELETE" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date")?.trim();

  await connectToDatabase();
  const dbSession = await mongoose.startSession();

  try {
    let responsePayload:
      | {
          quest: unknown;
          progression: {
            totalXp: number;
            level: number;
            currentStreak: number;
            longestStreak: number;
          };
          xpRemoved: number;
        }
      | undefined;

    await dbSession.withTransaction(async () => {
      const quest = await QuestModel.findOne({ _id: id, createdBy: userId }).session(dbSession);
      if (!quest) {
        throw new ApiNotFoundError("Quest not found");
      }
      const cadence = normalizeQuestCadence(quest);
      const isHabitQuest = isHabitCadence(cadence.kind);
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const user = await UserModel.findById(userObjectId).session(dbSession);
      if (!user) {
        throw new ApiNotFoundError("User not found");
      }

      let xpRemoved = 0;

      if (isHabitQuest) {
        if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
          throw new ApiConflictError("Habit undo requires ?date=YYYY-MM-DD (UTC completion date)");
        }
        const log = await CompletionLogModel.findOne({
          questId: quest._id,
          userId: userObjectId,
          completionDate: dateParam,
        }).session(dbSession);
        if (!log) {
          throw new ApiNotFoundError("No completion for that date");
        }
        xpRemoved = log.xpEarned;
        const anchorCompletedAt =
          log.completedAt instanceof Date ? log.completedAt : new Date(log.completedAt);
        await CompletionLogModel.deleteOne({ _id: log._id }).session(dbSession);

        const bonusRemoved = await removeMilestoneBonusNearCompletion(userObjectId, anchorCompletedAt, dbSession);
        user.totalXp = Math.max(0, user.totalXp - xpRemoved - bonusRemoved);
        user.level = levelFromTotalXp(user.totalXp);

        const remainingForQuest = await CompletionLogModel.find({
          questId: quest._id,
          userId: userObjectId,
        })
          .sort({ completionDate: -1 })
          .limit(1)
          .session(dbSession)
          .lean();
        quest.lastCompletedDate =
          remainingForQuest.length > 0 ? String(remainingForQuest[0].completionDate) : null;
        await quest.save({ session: dbSession });
      } else {
        if (quest.status !== "completed") {
          throw new ApiConflictError("Quest is not completed");
        }
        const logs = await CompletionLogModel.find({ questId: quest._id, userId: userObjectId })
          .session(dbSession)
          .sort({ completedAt: -1 });
        if (logs.length === 0) {
          throw new ApiNotFoundError("No completion log for this quest");
        }
        for (const log of logs) {
          xpRemoved += log.xpEarned;
        }
        const latestLog = logs[0];
        const latestAt =
          latestLog.completedAt instanceof Date ? latestLog.completedAt : new Date(latestLog.completedAt);
        await CompletionLogModel.deleteMany({ questId: quest._id, userId: userObjectId }).session(dbSession);

        const bonusRemoved = await removeMilestoneBonusNearCompletion(userObjectId, latestAt, dbSession);
        user.totalXp = Math.max(0, user.totalXp - xpRemoved - bonusRemoved);
        user.level = levelFromTotalXp(user.totalXp);

        quest.status = "active";
        quest.completedAt = undefined;
        await quest.save({ session: dbSession });
      }

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

      responsePayload = {
        quest,
        progression: {
          totalXp: user.totalXp,
          level: user.level,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
        },
        xpRemoved,
      };
    });

    if (!responsePayload) {
      return NextResponse.json({ error: "Undo transaction failed" }, { status: 500 });
    }
    logger.info("api.quests.complete.undo_success", { questId: id });
    return NextResponse.json(responsePayload);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ApiConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.id.complete.DELETE",
      questId: id,
    });
    return NextResponse.json({ error: "Failed to undo completion" }, { status: 500 });
  } finally {
    await dbSession.endSession();
  }
}
