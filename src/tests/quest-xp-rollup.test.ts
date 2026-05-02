import { describe, expect, it } from "vitest";
import { xpEarnedForQuestCompletion } from "@/lib/quest-xp-rollup";

describe("xpEarnedForQuestCompletion", () => {
  it("returns base XP when quest has no children", () => {
    expect(xpEarnedForQuestCompletion(false, 10)).toBe(10);
    expect(xpEarnedForQuestCompletion(false, 0)).toBe(0);
  });

  it("returns 0 when quest has children (rollup from leaves)", () => {
    expect(xpEarnedForQuestCompletion(true, 10)).toBe(0);
  });
});
