/**
 * Phase 9.1: parents with active children do not award their own xpReward on completion;
 * XP rolls up from leaf completions only.
 */
export function xpEarnedForQuestCompletion(questHasChildren: boolean, baseXpReward: number): number {
  if (questHasChildren) {
    return 0;
  }
  return baseXpReward;
}
