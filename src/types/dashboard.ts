export type QuestCadenceKind = "oneoff" | "daily" | "weekdays" | "weekly" | "custom";

export type QuestCadence = {
  kind: QuestCadenceKind;
  daysOfWeek?: number[];
  everyNDays?: number;
};

export type QuestNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type QuestLinkKind = "related" | "blocks" | "depends-on";

export type QuestLink = {
  id: string;
  questId: string;
  kind: QuestLinkKind;
};

export type Quest = {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "work" | "study" | "health" | "personal" | "other";
  xpReward: number;
  status: "active" | "completed";
  dueDate?: string | null;
  isDaily?: boolean;
  dailyKey?: string | null;
  parentQuestId?: string | null;
  /** Sort order among sibling subtasks (same parent). */
  order?: number;
  cadence?: QuestCadence;
  lastCompletedDate?: string | null;
  /** Present when API returns second-brain fields (Phase 7.4+). */
  tags?: string[];
  notes?: QuestNote[];
  links?: QuestLink[];
  completedAt?: string | null;
  /** ISO timestamp when present on API payloads (e.g. list + habit-surface). */
  createdAt?: string;
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
  dueDate?: string | null;
  cadence?: QuestCadence;
};

export type UpdateQuestPayload = CreateQuestPayload;

export type CreateChildQuestPayload = CreateQuestPayload & {
  dueDate?: string | null;
};

export type CompleteQuestResponse = {
  xpGained?: number;
  error?: string;
  milestoneReward?: {
    streakMilestone: number;
    bonusXp: number;
  };
  /** Present when completing a parent also completed one-off subtasks. */
  cascadeCompletedOneoffCount?: number;
};
