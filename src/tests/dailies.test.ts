import { buildDailyQuestSet, getUtcDailyKey } from "@/lib/dailies";

describe("daily quest generation", () => {
  it("builds a stable UTC daily key", () => {
    expect(getUtcDailyKey(new Date("2026-04-24T19:30:00.000Z"))).toBe("2026-04-24");
  });

  it("generates deterministic daily quests for same user and date", () => {
    const first = buildDailyQuestSet("user-1", "2026-04-24");
    const second = buildDailyQuestSet("user-1", "2026-04-24");

    expect(first).toEqual(second);
    expect(first).toHaveLength(3);
    expect(new Set(first.map((q) => q.title)).size).toBe(3);
    first.forEach((quest) => {
      expect(quest.cadence).toEqual({ kind: "daily" });
      expect(quest.dailyKey).toBe("2026-04-24");
      expect(quest.xpReward).toBeGreaterThan(0);
    });
  });

  it("changes output when user changes", () => {
    const forUserOne = buildDailyQuestSet("user-1", "2026-04-24");
    const forUserTwo = buildDailyQuestSet("user-2", "2026-04-24");
    expect(forUserOne).not.toEqual(forUserTwo);
  });

  it("changes output when daily key changes for same user", () => {
    const dayOne = buildDailyQuestSet("user-1", "2026-04-24");
    const dayTwo = buildDailyQuestSet("user-1", "2026-04-25");
    expect(dayOne).not.toEqual(dayTwo);
    expect(dayOne).toHaveLength(3);
    expect(dayTwo).toHaveLength(3);
  });

  it("returns idempotent result across repeated calls", () => {
    const calls = Array.from({ length: 5 }, () => buildDailyQuestSet("loop-user", "2026-05-01"));
    for (let index = 1; index < calls.length; index += 1) {
      expect(calls[index]).toEqual(calls[0]);
    }
  });
});
