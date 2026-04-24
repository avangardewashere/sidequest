export type TodayHeaderData = {
  title: string;
  dateLabel: string;
  dayLabel: string;
};

export type TodayXpData = {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  roleLabel: string;
};

export type TodayStatItem = {
  id: string;
  label: string;
  value: string;
  icon: "check" | "flame" | "timer" | "target";
};

export type MainQuestData = {
  id: string;
  title: string;
  dueLabel: string;
  subtitle: string;
  progressPct: number;
  subtaskProgressLabel: string;
  rewardXpLabel: string;
  focusTimeLabel: string;
  ctaLabel: string;
};

export type TaskMetaItem = {
  icon: "calendar" | "subtask" | "timer" | "flame" | "note";
  text: string;
};

export type TaskRowData = {
  id: string;
  title: string;
  priority?: "P1" | "P2" | "P3";
  done?: boolean;
  xp?: number;
  meta?: TaskMetaItem[];
};

export type TaskSectionData = {
  id: string;
  label: string;
  rightLabel?: string;
  tasks: TaskRowData[];
};

export type TodayTabItem = {
  id: "today" | "quests" | "calendar" | "codex";
  label: string;
};

export type TodayFocusMockData = {
  header: TodayHeaderData;
  xp: TodayXpData;
  stats: TodayStatItem[];
  mainQuest: MainQuestData;
  sections: TaskSectionData[];
  tabs: TodayTabItem[];
};

export const todayFocusMockData: TodayFocusMockData = {
  header: {
    title: "Today",
    dateLabel: "APR 24, 2026",
    dayLabel: "FRIDAY",
  },
  xp: {
    level: 14,
    currentXp: 2340,
    nextLevelXp: 3000,
    roleLabel: "ADVENTURER",
  },
  stats: [
    { id: "done", label: "DONE", value: "3/8", icon: "check" },
    { id: "streak", label: "STREAK", value: "12d", icon: "flame" },
    { id: "focus", label: "FOCUS", value: "1h 24m", icon: "timer" },
  ],
  mainQuest: {
    id: "main-quest-1",
    title: "Draft Q2 product strategy memo",
    dueLabel: "Due 5:00 PM",
    subtitle: "Active focus block",
    progressPct: 60,
    subtaskProgressLabel: "3 of 5 subtasks",
    rewardXpLabel: "+80 XP on complete",
    focusTimeLabel: "17:42",
    ctaLabel: "Open",
  },
  sections: [
    {
      id: "in-progress",
      label: "IN PROGRESS",
      rightLabel: "1 active",
      tasks: [
        {
          id: "task-1",
          title: "Draft Q2 product strategy memo",
          priority: "P1",
          xp: 80,
          meta: [
            { icon: "subtask", text: "3 of 5 subtasks" },
            { icon: "timer", text: "17:42 left" },
          ],
        },
      ],
    },
    {
      id: "queued",
      label: "QUEUED",
      rightLabel: "Sort by priority",
      tasks: [
        {
          id: "task-2",
          title: "Review design system PR #2847",
          priority: "P1",
          xp: 40,
          meta: [
            { icon: "calendar", text: "10:30 AM" },
            { icon: "subtask", text: "2 subs" },
          ],
        },
        {
          id: "task-3",
          title: "Sync with design lead re: onboarding",
          priority: "P2",
          xp: 30,
          meta: [{ icon: "calendar", text: "2:00 PM" }],
        },
        {
          id: "task-4",
          title: "Finalize week's timesheet",
          priority: "P3",
          xp: 20,
          meta: [{ icon: "timer", text: "15 min" }],
        },
        {
          id: "task-5",
          title: "Respond to 3 blocked threads in #design",
          xp: 15,
          meta: [{ icon: "flame", text: "Quick win" }],
        },
      ],
    },
    {
      id: "claimed",
      label: "CLAIMED",
      rightLabel: "Show",
      tasks: [
        {
          id: "task-6",
          title: "Morning standup notes",
          done: true,
          xp: 15,
          meta: [{ icon: "note", text: "Completed" }],
        },
        {
          id: "task-7",
          title: "Reply to onboarding feedback thread",
          done: true,
          xp: 25,
          meta: [{ icon: "note", text: "Completed" }],
        },
      ],
    },
  ],
  tabs: [
    { id: "today", label: "Today" },
    { id: "quests", label: "Quests" },
    { id: "calendar", label: "Calendar" },
    { id: "codex", label: "Codex" },
  ],
};
