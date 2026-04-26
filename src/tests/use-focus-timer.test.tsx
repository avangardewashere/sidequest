import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetActiveFocusSession = vi.fn();
const mockStartFocusSession = vi.fn();
const mockStopFocusSession = vi.fn();

vi.mock("@/lib/client-api", () => ({
  getActiveFocusSession: mockGetActiveFocusSession,
  startFocusSession: mockStartFocusSession,
  stopFocusSession: mockStopFocusSession,
}));

const { useFocusTimer } = await import("@/hooks/useFocusTimer");

describe("useFocusTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("elapsed ticks while running", async () => {
    mockGetActiveFocusSession.mockResolvedValue({ ok: true, data: { session: null } });
    mockStartFocusSession.mockResolvedValue({
      ok: true,
      data: {
        session: {
          _id: "s1",
          startedAt: new Date().toISOString(),
          questId: null,
        },
      },
    });

    const { result } = renderHook(() => useFocusTimer());
    await waitFor(() => expect(result.current.state.status).toBe("idle"));

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state.status).toBe("running");

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(result.current.state.elapsedSec).toBeGreaterThanOrEqual(2);
  });

  it("hydrate reflects existing open session", async () => {
    mockGetActiveFocusSession.mockResolvedValue({
      ok: true,
      data: {
        session: {
          _id: "s2",
          startedAt: new Date().toISOString(),
          questId: "q1",
        },
      },
    });

    const { result } = renderHook(() => useFocusTimer());
    await waitFor(() => expect(result.current.state.status).toBe("running"));

    expect(result.current.state.questId).toBe("q1");
    expect(result.current.hydratedWithActive).toBe(true);
  });

  it("stop clears state", async () => {
    mockGetActiveFocusSession.mockResolvedValue({
      ok: true,
      data: {
        session: {
          _id: "s3",
          startedAt: new Date().toISOString(),
          questId: null,
        },
      },
    });
    mockStopFocusSession.mockResolvedValue({
      ok: true,
      data: {
        session: {
          _id: "s3",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          durationSec: 5,
          questId: null,
        },
      },
    });

    const { result } = renderHook(() => useFocusTimer());
    await waitFor(() => expect(result.current.state.status).toBe("running"));

    await act(async () => {
      await result.current.stop();
    });

    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.elapsedSec).toBe(0);
  });
});
