import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockUserFindById = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/User", () => ({
  UserModel: {
    findById: mockUserFindById,
  },
}));

const preferencesRoute = await import("@/app/api/you/preferences/route");

describe("you preferences route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PATCH returns 401 without session", async () => {
    mockGetAuthSession.mockResolvedValue(null);
    const response = await preferencesRoute.PATCH(
      new Request("http://localhost/api/you/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          focusArea: "work",
          weeklyTarget: 5,
          encouragementStyle: "gentle",
        }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("PATCH validates payload fields", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    const response = await preferencesRoute.PATCH(
      new Request("http://localhost/api/you/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          focusArea: "invalid",
          weeklyTarget: 22,
          encouragementStyle: "gentle",
        }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("PATCH returns 404 when user does not exist", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockResolvedValue(null);

    const response = await preferencesRoute.PATCH(
      new Request("http://localhost/api/you/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          focusArea: "learning",
          weeklyTarget: 7,
          encouragementStyle: "direct",
        }),
      }),
    );
    expect(response.status).toBe(404);
  });

  it("PATCH updates only onboarding preference fields", async () => {
    const completedAt = new Date("2026-04-20T00:00:00.000Z");
    const save = vi.fn().mockResolvedValue(undefined);
    const user = {
      onboardingCompletedAt: completedAt,
      onboardingFocusArea: "work",
      onboardingWeeklyTarget: 3,
      onboardingEncouragementStyle: "gentle",
      save,
    };
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockResolvedValue(user);

    const response = await preferencesRoute.PATCH(
      new Request("http://localhost/api/you/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          focusArea: "life",
          weeklyTarget: 9,
          encouragementStyle: "celebration",
        }),
      }),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
    expect(user.onboardingCompletedAt).toBe(completedAt);
    expect(json.onboarding).toEqual({
      completed: true,
      completedAt: "2026-04-20T00:00:00.000Z",
      focusArea: "life",
      weeklyTarget: 9,
      encouragementStyle: "celebration",
    });
  });
});
