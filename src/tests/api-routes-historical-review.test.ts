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

const reviewHistoricalRoute = await import("@/app/api/review/historical/route");

function buildRequest(weeks?: string | null) {
  const url = weeks === undefined
    ? "http://localhost/api/review/historical"
    : weeks === null
      ? "http://localhost/api/review/historical?weeks="
      : `http://localhost/api/review/historical?weeks=${weeks}`;
  return new Request(url);
}

function queueWeeklyCounts(counts: number[]) {
  for (const count of counts) {
    mockCompletionCount.mockResolvedValueOnce(count);
  }
}

describe("historical review route", () => {
  const validUserId = "507f191e810c19729de860ea";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/review/historical requires auth", async () => {
    mockGetAuthSession.mockResolvedValue(null);
    const response = await reviewHistoricalRoute.GET(buildRequest("4"));
    expect(response.status).toBe(401);
  });

  it("GET /api/review/historical rejects missing weeks param", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    const response = await reviewHistoricalRoute.GET(buildRequest(undefined));
    expect(response.status).toBe(400);
  });

  it("GET /api/review/historical rejects unsupported weeks values", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    const responseThree = await reviewHistoricalRoute.GET(buildRequest("3"));
    expect(responseThree.status).toBe(400);

    const responseNonNumeric = await reviewHistoricalRoute.GET(buildRequest("abc"));
    expect(responseNonNumeric.status).toBe(400);
  });

  it("GET /api/review/historical composes 4 buckets with default target", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: null,
      onboardingEncouragementStyle: "gentle",
    });
    queueWeeklyCounts([1, 2, 3, 4]);

    const response = await reviewHistoricalRoute.GET(buildRequest("4"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.historicalReview.weeks).toHaveLength(4);
    expect(json.historicalReview.weeks.map((w: { completions: number }) => w.completions)).toEqual([
      1,
      2,
      3,
      4,
    ]);
    for (const week of json.historicalReview.weeks) {
      expect(week.weeklyTarget).toBe(5);
    }
    expect(json.historicalReview.weeks[3].progressPct).toBe(80);
    expect(json.historicalReview.encouragementStyle).toBe("gentle");
  });

  it("GET /api/review/historical classifies trend as rising", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: 5,
      onboardingEncouragementStyle: "direct",
    });
    queueWeeklyCounts([1, 1, 1, 5]);

    const response = await reviewHistoricalRoute.GET(buildRequest("4"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.historicalReview.trend).toBe("rising");
  });

  it("GET /api/review/historical classifies trend as declining", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: 5,
      onboardingEncouragementStyle: "direct",
    });
    queueWeeklyCounts([5, 5, 5, 1]);

    const response = await reviewHistoricalRoute.GET(buildRequest("4"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.historicalReview.trend).toBe("declining");
  });

  it("GET /api/review/historical classifies trend as steady", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: 5,
      onboardingEncouragementStyle: "direct",
    });
    queueWeeklyCounts([3, 3, 3, 3]);

    const response = await reviewHistoricalRoute.GET(buildRequest("4"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.historicalReview.trend).toBe("steady");
  });

  it("GET /api/review/historical applies encouragement-style branching", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: 5,
      onboardingEncouragementStyle: "celebration",
    });
    queueWeeklyCounts([1, 1, 1, 5]);

    const response = await reviewHistoricalRoute.GET(buildRequest("4"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.historicalReview.encouragementStyle).toBe("celebration");
    expect(json.historicalReview.trend).toBe("rising");
    expect(json.historicalReview.summaryHeadline).toMatch(/climb/i);
  });

  it("GET /api/review/historical defaults unknown encouragement style to gentle", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingWeeklyTarget: 5,
      onboardingEncouragementStyle: "unknown",
    });
    queueWeeklyCounts([2, 2, 2, 2]);

    const response = await reviewHistoricalRoute.GET(buildRequest("4"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.historicalReview.encouragementStyle).toBe("gentle");
    expect(json.historicalReview.trend).toBe("steady");
  });
});
