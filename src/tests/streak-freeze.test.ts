import { describe, expect, it } from "vitest";
import {
  addUtcDaysToDateKey,
  graceAdjustedLastCompletedAt,
  evaluateHabitStreakRecover,
  isRecoverWindowOpen,
  utcDateKeysGapDays,
} from "@/lib/streak-freeze";

describe("streak-freeze helpers", () => {
  it("addUtcDaysToDateKey rolls across month boundaries", () => {
    expect(addUtcDaysToDateKey("2026-01-31", 1)).toBe("2026-02-01");
    expect(addUtcDaysToDateKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("utcDateKeysGapDays counts calendar UTC days", () => {
    expect(utcDateKeysGapDays("2026-05-01", "2026-05-03")).toBe(2);
    expect(utcDateKeysGapDays("2026-05-03", "2026-05-01")).toBe(-2);
  });

  describe("graceAdjustedLastCompletedAt", () => {
    it("returns yesterday UTC midnight when grace applies (exactly two-day gap, week not consumed)", () => {
      const now = new Date(Date.UTC(2026, 4, 3, 12, 0, 0)); // May 3 UTC
      const lastCompletedAt = new Date(Date.UTC(2026, 4, 1, 10, 0, 0)); // May 1
      const r = graceAdjustedLastCompletedAt({
        lastCompletedAt,
        streakGraceEnabled: true,
        streakGraceWeekUtc: null,
        now,
      });
      expect(r.consumeGraceWeek).toBe("2026-04-27"); // Monday of week containing May 3
      expect(r.effectiveLastCompletedAt?.toISOString()).toBe(new Date(Date.UTC(2026, 4, 2, 0, 0, 0)).toISOString());
    });

    it("does not consume grace when already used this UTC week", () => {
      const now = new Date(Date.UTC(2026, 4, 3, 12, 0, 0));
      const lastCompletedAt = new Date(Date.UTC(2026, 4, 1, 10, 0, 0));
      const r = graceAdjustedLastCompletedAt({
        lastCompletedAt,
        streakGraceEnabled: true,
        streakGraceWeekUtc: "2026-04-27",
        now,
      });
      expect(r.consumeGraceWeek).toBeNull();
      expect(r.effectiveLastCompletedAt).toBe(lastCompletedAt);
    });

    it("is a no-op when grace disabled", () => {
      const now = new Date(Date.UTC(2026, 4, 3, 12, 0, 0));
      const lastCompletedAt = new Date(Date.UTC(2026, 4, 1, 10, 0, 0));
      const r = graceAdjustedLastCompletedAt({
        lastCompletedAt,
        streakGraceEnabled: false,
        streakGraceWeekUtc: null,
        now,
      });
      expect(r.consumeGraceWeek).toBeNull();
      expect(r.effectiveLastCompletedAt).toBe(lastCompletedAt);
    });
  });

  describe("isRecoverWindowOpen", () => {
    it("is open within 48h after UTC midnight of missed day", () => {
      const missedDateKey = "2026-05-01";
      const t0 = new Date(Date.UTC(2026, 4, 1, 1, 0, 0));
      expect(isRecoverWindowOpen(missedDateKey, t0)).toBe(true);
      const t47 = new Date(Date.UTC(2026, 4, 2, 23, 59, 0));
      expect(isRecoverWindowOpen(missedDateKey, t47)).toBe(true);
    });

    it("closes after 48h from UTC midnight of missed day", () => {
      const missedDateKey = "2026-05-01";
      const closed = new Date(Date.UTC(2026, 4, 3, 0, 0, 1));
      expect(isRecoverWindowOpen(missedDateKey, closed)).toBe(false);
    });
  });

  describe("evaluateHabitStreakRecover", () => {
    it("eligible when last activity was two UTC days ago and window open", () => {
      const now = new Date(Date.UTC(2026, 5, 5, 10, 0, 0)); // June 5
      const r = evaluateHabitStreakRecover({
        lastCompletedDate: "2026-06-03",
        now,
      });
      expect(r).toEqual({ ok: true, missedDateKey: "2026-06-04" });
    });

    it("rejects when gap is not exactly one missed day", () => {
      const now = new Date(Date.UTC(2026, 5, 5, 10, 0, 0));
      expect(evaluateHabitStreakRecover({ lastCompletedDate: "2026-06-04", now }).ok).toBe(false);
      expect(evaluateHabitStreakRecover({ lastCompletedDate: "2026-06-02", now }).ok).toBe(false);
    });
  });
});
