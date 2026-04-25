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

export type MetricsSummary = {
  range: MetricsRange;
  rangeDays: number;
  completionsByDay: DailyPoint[];
  xpByDay: DailyPoint[];
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
