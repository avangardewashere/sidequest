import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { QuestModel } from "@/models/Quest";
import { UserModel } from "@/models/User";
import { CompletionLogModel } from "@/models/CompletionLog";
import { MilestoneRewardLogModel } from "@/models/MilestoneRewardLog";
import { applyQuestCompletion, getMilestoneBonus } from "@/lib/progression";
import { levelFromTotalXp } from "@/lib/xp";

class ApiConflictError extends Error {}
class ApiNotFoundError extends Error {}

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
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
      if (quest.status === "completed") {
        throw new ApiConflictError("Quest already completed");
      }

      const user = await UserModel.findById(userId).session(dbSession);
      if (!user) {
        throw new ApiNotFoundError("User not found");
      }

      quest.status = "completed";
      quest.completedAt = new Date();
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
            completedAt: quest.completedAt,
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
      return NextResponse.json(
        { error: "Completion transaction did not produce response" },
        { status: 500 },
      );
    }

    return NextResponse.json(responsePayload);
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
        return NextResponse.json(
          { error: "Duplicate completion event ignored" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to complete quest due to transient server error" },
      { status: 500 },
    );
  } finally {
    await dbSession.endSession();
  }
}
