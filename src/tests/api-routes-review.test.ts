import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockUserFindById = vi.fn();
const mockCompletionCount = vi.fn();

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

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    countDocuments: mockCompletionCount,
  },
}));

const reviewWeeklyRoute = await import("@/app/api/review/weekly/route");

describe("weekly review route", () => {
  const validUserId = "507f191e810c19729de860ea";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/review/weekly requires auth", async () => {
    mockGetAuthSession.mockResolvedValue(null);
    const response = await reviewWeeklyRoute.GET(new Request("http://localhost/api/review/weekly"));
    expect(response.status).toBe(401);
  });

  it("GET /api/review/weekly composes payload and defaults target", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: null,
      onboardingEncouragementStyle: "gentle",
    });
    mockCompletionCount.mockResolvedValue(3);

    const response = await reviewWeeklyRoute.GET(new Request("http://localhost/api/review/weekly"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.weeklyReview.completionsLast7d).toBe(3);
    expect(json.weeklyReview.weeklyTarget).toBe(5);
    expect(json.weeklyReview.progressPct).toBe(60);
  });

  it("GET /api/review/weekly applies encouragement-style branching", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: 4,
      onboardingEncouragementStyle: "celebration",
    });
    mockCompletionCount.mockResolvedValue(4);

    const response = await reviewWeeklyRoute.GET(new Request("http://localhost/api/review/weekly"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.weeklyReview.encouragementStyle).toBe("celebration");
    expect(json.weeklyReview.summaryHeadline).toContain("energy");
  });
});
