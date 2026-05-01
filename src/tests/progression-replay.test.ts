import { describe, expect, it } from "vitest";
import { nextStreakInChain, replayStreakFromCompletionLogs } from "@/lib/progression";

describe("nextStreakInChain", () => {
  it("starts at 1 with no prior completion", () => {
    const d = new Date(Date.UTC(2026, 0, 10));
    expect(nextStreakInChain(0, null, d)).toBe(1);
  });

  it("increments when consecutive UTC days", () => {
    const last = new Date(Date.UTC(2026, 0, 10, 12));
    const next = new Date(Date.UTC(2026, 0, 11, 8));
    expect(nextStreakInChain(3, last, next)).toBe(4);
  });

  it("resets after a gap", () => {
    const last = new Date(Date.UTC(2026, 0, 5));
    const next = new Date(Date.UTC(2026, 0, 10));
    expect(nextStreakInChain(5, last, next)).toBe(1);
  });
});

describe("replayStreakFromCompletionLogs", () => {
  it("replays ordered logs into streak profile", () => {
    const a = new Date(Date.UTC(2026, 0, 1));
    const b = new Date(Date.UTC(2026, 0, 2));
    const c = new Date(Date.UTC(2026, 0, 3));
    const r = replayStreakFromCompletionLogs([{ completedAt: a }, { completedAt: b }, { completedAt: c }]);
    expect(r.currentStreak).toBe(3);
    expect(r.longestStreak).toBe(3);
    expect(r.lastCompletedAt?.toISOString()).toBe(c.toISOString());
  });

  it("handles unsorted input", () => {
    const a = new Date(Date.UTC(2026, 0, 1));
    const b = new Date(Date.UTC(2026, 0, 2));
    const r = replayStreakFromCompletionLogs([{ completedAt: b }, { completedAt: a }]);
    expect(r.currentStreak).toBe(2);
  });
});
