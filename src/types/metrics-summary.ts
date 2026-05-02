export type MetricsRange = "7d" | "30d" | "90d";

export type DailyPoint = {
  date: string;
  value: number;
};

export type CategoryPoint = {
  category: string;
  count: number;
  xpTotal: number;
};

export type HabitStreakRow = {
  questId: string;
  title: string;
  streak: number;
};

export type WeeklyXpRow = {
  weekStart: string;
  weekLabel: string;
  xp: number;
};

export type MetricsSummary = {
  range: MetricsRange;
  rangeDays: number;
  completionsByDay: DailyPoint[];
  xpByDay: DailyPoint[];
  /** Habit-only completion counts per day (subset of all completions). */
  habitCompletionsByDay: DailyPoint[];
  /** Longest consecutive-day streak per habit quest in the selected range. */
  habitsTopByStreak: HabitStreakRow[];
  /** Total XP from all completions, summed by UTC week (Monday start). */
  weeklyXpByWeek: WeeklyXpRow[];
  byCategory: CategoryPoint[];
  streakHistory: {
    current: number;
    longest: number;
    last7d: Array<{ date: string; active: boolean }>;
  };
  kpis: {
    totalCompletions: number;
    totalXp: number;
    avgXpPerCompletion: number;
    avgCompletionsPerDay: number;
    focusMinutesLast7d: number;
  };
  previousPeriod: {
    totalCompletions: number;
    totalXp: number;
    avgXpPerCompletion: number;
    avgCompletionsPerDay: number;
  };
  last7Days: {
    questsCreated: number;
    questsCompleted: number;
    completionRate: number;
    dailyQuestsCreated: number;
    dailyQuestsCompleted: number;
    dailyCompletionRate: number;
    milestoneRewardsTriggered: number;
    avgXpPerCompletion: number;
    totalXpFromCompletions: number;
    completionEvents: number;
  };
};
