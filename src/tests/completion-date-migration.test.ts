import { describe, expect, it } from "vitest";
import { toUtcDateKey } from "@/lib/migrations/completion-date-migration";

describe("completion-date migration helpers", () => {
  it("formats UTC date key deterministically", () => {
    expect(toUtcDateKey(new Date("2026-04-29T23:59:59.000Z"))).toBe("2026-04-29");
    expect(toUtcDateKey(new Date("2026-04-30T00:00:00.000Z"))).toBe("2026-04-30");
  });

  it("is idempotent for the same timestamp", () => {
    const timestamp = new Date("2026-10-09T05:11:00.000Z");
    expect(toUtcDateKey(timestamp)).toBe(toUtcDateKey(timestamp));
  });
});
