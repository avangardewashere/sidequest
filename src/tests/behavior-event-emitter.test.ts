import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordBehaviorEvent } from "@/lib/client-api";

describe("recordBehaviorEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("skips emission when event name is outside allowlist", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));

    await recordBehaviorEvent("not_allowlisted");

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("swallows network failures (best effort)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(
      recordBehaviorEvent("weekly_review_viewed", { rangeStart: "2026-04-20" }),
    ).resolves.toBeUndefined();
  });

  it("shapes payload and strips invalid properties payloads", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));

    await recordBehaviorEvent("suggestion_viewed", {
      reason: "focus_area_match",
      tags: [["nested-array-not-allowed"]],
    } as Record<string, unknown>);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual({ name: "suggestion_viewed" });
  });
});
