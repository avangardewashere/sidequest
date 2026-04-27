import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalReminders } from "@/hooks/useLocalReminders";

describe("useLocalReminders", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-27T18:59:00"));
  });

  it("fires once when schedule time is reached", async () => {
    const onReminder = vi.fn().mockResolvedValue(undefined);
    renderHook(() =>
      useLocalReminders(
        {
          enabled: true,
          timeLocal: "19:00",
          days: [1, 2, 3, 4, 5],
          lastFiredOn: null,
        },
        onReminder,
      ),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(onReminder).toHaveBeenCalledTimes(1);
  });

  it("does not fire twice on same date when already marked", async () => {
    const onReminder = vi.fn().mockResolvedValue(undefined);
    renderHook(() =>
      useLocalReminders(
        {
          enabled: true,
          timeLocal: "19:00",
          days: [1, 2, 3, 4, 5],
          lastFiredOn: "2026-04-27",
        },
        onReminder,
      ),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(70_000);
    });
    expect(onReminder).toHaveBeenCalledTimes(0);
  });
});
