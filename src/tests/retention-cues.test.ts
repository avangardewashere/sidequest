import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumeDailyCue,
  consumeLevelUpCelebration,
  localDateKey,
  markCompletionToday,
  readLastCompletionDateKey,
  shouldShowStreakRisk,
} from "@/lib/retention-cues";

describe("retention cues", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("computes local date key with local calendar values", () => {
    const date = new Date(2026, 3, 26, 10, 30, 0);
    expect(localDateKey(date)).toBe("2026-04-26");
  });

  it("marks completion and reads completion date", () => {
    const date = new Date(2026, 3, 26, 10, 30, 0);
    markCompletionToday(date);
    expect(readLastCompletionDateKey()).toBe("2026-04-26");
  });

  it("shows streak risk only after 6 PM with no completion", () => {
    const beforeSix = new Date(2026, 3, 26, 17, 59, 0);
    const afterSix = new Date(2026, 3, 26, 18, 0, 0);
    expect(shouldShowStreakRisk(beforeSix, false)).toBe(false);
    expect(shouldShowStreakRisk(afterSix, false)).toBe(true);
    expect(shouldShowStreakRisk(afterSix, true)).toBe(false);
  });

  it("dedupes level-up celebration by persisted level", () => {
    expect(consumeLevelUpCelebration(4)).toBe(false);
    expect(consumeLevelUpCelebration(4)).toBe(false);
    expect(consumeLevelUpCelebration(5)).toBe(true);
    expect(consumeLevelUpCelebration(5)).toBe(false);
  });

  it("resets dedupe baseline if stored level is higher than current", () => {
    expect(consumeLevelUpCelebration(6)).toBe(false);
    expect(consumeLevelUpCelebration(4)).toBe(false);
    expect(consumeLevelUpCelebration(5)).toBe(true);
  });

  it("shows daily cue once per local day", () => {
    const firstDay = new Date(2026, 3, 26, 9, 0, 0);
    const sameDayLater = new Date(2026, 3, 26, 15, 0, 0);
    const nextDay = new Date(2026, 3, 27, 8, 0, 0);
    expect(consumeDailyCue(firstDay)).toBe(true);
    expect(consumeDailyCue(sameDayLater)).toBe(false);
    expect(consumeDailyCue(nextDay)).toBe(true);
  });

  it("initializes dedupe correctly from invalid stored values", () => {
    localStorage.setItem("sidequest.lastCelebratedLevel", "not-a-number");
    expect(consumeLevelUpCelebration(3)).toBe(false);
    expect(consumeLevelUpCelebration(4)).toBe(true);
  });
});
