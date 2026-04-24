import {
  currentLevelProgress,
  getXpReward,
  levelFromTotalXp,
  xpRequiredForLevel,
} from "@/lib/xp";

describe("xp helpers", () => {
  it("returns rewards by difficulty", () => {
    expect(getXpReward("easy")).toBe(10);
    expect(getXpReward("medium")).toBe(20);
    expect(getXpReward("hard")).toBe(35);
  });

  it("calculates level thresholds", () => {
    expect(xpRequiredForLevel(1)).toBe(0);
    expect(xpRequiredForLevel(2)).toBe(50);
    expect(xpRequiredForLevel(3)).toBe(200);
  });

  it("handles level lookup at boundaries", () => {
    expect(levelFromTotalXp(0)).toBe(1);
    expect(levelFromTotalXp(49)).toBe(1);
    expect(levelFromTotalXp(50)).toBe(2);
    expect(levelFromTotalXp(200)).toBe(3);
  });

  it("handles larger totals and exact next-level threshold", () => {
    const levelTenThreshold = xpRequiredForLevel(10);
    expect(levelTenThreshold).toBe(4050);
    expect(levelFromTotalXp(levelTenThreshold - 1)).toBe(9);
    expect(levelFromTotalXp(levelTenThreshold)).toBe(10);
  });

  it("returns current level progress details", () => {
    expect(currentLevelProgress(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 50,
    });

    expect(currentLevelProgress(75)).toEqual({
      level: 2,
      xpIntoLevel: 25,
      xpForNextLevel: 150,
    });

    expect(currentLevelProgress(4050)).toEqual({
      level: 10,
      xpIntoLevel: 0,
      xpForNextLevel: 950,
    });
  });
});
