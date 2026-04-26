import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePomodoroCycle } from "@/hooks/usePomodoroCycle";

describe("usePomodoroCycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("runs focus then transitions to break", async () => {
    const onFocusStart = vi.fn().mockResolvedValue(undefined);
    const onFocusStop = vi.fn().mockResolvedValue(undefined);
    const onFocusComplete = vi.fn();

    const { result } = renderHook(() =>
      usePomodoroCycle({
        onFocusStart,
        onFocusStop,
        onFocusComplete,
      }),
    );

    act(() => {
      result.current.setFocusMinutes(1);
      result.current.setBreakMinutes(1);
    });

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state.phase).toBe("focus");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(onFocusStop).toHaveBeenCalledTimes(1);
    expect(onFocusComplete).toHaveBeenCalledTimes(1);
    expect(result.current.state.phase).toBe("break");
    expect(result.current.state.isRunning).toBe(true);
  });

  it("manual stop exits to idle", async () => {
    const onFocusStart = vi.fn().mockResolvedValue(undefined);
    const onFocusStop = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      usePomodoroCycle({
        onFocusStart,
        onFocusStop,
      }),
    );

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state.phase).toBe("focus");

    await act(async () => {
      await result.current.stop();
    });

    expect(result.current.state.phase).toBe("idle");
    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.remainingSec).toBe(0);
    expect(onFocusStop).toHaveBeenCalledTimes(1);
  });
});
