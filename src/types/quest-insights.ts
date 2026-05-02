export type QuestInsightsWeekRow = {
  weekStart: string;
  completions: number;
  xpTotal: number;
  /** Rough intensity vs a daily cadence (completions / 7), capped at 1. */
  completionRate: number;
};

export type QuestInsightsBestDay = {
  day: number;
  label: string;
  count: number;
};

export type QuestInsightsHabitPayload = {
  habit: true;
  questId: string;
  windowWeeks: number;
  currentStreak: number;
  longestStreak: number;
  bestDayOfWeek: QuestInsightsBestDay | null;
  weeks: QuestInsightsWeekRow[];
};

export type QuestInsightsNonHabitPayload = {
  habit: false;
  questId: string;
  message: string;
};

export type QuestInsightsResponse = QuestInsightsHabitPayload | QuestInsightsNonHabitPayload;
