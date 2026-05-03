import type { CompleteQuestResponse, Profile } from "@/types/dashboard";

export function getProgressPct(profile: Profile | null): number {
  if (!profile) {
    return 0;
  }
  return Math.round((profile.xpIntoLevel / Math.max(profile.xpForNextLevel, 1)) * 100);
}

export function getCompletionFeedback(data: CompleteQuestResponse): string {
  if (data.milestoneReward && typeof data.xpGained === "number") {
    return `Quest complete! +${data.xpGained} XP | Streak ${data.milestoneReward.streakMilestone} reward: +${data.milestoneReward.bonusXp} bonus XP`;
  }
  return `Quest complete! +${data.xpGained ?? 0} XP`;
}

/** Toast copy for completion API payloads (avoids duplicating “Quest complete” in title + body). */
export function completionToastCopy(data: CompleteQuestResponse): { title: string; message: string } {
  if (data.milestoneReward && typeof data.xpGained === "number") {
    return {
      title: `${data.milestoneReward.streakMilestone}-day streak milestone`,
      message: `+${data.xpGained} XP earned · +${data.milestoneReward.bonusXp} streak bonus`,
    };
  }
  return {
    title: "Quest completed",
    message:
      typeof data.xpGained === "number"
        ? `+${data.xpGained} XP`
        : "Progress and stats were updated.",
  };
}
