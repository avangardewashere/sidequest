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
      return jsonResponse({ error: "unexpected" }, 404);
    });

    const snap = await fetchTodayDashboard();

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy).toHaveBeenCalledWith("/api/quests?status=active&sort=priority_due");
    expect(snap.profile).toEqual(sampleProfile);
    expect(snap.activeQuests).toEqual([sampleQuest]);
    expect(snap.dailies).toEqual([]);
    expect(snap.dailyKey).toBe("2026-04-25");
  });

  it("returns empty legs when individual requests fail", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/progression")) return jsonResponse({ error: "nope" }, 500);
      if (url.includes("/api/quests")) return jsonResponse({ quests: [sampleQuest] });
      if (url.includes("/api/dailies")) return jsonResponse({ error: "nope" }, 500);
      return jsonResponse({}, 500);
    });

    const snap = await fetchTodayDashboard();

    expect(snap.profile).toBeNull();
    expect(snap.activeQuests).toEqual([sampleQuest]);
    expect(snap.dailies).toEqual([]);
    expect(snap.dailyKey).toBeNull();
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
    };
    const dayKey = `today-dashboard:${new Date().toISOString().slice(0, 10)}`;
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
      return jsonResponse({}, 500);
    });

    const { result } = renderHook(() => useTodayDashboard());

    await waitFor(() => expect(result.current.data?.profile?.level).toBe(3));
    await waitFor(() => expect(result.current.data?.profile?.level).toBe(9));
    expect(result.current.error).toBeNull();
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
    };
    window.localStorage.setItem("today-dashboard:last-known", JSON.stringify(fallbackSnapshot));
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useTodayDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("network down");
    expect(result.current.data?.profile?.level).toBe(7);
    expect(result.current.data?.dailyKey).toBe("last-known");
  });
});
