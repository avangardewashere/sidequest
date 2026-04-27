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

const onboardingRoute = await import("@/app/api/onboarding/route");

describe("onboarding route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns 401 without session", async () => {
    mockGetAuthSession.mockResolvedValue(null);
    const response = await onboardingRoute.GET(new Request("http://localhost/api/onboarding"));
    expect(response.status).toBe(401);
  });

  it("GET returns onboarding payload", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockResolvedValue({
      onboardingCompletedAt: null,
      onboardingFocusArea: "work",
      onboardingWeeklyTarget: 5,
      onboardingEncouragementStyle: "gentle",
    });

    const response = await onboardingRoute.GET(new Request("http://localhost/api/onboarding"));
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.onboarding.completed).toBe(false);
    expect(json.onboarding.focusArea).toBe("work");
  });

  it("PATCH validates payload", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    const response = await onboardingRoute.PATCH(
      new Request("http://localhost/api/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ focusArea: "unknown", weeklyTarget: 0, encouragementStyle: "gentle", complete: true }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("PATCH saves onboarding state", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockResolvedValue({
      onboardingCompletedAt: null,
      onboardingFocusArea: null,
      onboardingWeeklyTarget: null,
      onboardingEncouragementStyle: null,
      save,
    });

    const response = await onboardingRoute.PATCH(
      new Request("http://localhost/api/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          focusArea: "learning",
          weeklyTarget: 7,
          encouragementStyle: "direct",
          complete: true,
        }),
      }),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.onboarding.completed).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
