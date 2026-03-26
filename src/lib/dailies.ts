import { QuestDifficulty, getXpReward } from "@/lib/xp";

const DAILY_TEMPLATES: Array<{ title: string; difficulty: QuestDifficulty }> = [
  { title: "Clear inbox ambush", difficulty: "easy" },
  { title: "Plan tomorrow's route", difficulty: "easy" },
  { title: "Refactor one rough module", difficulty: "medium" },
  { title: "Focus sprint for 45 minutes", difficulty: "medium" },
  { title: "Finish one hard blocker", difficulty: "hard" },
  { title: "Deep work boss battle", difficulty: "hard" },
];

export function getUtcDailyKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function pickUniqueTemplates(seed: string, count: number) {
  const source = [...DAILY_TEMPLATES];
  const picked: Array<{ title: string; difficulty: QuestDifficulty }> = [];
  let rolling = hashSeed(seed);

  while (picked.length < count && source.length > 0) {
    const idx = rolling % source.length;
    picked.push(source[idx]);
    source.splice(idx, 1);
    rolling = hashSeed(`${rolling}:${seed}:${picked.length}`);
  }

  return picked;
}

export function buildDailyQuestSet(userId: string, dailyKey: string) {
  const seed = `${userId}:${dailyKey}`;
  const templates = pickUniqueTemplates(seed, 3);
  return templates.map((template) => ({
    title: template.title,
    difficulty: template.difficulty,
    xpReward: getXpReward(template.difficulty),
    isDaily: true,
    dailyKey,
  }));
}
