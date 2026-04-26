import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { fetchTodayDashboard } from "@/lib/client-api";
import { useTodayDashboard } from "@/hooks/useTodayDashboard";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

const sampleProfile = {
  displayName: "Hero",
  totalXp: 100,
  level: 2,
  currentStreak: 1,
  longestStreak: 3,
  xpIntoLevel: 10,
  xpForNextLevel: 90,
  email: "hero@example.com",
};

const sampleQuest = {
  _id: "quest-1",
  title: "Slay bugs",
  description: "Fix regressions",
  difficulty: "medium" as const,
  category: "work" as const,
  xpReward: 25,
  status: "active" as const,
};

describe("fetchTodayDashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls progression, active quests, and dailies in parallel", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/progression")) return jsonResponse({ profile: sampleProfile });
      if (url.includes("/api/quests") && url.includes("status=active") && url.includes("sort=priority_due")) {
        return jsonResponse({ quests: [sampleQuest] });
      }
      if (url.includes("/api/dailies")) return jsonResponse({ dailyKey: "2026-04-25", dailies: [] });
      if (url.includes("/api/metrics/summary?range=7d")) return jsonResponse({ kpis: { focusMinutesLast7d: 42 } });
      return jsonResponse({ error: "unexpected" }, 404);
    });

    const snap = await fetchTodayDashboard();

    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(fetchSpy).toHaveBeenCalledWith("/api/quests?status=active&sort=priority_due");
    expect(snap.profile).toEqual(sampleProfile);
    expect(snap.activeQuests).toEqual([sampleQuest]);
    expect(snap.dailies).toEqual([]);
    expect(snap.dailyKey).toBe("2026-04-25");
    expect(snap.focusMinutesLast7d).toBe(42);
  });

  it("returns empty legs when individual requests fail", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/progression")) return jsonResponse({ error: "nope" }, 500);
      if (url.includes("/api/quests")) return jsonResponse({ quests: [sampleQuest] });
      if (url.includes("/api/dailies")) return jsonResponse({ error: "nope" }, 500);
      if (url.includes("/api/metrics/summary?range=7d")) return jsonResponse({ error: "nope" }, 500);
      return jsonResponse({}, 500);
    });

    const snap = await fetchTodayDashboard();

    expect(snap.profile).toBeNull();
    expect(snap.activeQuests).toEqual([sampleQuest]);
    expect(snap.dailies).toEqual([]);
    expect(snap.dailyKey).toBeNull();
    expect(snap.focusMinutesLast7d).toBe(0);
  });
});

describe("useTodayDashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("exposes data after fetch settles", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/progression")) return jsonResponse({ profile: sampleProfile });
      if (url.includes("/api/quests") && url.includes("status=active")) {
        return jsonResponse({ quests: [sampleQuest] });
      }
      if (url.includes("/api/dailies")) return jsonResponse({ dailyKey: "k", dailies: [sampleQuest] });
      return jsonResponse({}, 500);
    });

    const { result } = renderHook(() => useTodayDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data?.profile?.displayName).toBe("Hero");
    expect(result.current.data?.dailies).toHaveLength(1);
  });

  it("uses same-day session cache immediately, then refreshes with network snapshot", async () => {
    const cachedSnapshot = {
      profile: {
        ...sampleProfile,
        level: 3,
      },
      activeQuests: [sampleQuest],
      dailies: [],
      dailyKey: "cached-key",
      focusMinutesLast7d: 12,
    };
    const dayKey = `today-dashboard:v2:${new Date().toISOString().slice(0, 10)}`;
    window.sessionStorage.setItem(dayKey, JSON.stringify(cachedSnapshot));

    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/progression")) {
        return jsonResponse({
          profile: {
            ...sampleProfile,
            level: 9,
          },
        });
      }
      if (url.includes("/api/quests") && url.includes("status=active")) {
        return jsonResponse({ quests: [sampleQuest] });
      }
      if (url.includes("/api/dailies")) {
        return jsonResponse({ dailyKey: "live-key", dailies: [] });
      }
      if (url.includes("/api/metrics/summary?range=7d")) {
        return jsonResponse({ kpis: { focusMinutesLast7d: 30 } });
      }
      return jsonResponse({}, 500);
    });

    const { result } = renderHook(() => useTodayDashboard());

    await waitFor(() => expect(result.current.data?.profile?.level).toBe(3));
    await waitFor(() => expect(result.current.data?.profile?.level).toBe(9));
    expect(result.current.error).toBeNull();
    expect(result.current.data?.focusMinutesLast7d).toBe(30);
  });

  it("falls back to last-known local cache when fetch throws", async () => {
    const fallbackSnapshot = {
      profile: {
        ...sampleProfile,
        level: 7,
      },
      activeQuests: [sampleQuest],
      dailies: [sampleQuest],
      dailyKey: "last-known",
      focusMinutesLast7d: 7,
    };
    window.localStorage.setItem("today-dashboard:v2:last-known", JSON.stringify(fallbackSnapshot));
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useTodayDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("network down");
    expect(result.current.data?.profile?.level).toBe(7);
    expect(result.current.data?.dailyKey).toBe("last-known");
    expect(result.current.data?.focusMinutesLast7d).toBe(7);
  });

  it("ignores malformed session cache and uses network snapshot", async () => {
    const dayKey = `today-dashboard:v2:${new Date().toISOString().slice(0, 10)}`;
    window.sessionStorage.setItem(dayKey, "{invalid-json");
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/progression")) {
        return jsonResponse({
          profile: {
            ...sampleProfile,
            level: 8,
          },
        });
      }
      if (url.includes("/api/quests") && url.includes("status=active")) {
        return jsonResponse({ quests: [sampleQuest] });
      }
      if (url.includes("/api/dailies")) {
        return jsonResponse({ dailyKey: "safe-key", dailies: [] });
      }
      if (url.includes("/api/metrics/summary?range=7d")) {
        return jsonResponse({ kpis: { focusMinutesLast7d: 5 } });
      }
      return jsonResponse({}, 500);
    });

    const { result } = renderHook(() => useTodayDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data?.profile?.level).toBe(8);
    expect(result.current.data?.dailyKey).toBe("safe-key");
    expect(result.current.data?.focusMinutesLast7d).toBe(5);
  });

  it("refresh updates state after initial load", async () => {
    let level = 2;
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/progression")) {
        return jsonResponse({
          profile: {
            ...sampleProfile,
            level,
          },
        });
      }
      if (url.includes("/api/quests") && url.includes("status=active")) {
        return jsonResponse({ quests: [sampleQuest] });
      }
      if (url.includes("/api/dailies")) {
        return jsonResponse({ dailyKey: "refresh-key", dailies: [] });
      }
      if (url.includes("/api/metrics/summary?range=7d")) {
        return jsonResponse({ kpis: { focusMinutesLast7d: level === 2 ? 10 : 22 } });
      }
      return jsonResponse({}, 500);
    });

    const { result } = renderHook(() => useTodayDashboard());
    await waitFor(() => expect(result.current.data?.profile?.level).toBe(2));

    level = 4;
    await result.current.refresh();

    await waitFor(() => expect(result.current.data?.profile?.level).toBe(4));
    expect(result.current.data?.focusMinutesLast7d).toBe(22);
    expect(result.current.error).toBeNull();
  });
});
