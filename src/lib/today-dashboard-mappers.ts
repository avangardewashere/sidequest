import type {
  MainQuestData,
  TaskRowData,
  TaskSectionData,
  TodayHeaderData,
  TodayStatItem,
  TodayXpData,
} from "@/components/home/today-focus-mock-data";
import type { Quest } from "@/types/dashboard";
import type { ProgressionProfile, TodayDashboardSnapshot } from "@/types/today-dashboard";

const DIFF_ORDER: Record<Quest["difficulty"], number> = { hard: 0, medium: 1, easy: 2 };

/** Sort for "main" pick: higher difficulty first, then higher XP, stable by _id. */
export function sortActiveQuestsForMain(quests: Quest[]): Quest[] {
  return [...quests].sort((a, b) => {
    const d = DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
    if (d !== 0) return d;
    if (b.xpReward !== a.xpReward) return b.xpReward - a.xpReward;
    return String(a._id).localeCompare(String(b._id));
  });
}

export function difficultyToPriority(difficulty: Quest["difficulty"]): TaskRowData["priority"] {
  if (difficulty === "hard") return "P1";
  if (difficulty === "medium") return "P2";
  return "P3";
}

export function questToTaskRow(quest: Quest, overrides?: Partial<TaskRowData>): TaskRowData {
  return {
    id: quest._id,
    title: quest.title,
    priority: difficultyToPriority(quest.difficulty),
    xp: quest.xpReward,
    done: quest.status === "completed",
    meta: [
      { icon: "note", text: quest.category },
      { icon: "flame", text: quest.difficulty },
      ...(quest.isDaily ? ([{ icon: "calendar", text: "Daily" }] as const) : []),
    ],
    ...overrides,
  };
}

export function profileToTodayXpData(profile: ProgressionProfile | null): TodayXpData {
  if (!profile) {
    return {
      level: 1,
      currentXp: 0,
      nextLevelXp: 1,
      roleLabel: "ADVENTURER",
    };
  }
  const next = Math.max(1, profile.xpForNextLevel);
  return {
    level: profile.level,
    currentXp: profile.xpIntoLevel,
    nextLevelXp: next,
    roleLabel: profile.displayName?.trim() ? profile.displayName.toUpperCase() : "ADVENTURER",
  };
}

export function buildTodayHeaderData(now: Date = new Date()): TodayHeaderData {
  const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "long" });
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    title: "Today",
    dayLabel: dayFmt.format(now).toUpperCase(),
    dateLabel: dateFmt.format(now).toUpperCase(),
  };
}

/**
 * Stats strip: OPEN + STREAK from snapshot/profile; FOCUS is a placeholder until metrics exist.
 */
export function snapshotToTodayStats(snapshot: TodayDashboardSnapshot, profile: ProgressionProfile | null): TodayStatItem[] {
  const streak = profile?.currentStreak ?? 0;
  const nonDailyActive = snapshot.activeQuests.filter((q) => !q.isDaily).length;
  return [
    {
      id: "open",
      label: "OPEN",
      value: String(nonDailyActive),
      icon: "check",
    },
    {
      id: "streak",
      label: "STREAK",
      value: `${streak}d`,
      icon: "flame",
    },
    {
      id: "focus",
      label: "FOCUS",
      value: "—",
      icon: "timer",
    },
  ];
}

export function snapshotToMainQuest(snapshot: TodayDashboardSnapshot): MainQuestData | null {
  const sorted = sortActiveQuestsForMain(snapshot.activeQuests);
  const top = sorted[0];
  if (!top) {
    return null;
  }
  return {
    id: top._id,
    title: top.title,
    dueLabel: top.isDaily ? "Daily" : "Active",
    subtitle: `${top.category} · ${top.difficulty}`,
    progressPct: 0,
    subtaskProgressLabel: "Quest progress",
    rewardXpLabel: `+${top.xpReward} XP`,
    focusTimeLabel: "—",
    ctaLabel: "Open",
  };
}

export function snapshotToTaskSections(snapshot: TodayDashboardSnapshot): TaskSectionData[] {
  const nonDaily = snapshot.activeQuests.filter((q) => !q.isDaily);
  const dailyActive = snapshot.dailies.filter((q) => q.status === "active");

  const inProgress: TaskSectionData = {
    id: "in-progress",
    label: "IN PROGRESS",
    rightLabel: nonDaily.length ? `${nonDaily.length} active` : undefined,
    tasks: nonDaily.map((q) => questToTaskRow(q)),
  };

  const queued: TaskSectionData = {
    id: "queued",
    label: "DAILIES",
    rightLabel: snapshot.dailyKey ? snapshot.dailyKey : undefined,
    tasks: dailyActive.map((q) => questToTaskRow(q)),
  };

  const claimed: TaskSectionData = {
    id: "claimed",
    label: "CLAIMED",
    rightLabel: "Completed quests live in history",
    tasks: [],
  };

  return [inProgress, queued, claimed];
}
