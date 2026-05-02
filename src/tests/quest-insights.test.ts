import { describe, expect, it } from "vitest";
import {
  bestDayOfWeekFromDates,
  buildWeeklyRows,
  computeQuestInsightStreaks,
  longestRunOfConsecutiveDays,
  mondayWeekStartUtcFromDateKey,
} from "@/lib/quest-insights";
import { foldXpByWeek } from "@/lib/metrics-habit-summary";

describe("quest-insights helpers", () => {
  it("mondayWeekStartUtcFromDateKey returns Monday on or before the date", () => {
    expect(mondayWeekStartUtcFromDateKey("2026-05-01")).toBe("2026-04-27");
  });

  it("longestRunOfConsecutiveDays finds max chain", () => {
    expect(longestRunOfConsecutiveDays(["2026-01-01", "2026-01-02", "2026-01-04", "2026-01-05", "2026-01-06"])).toBe(
      3,
    );
  });

  it("bestDayOfWeekFromDates picks highest count", () => {
    const b = bestDayOfWeekFromDates(["2026-05-04", "2026-05-11", "2026-05-18"]);
    expect(b?.day).toBe(1);
    expect(b?.count).toBe(3);
  });

  it("buildWeeklyRows fills weeks in order", () => {
    const rows = buildWeeklyRows(
      [
        { completionDate: "2026-05-04", xpEarned: 10 },
        { completionDate: "2026-05-05", xpEarned: 5 },
      ],
      { kind: "daily" },
      2,
      new Date(Date.UTC(2026, 4, 6)),
    );
    expect(rows).toHaveLength(2);
    expect(rows.some((r) => r.completions > 0)).toBe(true);
  });

  it("computeQuestInsightStreaks uses streakFromLogs for current", () => {
    const pts = [
      { completionDate: "2026-05-02", xpEarned: 1 },
      { completionDate: "2026-05-01", xpEarned: 1 },
    ];
    const { currentStreak, longestStreak } = computeQuestInsightStreaks(pts, { kind: "daily" });
    expect(currentStreak).toBeGreaterThanOrEqual(1);
    expect(longestStreak).toBeGreaterThanOrEqual(2);
  });
});

describe("foldXpByWeek (metrics)", () => {
  it("sums XP into Monday buckets", () => {
    const rows = foldXpByWeek([
      { date: "2026-05-04", value: 10 },
      { date: "2026-05-05", value: 5 },
    ]);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const total = rows.reduce((s, r) => s + r.xp, 0);
    expect(total).toBe(15);
  });
});
