export type Quest = {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "work" | "study" | "health" | "personal" | "other";
  xpReward: number;
  status: "active" | "completed";
  isDaily?: boolean;
  dailyKey?: string | null;
};

export type Profile = {
  displayName: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
};

export type AuthMode = "login" | "register";

export type RegisterPayload = {
  email: string;
  displayName: string;
  password: string;
};

export type CreateQuestPayload = {
  title: string;
  description: string;
  difficulty: Quest["difficulty"];
  category: Quest["category"];
};

export type UpdateQuestPayload = CreateQuestPayload;

export type CompleteQuestResponse = {
  xpGained?: number;
  error?: string;
  milestoneReward?: {
    streakMilestone: number;
    bonusXp: number;
  };
};
