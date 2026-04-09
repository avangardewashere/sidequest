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
