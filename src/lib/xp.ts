export type QuestDifficulty = "easy" | "medium" | "hard";

const XP_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
};

export function getXpReward(difficulty: QuestDifficulty): number {
  return XP_BY_DIFFICULTY[difficulty];
}

export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }
  return Math.floor(50 * Math.pow(level - 1, 2));
}

export function currentLevelProgress(totalXp: number) {
  const level = levelFromTotalXp(totalXp);
  const currentLevelFloor = xpRequiredForLevel(level);
  const nextLevelFloor = xpRequiredForLevel(level + 1);
  const xpIntoLevel = totalXp - currentLevelFloor;
  const xpForNextLevel = nextLevelFloor - currentLevelFloor;

  return {
    level,
    xpIntoLevel,
    xpForNextLevel,
  };
}
