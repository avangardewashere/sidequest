import { describe, expect, it } from "vitest";
import {
  currentWeekMondayUtcKey,
  isUtcMonday,
  previousWeekMondayUtcKey,
  reflectionPreview,
} from "@/lib/reflection-week";

describe("reflection-week", () => {
  it("currentWeekMondayUtcKey returns Monday of this UTC week", () => {
    const mon = currentWeekMondayUtcKey(new Date(Date.UTC(2026, 0, 7, 12, 0, 0)));
    expect(mon).toBe("2026-01-05");
  });

  it("previousWeekMondayUtcKey steps back 7 days", () => {
    expect(previousWeekMondayUtcKey("2026-01-12")).toBe("2026-01-05");
  });

  it("isUtcMonday is true only on UTC Monday", () => {
    expect(isUtcMonday(new Date(Date.UTC(2026, 0, 5, 0, 0, 0)))).toBe(true);
    expect(isUtcMonday(new Date(Date.UTC(2026, 0, 6, 0, 0, 0)))).toBe(false);
  });

  it("reflectionPreview trims and takes first line", () => {
    expect(reflectionPreview("  hello\nworld")).toBe("hello");
    expect(reflectionPreview("")).toBe("");
  });

  it("reflectionPreview truncates long first line", () => {
    const long = "x".repeat(200);
    expect(reflectionPreview(long, 50).length).toBeLessThanOrEqual(51);
  });
});
