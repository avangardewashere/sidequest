import { describe, expect, it } from "vitest";
import {
  expectedDateForCadence,
  isDueToday,
  normalizeQuestCadence,
  streakFromLogs,
  toUtcDateKey,
} from "@/lib/cadence";

describe("cadence helpers", () => {
  it("normalizes legacy isDaily to daily cadence", () => {
    const cadence = normalizeQuestCadence({ isDaily: true });
    expect(cadence.kind).toBe("daily");
  });

  it("returns oneoff when cadence and isDaily are absent", () => {
    const cadence = normalizeQuestCadence({});
    expect(cadence.kind).toBe("oneoff");
  });

  it("daily cadence is not due if already completed today", () => {
    const now = new Date("2026-04-29T10:00:00.000Z");
    const due = isDueToday(
      {
        cadence: { kind: "daily" },
        lastCompletedDate: toUtcDateKey(now),
      },
      now,
    );
    expect(due).toBe(false);
  });

  it("custom cadence respects everyNDays interval", () => {
    const now = new Date("2026-04-29T10:00:00.000Z");
    const due = isDueToday(
      {
        cadence: { kind: "custom", everyNDays: 3, daysOfWeek: [1, 2, 3, 4, 5, 6, 0] },
        lastCompletedDate: "2026-04-27",
      },
      now,
    );
    expect(due).toBe(false);
  });

  it("expectedDateForCadence returns UTC key", () => {
    const now = new Date("2026-04-29T10:00:00.000Z");
    expect(expectedDateForCadence({ kind: "weekly", daysOfWeek: [3] }, now)).toBe("2026-04-29");
  });

  it("streakFromLogs computes contiguous daily streak", () => {
    const streak = streakFromLogs(
      [
        { completionDate: "2026-04-29", xpEarned: 10 },
        { completionDate: "2026-04-28", xpEarned: 10 },
        { completionDate: "2026-04-27", xpEarned: 10 },
        { completionDate: "2026-04-25", xpEarned: 10 },
      ],
      { kind: "daily" },
    );
    expect(streak).toBe(3);
  });
});
