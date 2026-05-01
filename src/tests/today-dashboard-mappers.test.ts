import { describe, expect, it } from "vitest";
import {
  buildTodayHeaderData,
  profileToTodayXpData,
  questToTaskRow,
  snapshotToMainQuest,
  snapshotToTaskSections,
  snapshotToTodayStats,
  sortActiveQuestsForMain,
} from "@/lib/today-dashboard-mappers";
import type { Quest } from "@/types/dashboard";
import { emptyTodayHabitSurface, type ProgressionProfile, type TodayDashboardSnapshot } from "@/types/today-dashboard";

const baseQuest = (overrides: Partial<Quest>): Quest => ({
  _id: "q1",
  title: "T",
  description: "d",
  difficulty: "medium",
  category: "work",
  xpReward: 10,
  status: "active",
  ...overrides,
});

describe("profileToTodayXpData", () => {
  it("uses safe defaults when profile is null", () => {
    const xp = profileToTodayXpData(null);
    expect(xp.level).toBe(1);
    expect(xp.nextLevelXp).toBe(1);
    expect(xp.currentXp).toBe(0);
  });

  it("maps progression fields and guards zero next level XP", () => {
    const profile: ProgressionProfile = {
      displayName: "Sam",
      totalXp: 50,
      level: 3,
      currentStreak: 2,
      longestStreak: 5,
      xpIntoLevel: 12,
      xpForNextLevel: 0,
    };
    const xp = profileToTodayXpData(profile);
    expect(xp.level).toBe(3);
    expect(xp.currentXp).toBe(12);
    expect(xp.nextLevelXp).toBe(1);
    expect(xp.roleLabel).toBe("SAM");
  });
});

describe("buildTodayHeaderData", () => {
  it("returns uppercase labels for a fixed date", () => {
    const h = buildTodayHeaderData(new Date("2026-06-15T12:00:00"));
    expect(h.title).toBe("Today");
    expect(h.dayLabel).toContain("MONDAY");
    expect(h.dateLabel).toMatch(/JUN/i);
  });
});

describe("snapshotToTodayStats", () => {
  it("derives open count, streak, and focus minutes", () => {
    const snapshot: TodayDashboardSnapshot = {
      profile: {
        displayName: "A",
        totalXp: 1,
        level: 1,
        currentStreak: 4,
        longestStreak: 4,
        xpIntoLevel: 0,
        xpForNextLevel: 10,
      },
      activeQuests: [baseQuest({ _id: "a", isDaily: false }), baseQuest({ _id: "b", isDaily: true })],
      dailies: [],
      dailyKey: "k",
      focusMinutesLast7d: 73,
      habitSurface: emptyTodayHabitSurface,
    };
    const stats = snapshotToTodayStats(snapshot, snapshot.profile);
    expect(stats[0].value).toBe("1");
    expect(stats[1].value).toBe("4d");
    expect(stats[2].value).toBe("73m");
  });
});

describe("sortActiveQuestsForMain and snapshotToMainQuest", () => {
  it("picks harder higher-XP quest as main", () => {
    const snapshot: TodayDashboardSnapshot = {
      profile: null,
      activeQuests: [
        baseQuest({ _id: "easy", difficulty: "easy", xpReward: 100 }),
        baseQuest({ _id: "hard", difficulty: "hard", xpReward: 5 }),
      ],
      dailies: [],
      dailyKey: null,
      focusMinutesLast7d: 0,
      habitSurface: emptyTodayHabitSurface,
    };
    const sorted = sortActiveQuestsForMain(snapshot.activeQuests);
    expect(sorted[0]._id).toBe("hard");
    const main = snapshotToMainQuest(snapshot);
    expect(main?.id).toBe("hard");
  });

  it("returns null when no active quests", () => {
    const snapshot: TodayDashboardSnapshot = {
      profile: null,
      activeQuests: [],
      dailies: [],
      dailyKey: null,
      focusMinutesLast7d: 0,
      habitSurface: emptyTodayHabitSurface,
    };
    expect(snapshotToMainQuest(snapshot)).toBeNull();
  });
});

describe("snapshotToTaskSections", () => {
  it("splits non-daily vs daily active quests", () => {
    const snapshot: TodayDashboardSnapshot = {
      profile: null,
      activeQuests: [baseQuest({ _id: "n1", isDaily: false }), baseQuest({ _id: "d1", isDaily: true, status: "active" })],
      dailies: [baseQuest({ _id: "d1", isDaily: true, status: "active" })],
      dailyKey: "dk",
      focusMinutesLast7d: 0,
      habitSurface: emptyTodayHabitSurface,
    };
    const sections = snapshotToTaskSections(snapshot);
    expect(sections[0].tasks).toHaveLength(1);
    expect(sections[0].tasks[0].id).toBe("n1");
    expect(sections[1].label).toBe("TODAY QUEUE");
    expect(sections[1].tasks).toHaveLength(1);
    expect(sections[1].tasks[0].id).toBe("d1");
  });

  it("applies difficulty then due-date ordering for non-daily tasks", () => {
    const snapshot: TodayDashboardSnapshot = {
      profile: null,
      activeQuests: [
        baseQuest({ _id: "late-medium", difficulty: "medium", dueDate: "2030-02-01T00:00:00.000Z", isDaily: false }),
        baseQuest({ _id: "hard-no-due", difficulty: "hard", dueDate: null, isDaily: false }),
        baseQuest({ _id: "hard-soon", difficulty: "hard", dueDate: "2030-01-01T00:00:00.000Z", isDaily: false }),
      ],
      dailies: [],
      dailyKey: null,
      focusMinutesLast7d: 0,
      habitSurface: emptyTodayHabitSurface,
    };
    const sections = snapshotToTaskSections(snapshot);
    expect(sections[0].tasks.map((t) => t.id)).toEqual(["hard-soon", "hard-no-due", "late-medium"]);
  });
});

describe("questToTaskRow", () => {
  it("maps quest fields", () => {
    const row = questToTaskRow(
      baseQuest({
        _id: "x",
        title: "Hello",
        difficulty: "hard",
        xpReward: 40,
        isDaily: true,
      }),
    );
    expect(row.id).toBe("x");
    expect(row.priority).toBe("P1");
    expect(row.xp).toBe(40);
    expect(row.meta?.some((m) => m.text === "Daily")).toBe(true);
  });
});
