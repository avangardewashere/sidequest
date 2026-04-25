import {
  applyQuestCompletion,
  getMilestoneBonus,
  getNextStreak,
  normalizeToUtcDate,
} from "@/lib/progression";

describe("progression helpers", () => {
  it("normalizes to start of UTC date", () => {
    const normalized = normalizeToUtcDate(new Date("2026-04-24T18:17:16.000Z"));
    expect(normalized.toISOString()).toBe("2026-04-24T00:00:00.000Z");
  });

  it("calculates streak transitions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00.000Z"));

    expect(getNextStreak(4, null)).toBe(1);
    expect(getNextStreak(4, new Date("2026-04-24T01:00:00.000Z"))).toBe(4);
    expect(getNextStreak(4, new Date("2026-04-23T05:00:00.000Z"))).toBe(5);
    expect(getNextStreak(4, new Date("2026-04-20T05:00:00.000Z"))).toBe(1);

    vi.useRealTimers();
  });

  it("applies quest completion to xp, level, and streak state", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00.000Z"));

    const result = applyQuestCompletion({
      totalXp: 45,
      currentStreak: 2,
      longestStreak: 2,
      lastCompletedAt: new Date("2026-04-23T09:00:00.000Z"),
      xpGained: 10,
    });

    expect(result.totalXp).toBe(55);
    expect(result.level).toBe(2);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.lastCompletedAt).toBeInstanceOf(Date);

    vi.useRealTimers();
  });

  it("keeps streak on same-day completion and preserves longest streak", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T22:00:00.000Z"));

    const result = applyQuestCompletion({
      totalXp: 200,
      currentStreak: 7,
      longestStreak: 10,
      lastCompletedAt: new Date("2026-04-24T02:00:00.000Z"),
      xpGained: 20,
    });

    expect(result.currentStreak).toBe(7);
    expect(result.longestStreak).toBe(10);
    expect(result.level).toBeGreaterThanOrEqual(3);

    vi.useRealTimers();
  });

  it("resets streak after multi-day gap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00.000Z"));

    const result = applyQuestCompletion({
      totalXp: 20,
      currentStreak: 12,
      longestStreak: 12,
      lastCompletedAt: new Date("2026-04-19T12:00:00.000Z"),
      xpGained: 10,
    });

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(12);

    vi.useRealTimers();
  });

  it("returns milestone bonuses only at configured milestones", () => {
    expect(getMilestoneBonus(3)).toBe(15);
    expect(getMilestoneBonus(7)).toBe(40);
    expect(getMilestoneBonus(14)).toBe(100);
    expect(getMilestoneBonus(2)).toBeNull();
  });
});
